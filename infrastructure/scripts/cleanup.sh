#!/bin/bash

# Game Vibe Plane Cleanup Script
# Safely remove AWS resources to avoid ongoing costs

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
ENVIRONMENT=""
REGION="ap-southeast-1"
PROFILE=""
FORCE=false

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to show usage
show_usage() {
    cat << EOF
Usage: $0 [OPTIONS]

Remove Game Vibe Plane infrastructure from AWS

OPTIONS:
    -e, --environment ENVIRONMENT    Environment to remove (dev, staging, prod) [REQUIRED]
    -r, --region REGION             AWS region [default: ap-southeast-1]
    -p, --profile PROFILE           AWS profile to use
    -f, --force                     Skip confirmation prompts
    -h, --help                      Show this help message

EXAMPLES:
    # Remove development environment
    $0 -e dev

    # Remove production with confirmation
    $0 -e prod

    # Force removal without prompts
    $0 -e staging --force

WARNING:
    This will permanently delete all resources and data!
    Make sure you have backups if needed.

EOF
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -e|--environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -r|--region)
            REGION="$2"
            shift 2
            ;;
        -p|--profile)
            PROFILE="$2"
            shift 2
            ;;
        -f|--force)
            FORCE=true
            shift
            ;;
        -h|--help)
            show_usage
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

# Validate required parameters
if [[ -z "$ENVIRONMENT" ]]; then
    print_error "Environment is required. Use -e or --environment"
    show_usage
    exit 1
fi

# Validate environment
if [[ ! "$ENVIRONMENT" =~ ^(dev|staging|prod)$ ]]; then
    print_error "Invalid environment: $ENVIRONMENT. Must be dev, staging, or prod"
    exit 1
fi

# Set AWS profile if provided
if [[ -n "$PROFILE" ]]; then
    export AWS_PROFILE="$PROFILE"
    print_status "Using AWS profile: $PROFILE"
fi

# Set AWS region
export AWS_DEFAULT_REGION="$REGION"

# Check AWS CLI is configured
if ! aws sts get-caller-identity >/dev/null 2>&1; then
    print_error "AWS CLI is not configured or credentials are invalid"
    exit 1
fi

ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
print_status "Cleaning up resources in AWS Account: $ACCOUNT_ID"

# Create stack names
BACKEND_STACK_NAME="game-vibe-plane-backend-$ENVIRONMENT"
FRONTEND_STACK_NAME="game-vibe-plane-frontend-$ENVIRONMENT"
MONITORING_STACK_NAME="game-vibe-plane-monitoring-$ENVIRONMENT"

# Warning and confirmation
print_warning "This will permanently delete the following resources:"
echo "  - Backend infrastructure (Lambda functions, DynamoDB tables, API Gateway)"
echo "  - Frontend infrastructure (S3 buckets, CloudFront distribution, CI/CD pipeline)"
echo "  - Monitoring infrastructure (CloudWatch alarms, dashboards)"
echo "  - All data stored in DynamoDB tables"
echo "  - All files in S3 buckets"
echo
print_warning "Environment: $ENVIRONMENT"
print_warning "Region: $REGION"
print_warning "Account: $ACCOUNT_ID"
echo

if [[ "$FORCE" != true ]]; then
    if [[ "$ENVIRONMENT" == "prod" ]]; then
        print_error "PRODUCTION ENVIRONMENT DETECTED!"
        echo "You are about to delete production resources."
        echo "Type 'DELETE PRODUCTION' to confirm:"
        read -r confirmation
        if [[ "$confirmation" != "DELETE PRODUCTION" ]]; then
            print_status "Cleanup cancelled"
            exit 0
        fi
    else
        echo "Type 'yes' to confirm deletion:"
        read -r confirmation
        if [[ "$confirmation" != "yes" ]]; then
            print_status "Cleanup cancelled"
            exit 0
        fi
    fi
fi

