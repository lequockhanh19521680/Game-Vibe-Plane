#!/bin/bash

# Game Vibe Plane Deployment Script
# Optimized AWS deployment following Well-Architected Framework

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
ENVIRONMENT="dev"
REGION="ap-southeast-1"
PROFILE=""
SKIP_FRONTEND=false
SKIP_BACKEND=false
NOTIFICATION_EMAIL=""

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

Deploy Game Vibe Plane infrastructure to AWS

OPTIONS:
    -e, --environment ENVIRONMENT    Environment to deploy to (dev, staging, prod) [default: dev]
    -r, --region REGION             AWS region [default: ap-southeast-1]
    -p, --profile PROFILE           AWS profile to use
    --skip-frontend                 Skip frontend deployment
    --skip-backend                  Skip backend deployment
    --notification-email EMAIL      Email for monitoring alerts
    -h, --help                      Show this help message

EXAMPLES:
    # Deploy to development
    $0 -e dev

    # Deploy to production with monitoring
    $0 -e prod --notification-email admin@example.com

    # Deploy only backend to staging
    $0 -e staging --skip-frontend

    # Deploy with specific AWS profile
    $0 -e prod -p production-profile

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
        --skip-frontend)
            SKIP_FRONTEND=true
            shift
            ;;
        --skip-backend)
            SKIP_BACKEND=true
            shift
            ;;
        --notification-email)
            NOTIFICATION_EMAIL="$2"
            shift 2
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

print_status "Starting deployment to $ENVIRONMENT environment in $REGION region"

# Check AWS CLI is configured
if ! aws sts get-caller-identity >/dev/null 2>&1; then
    print_error "AWS CLI is not configured or credentials are invalid"
    exit 1
fi

ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
print_status "Deploying to AWS Account: $ACCOUNT_ID"

# Create stack names
BACKEND_STACK_NAME="game-vibe-plane-backend-$ENVIRONMENT"
FRONTEND_STACK_NAME="game-vibe-plane-frontend-$ENVIRONMENT"
MONITORING_STACK_NAME="game-vibe-plane-monitoring-$ENVIRONMENT"

# Check if we're in the right directory
if [[ ! -f "serverless.yml" ]]; then
    print_error "serverless.yml not found. Please run this script from the infrastructure directory"
    exit 1
fi

# Install dependencies
print_status "Installing dependencies..."
if [[ -f "package.json" ]]; then
    npm install
    print_success "Dependencies installed"
else
    print_warning "No package.json found, skipping npm install"
fi

# Deploy backend infrastructure
if [[ "$SKIP_BACKEND" != true ]]; then
    print_status "Deploying backend infrastructure..."
    
    # Deploy using Serverless Framework
    if command -v serverless >/dev/null 2>&1; then
        serverless deploy --stage "$ENVIRONMENT" --region "$REGION" --verbose
        print_success "Backend infrastructure deployed successfully"
        
        # Get API Gateway URL
        API_URL=$(serverless info --stage "$ENVIRONMENT" --region "$REGION" | grep -oP 'https://[a-zA-Z0-9]+\.execute-api\.[a-zA-Z0-9-]+\.amazonaws\.com/[a-zA-Z0-9]+' | head -1)
        if [[ -n "$API_URL" ]]; then
            print_success "Backend API URL: $API_URL"
            
            # Update frontend configuration
            if [[ -f "../frontend/js/config/endpoints.js" ]]; then
                print_status "Updating frontend configuration..."
                sed -i.bak "s|API_BASE_URL:.*|API_BASE_URL: '$API_URL',|" ../frontend/js/config/endpoints.js
                print_success "Frontend configuration updated"
            fi
        fi
    else
        print_error "Serverless Framework not found. Please install it: npm install -g serverless"
        exit 1
    fi
else
    print_warning "Skipping backend deployment"
fi

