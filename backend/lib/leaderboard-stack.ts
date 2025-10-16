import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import * as path from 'path';

export class LeaderboardStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // DynamoDB Table for storing game sessions
    const gameSessionsTable = new dynamodb.Table(this, 'GameSessionsTable', {
      tableName: 'GameVibePlane-GameSessions',
      partitionKey: {
        name: 'sessionId',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'timestamp',
        type: dynamodb.AttributeType.NUMBER,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN, // Keep data on stack deletion
      pointInTimeRecovery: true,
      stream: dynamodb.StreamViewType.NEW_AND_OLD_IMAGES,
    });

    // Global Secondary Index for leaderboard queries (by score)
    gameSessionsTable.addGlobalSecondaryIndex({
      indexName: 'ScoreIndex',
      partitionKey: {
        name: 'gameType',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'score',
        type: dynamodb.AttributeType.NUMBER,
      },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // Global Secondary Index for country-based queries
    gameSessionsTable.addGlobalSecondaryIndex({
      indexName: 'CountryIndex',
      partitionKey: {
        name: 'country',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'score',
        type: dynamodb.AttributeType.NUMBER,
      },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // Lambda function for submitting game scores
    const submitScoreLambda = new lambda.Function(this, 'SubmitScoreFunction', {
      functionName: 'GameVibePlane-SubmitScore',
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambda/submit-score')),
      environment: {
        TABLE_NAME: gameSessionsTable.tableName,
      },
      timeout: cdk.Duration.seconds(10),
      memorySize: 256,
    });

    // Lambda function for getting leaderboard
    const getLeaderboardLambda = new lambda.Function(this, 'GetLeaderboardFunction', {
      functionName: 'GameVibePlane-GetLeaderboard',
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambda/get-leaderboard')),
      environment: {
        TABLE_NAME: gameSessionsTable.tableName,
      },
      timeout: cdk.Duration.seconds(10),
      memorySize: 256,
    });

    // Grant DynamoDB permissions to Lambda functions
    gameSessionsTable.grantWriteData(submitScoreLambda);
    gameSessionsTable.grantReadData(getLeaderboardLambda);

    // Create API Gateway
    const api = new apigateway.RestApi(this, 'LeaderboardAPI', {
      restApiName: 'GameVibePlane Leaderboard API',
      description: 'API for Game Vibe Plane Leaderboard',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: [
          'Content-Type',
          'X-Amz-Date',
          'Authorization',
          'X-Api-Key',
          'X-Amz-Security-Token',
        ],
      },
      deployOptions: {
        stageName: 'prod',
        throttlingRateLimit: 100,
        throttlingBurstLimit: 200,
      },
    });

    // API Gateway resources and methods
    const submitScoreResource = api.root.addResource('submit-score');
    submitScoreResource.addMethod(
      'POST',
      new apigateway.LambdaIntegration(submitScoreLambda),
      {
        methodResponses: [{ statusCode: '200' }, { statusCode: '400' }, { statusCode: '500' }],
      }
    );

    const leaderboardResource = api.root.addResource('leaderboard');
    leaderboardResource.addMethod(
      'GET',
      new apigateway.LambdaIntegration(getLeaderboardLambda),
      {
        methodResponses: [{ statusCode: '200' }, { statusCode: '400' }, { statusCode: '500' }],
      }
    );

    // Outputs
    new cdk.CfnOutput(this, 'ApiEndpoint', {
      value: api.url,
      description: 'API Gateway endpoint URL',
      exportName: 'GameVibePlane-ApiEndpoint',
    });

    new cdk.CfnOutput(this, 'TableName', {
      value: gameSessionsTable.tableName,
      description: 'DynamoDB table name',
      exportName: 'GameVibePlane-TableName',
    });
  }
}