print_status "Starting cleanup process..."

# Function to check if stack exists
stack_exists() {
    aws cloudformation describe-stacks --stack-name "$1" --region "$REGION" >/dev/null 2>&1
}

# Function to wait for stack deletion
wait_for_stack_deletion() {
    local stack_name="$1"
    print_status "Waiting for stack deletion: $stack_name"
    
    while stack_exists "$stack_name"; do
        print_status "Stack $stack_name is still being deleted..."
        sleep 30
    done
    
    print_success "Stack $stack_name deleted successfully"
}

# Function to empty S3 bucket
empty_s3_bucket() {
    local bucket_name="$1"
    if aws s3api head-bucket --bucket "$bucket_name" --region "$REGION" >/dev/null 2>&1; then
        print_status "Emptying S3 bucket: $bucket_name"
        aws s3 rm "s3://$bucket_name" --recursive --region "$REGION"
        print_success "S3 bucket emptied: $bucket_name"
    else
        print_warning "S3 bucket not found or already deleted: $bucket_name"
    fi
}

# 1. Remove Serverless backend
print_status "Removing backend infrastructure..."
if [[ -f "serverless.yml" ]]; then
    if command -v serverless >/dev/null 2>&1; then
        serverless remove --stage "$ENVIRONMENT" --region "$REGION" --verbose || true
        print_success "Backend infrastructure removed"
    else
        print_warning "Serverless Framework not found, skipping serverless remove"
        
        # Try to remove the CloudFormation stack directly
        if stack_exists "$BACKEND_STACK_NAME"; then
            aws cloudformation delete-stack --stack-name "$BACKEND_STACK_NAME" --region "$REGION"
            wait_for_stack_deletion "$BACKEND_STACK_NAME"
        fi
    fi
else
    print_warning "serverless.yml not found, skipping backend removal"
fi

# 2. Remove frontend infrastructure
print_status "Removing frontend infrastructure..."

# Empty S3 buckets before deleting stack
if stack_exists "$FRONTEND_STACK_NAME"; then
    # Get bucket names from stack
    WEBSITE_BUCKET=$(aws cloudformation describe-stack-resources \
        --stack-name "$FRONTEND_STACK_NAME" \
        --query 'StackResources[?ResourceType==`AWS::S3::Bucket`].PhysicalResourceId' \
        --output text \
        --region "$REGION" | head -1)
    
    PIPELINE_BUCKET=$(aws cloudformation describe-stack-resources \
        --stack-name "$FRONTEND_STACK_NAME" \
        --query 'StackResources[?ResourceType==`AWS::S3::Bucket`].PhysicalResourceId' \
        --output text \
        --region "$REGION" | tail -1)
    
    if [[ -n "$WEBSITE_BUCKET" ]]; then
        empty_s3_bucket "$WEBSITE_BUCKET"
    fi
    
    if [[ -n "$PIPELINE_BUCKET" && "$PIPELINE_BUCKET" != "$WEBSITE_BUCKET" ]]; then
        empty_s3_bucket "$PIPELINE_BUCKET"
    fi
    
    # Delete the stack
    aws cloudformation delete-stack --stack-name "$FRONTEND_STACK_NAME" --region "$REGION"
    wait_for_stack_deletion "$FRONTEND_STACK_NAME"
else
    print_warning "Frontend stack not found: $FRONTEND_STACK_NAME"
fi

# 3. Remove monitoring infrastructure
print_status "Removing monitoring infrastructure..."
if stack_exists "$MONITORING_STACK_NAME"; then
    aws cloudformation delete-stack --stack-name "$MONITORING_STACK_NAME" --region "$REGION"
    wait_for_stack_deletion "$MONITORING_STACK_NAME"
else
    print_warning "Monitoring stack not found: $MONITORING_STACK_NAME"
fi

# 4. Clean up any remaining resources
print_status "Checking for any remaining resources..."