# Deploy frontend infrastructure
if [[ "$SKIP_FRONTEND" != true ]]; then
    print_status "Deploying frontend infrastructure..."
    
    # Check if CodeStar connection exists (required for frontend pipeline)
    CODESTAR_CONNECTION_ARN=""
    if [[ "$ENVIRONMENT" == "prod" ]]; then
        print_warning "Production deployment requires a CodeStar connection to GitHub"
        print_status "Please create a CodeStar connection in the AWS Console and provide the ARN"
        read -p "CodeStar Connection ARN (or press Enter to skip): " CODESTAR_CONNECTION_ARN
    fi
    
    if [[ -n "$CODESTAR_CONNECTION_ARN" || "$ENVIRONMENT" != "prod" ]]; then
        # Deploy frontend CloudFormation stack
        FRONTEND_PARAMS="ParameterKey=Environment,ParameterValue=$ENVIRONMENT"
        
        if [[ -n "$CODESTAR_CONNECTION_ARN" ]]; then
            FRONTEND_PARAMS="$FRONTEND_PARAMS ParameterKey=CodeStarConnectionArn,ParameterValue=$CODESTAR_CONNECTION_ARN"
        fi
        
        aws cloudformation deploy \
            --template-file cloudformation/frontend-infrastructure.yml \
            --stack-name "$FRONTEND_STACK_NAME" \
            --parameter-overrides $FRONTEND_PARAMS \
            --capabilities CAPABILITY_NAMED_IAM \
            --region "$REGION"
        
        print_success "Frontend infrastructure deployed successfully"
        
        # Get website URL
        WEBSITE_URL=$(aws cloudformation describe-stacks \
            --stack-name "$FRONTEND_STACK_NAME" \
            --query 'Stacks[0].Outputs[?OutputKey==`WebsiteURL`].OutputValue' \
            --output text \
            --region "$REGION")
        
        if [[ -n "$WEBSITE_URL" ]]; then
            print_success "Frontend URL: $WEBSITE_URL"
        fi
    else
        print_warning "Skipping frontend deployment (no CodeStar connection provided)"
    fi
else
    print_warning "Skipping frontend deployment"
fi

# Deploy monitoring infrastructure
if [[ "$ENVIRONMENT" == "prod" || -n "$NOTIFICATION_EMAIL" ]]; then
    print_status "Deploying monitoring infrastructure..."
    
    MONITORING_PARAMS="ParameterKey=Environment,ParameterValue=$ENVIRONMENT ParameterKey=ServiceName,ParameterValue=game-vibe-plane"
    
    if [[ -n "$NOTIFICATION_EMAIL" ]]; then
        MONITORING_PARAMS="$MONITORING_PARAMS ParameterKey=NotificationEmail,ParameterValue=$NOTIFICATION_EMAIL"
    fi
    
    aws cloudformation deploy \
        --template-file cloudformation/monitoring.yml \
        --stack-name "$MONITORING_STACK_NAME" \
        --parameter-overrides $MONITORING_PARAMS \
        --capabilities CAPABILITY_IAM \
        --region "$REGION"
    
    print_success "Monitoring infrastructure deployed successfully"
    
    # Get dashboard URL
    DASHBOARD_URL=$(aws cloudformation describe-stacks \
        --stack-name "$MONITORING_STACK_NAME" \
        --query 'Stacks[0].Outputs[?OutputKey==`DashboardURL`].OutputValue' \
        --output text \
        --region "$REGION")
    
    if [[ -n "$DASHBOARD_URL" ]]; then
        print_success "Monitoring Dashboard: $DASHBOARD_URL"
    fi
else
    print_warning "Skipping monitoring deployment (not production and no notification email provided)"
fi

# Display deployment summary
print_success "Deployment completed successfully!"
echo
echo "=== DEPLOYMENT SUMMARY ==="
echo "Environment: $ENVIRONMENT"
echo "Region: $REGION"
echo "Account ID: $ACCOUNT_ID"
echo

if [[ "$SKIP_BACKEND" != true ]]; then
    echo "Backend Stack: $BACKEND_STACK_NAME"
    if [[ -n "$API_URL" ]]; then
        echo "API URL: $API_URL"
    fi
fi

if [[ "$SKIP_FRONTEND" != true ]]; then
    echo "Frontend Stack: $FRONTEND_STACK_NAME"
    if [[ -n "$WEBSITE_URL" ]]; then
        echo "Website URL: $WEBSITE_URL"
    fi
fi

if [[ "$ENVIRONMENT" == "prod" || -n "$NOTIFICATION_EMAIL" ]]; then
    echo "Monitoring Stack: $MONITORING_STACK_NAME"
    if [[ -n "$DASHBOARD_URL" ]]; then
        echo "Dashboard URL: $DASHBOARD_URL"
    fi
fi

echo
print_status "Next steps:"
echo "1. Test the API endpoints"
echo "2. Verify the frontend is working"
echo "3. Check CloudWatch metrics and alarms"
if [[ "$ENVIRONMENT" == "prod" ]]; then
    echo "4. Set up custom domain (if needed)"
    echo "5. Configure WAF rules (recommended for production)"
fi

print_success "Deployment script completed!"