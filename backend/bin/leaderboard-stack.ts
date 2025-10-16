#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { LeaderboardStack } from '../lib/leaderboard-stack';

const app = new cdk.App();
new LeaderboardStack(app, 'GameVibePlaneLeaderboardStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
  },
  description: 'Game Vibe Plane Leaderboard Backend - API Gateway, Lambda, DynamoDB',
});