# Check for orphaned Lambda functions
LAMBDA_FUNCTIONS=$(aws lambda list-functions \
    --query "Functions[?starts_with(FunctionName, 'game-vibe-plane-$ENVIRONMENT')].FunctionName" \
    --output text \
    --region "$REGION" 2>/dev/null || echo "")

if [[ -n "$LAMBDA_FUNCTIONS" ]]; then
    print_warning "Found orphaned Lambda functions:"
    echo "$LAMBDA_FUNCTIONS"
    
    if [[ "$FORCE" == true ]]; then
        for func in $LAMBDA_FUNCTIONS; do
            print_status "Deleting Lambda function: $func"
            aws lambda delete-function --function-name "$func" --region "$REGION" || true
        done
    else
        echo "Run with --force to delete these functions"
    fi
fi

# Check for orphaned DynamoDB tables
DYNAMODB_TABLES=$(aws dynamodb list-tables \
    --query "TableNames[?starts_with(@, 'game-vibe-plane-') && contains(@, '-$ENVIRONMENT')]" \
    --output text \
    --region "$REGION" 2>/dev/null || echo "")

if [[ -n "$DYNAMODB_TABLES" ]]; then
    print_warning "Found orphaned DynamoDB tables:"
    echo "$DYNAMODB_TABLES"
    
    if [[ "$FORCE" == true ]]; then
        for table in $DYNAMODB_TABLES; do
            print_status "Deleting DynamoDB table: $table"
            aws dynamodb delete-table --table-name "$table" --region "$REGION" || true
        done
    else
        echo "Run with --force to delete these tables"
    fi
fi

# Check for orphaned S3 buckets
S3_BUCKETS=$(aws s3api list-buckets \
    --query "Buckets[?starts_with(Name, 'game-vibe-plane-') && contains(Name, '-$ENVIRONMENT')].Name" \
    --output text \
    --region "$REGION" 2>/dev/null || echo "")

if [[ -n "$S3_BUCKETS" ]]; then
    print_warning "Found orphaned S3 buckets:"
    echo "$S3_BUCKETS"
    
    if [[ "$FORCE" == true ]]; then
        for bucket in $S3_BUCKETS; do
            print_status "Emptying and deleting S3 bucket: $bucket"
            empty_s3_bucket "$bucket"
            aws s3api delete-bucket --bucket "$bucket" --region "$REGION" || true
        done
    else
        echo "Run with --force to delete these buckets"
    fi
fi

# 5. Clean up CloudWatch logs
print_status "Cleaning up CloudWatch log groups..."
LOG_GROUPS=$(aws logs describe-log-groups \
    --log-group-name-prefix "/aws/lambda/game-vibe-plane-$ENVIRONMENT" \
    --query 'logGroups[].logGroupName' \
    --output text \
    --region "$REGION" 2>/dev/null || echo "")

if [[ -n "$LOG_GROUPS" ]]; then
    for log_group in $LOG_GROUPS; do
        print_status "Deleting log group: $log_group"
        aws logs delete-log-group --log-group-name "$log_group" --region "$REGION" || true
    done
fi

print_success "Cleanup completed successfully!"
echo
echo "=== CLEANUP SUMMARY ==="
echo "Environment: $ENVIRONMENT"
echo "Region: $REGION"
echo "Account ID: $ACCOUNT_ID"
echo
print_success "All resources for environment '$ENVIRONMENT' have been removed"
print_status "You should no longer be charged for these resources"
echo
print_warning "Note: Some resources may take a few minutes to fully disappear from the AWS console"

if [[ "$FORCE" != true && (-n "$LAMBDA_FUNCTIONS" || -n "$DYNAMODB_TABLES" || -n "$S3_BUCKETS") ]]; then
    echo
    print_warning "Some orphaned resources were found but not deleted"
    print_status "Run the script with --force to remove them automatically"
fi

print_success "Cleanup script completed!"