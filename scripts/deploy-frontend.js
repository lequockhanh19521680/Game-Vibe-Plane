#!/usr/bin/env node

const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');
const mime = require('mime-types');

// Configure AWS
const s3 = new AWS.S3({ region: 'ap-southeast-1' });
const cloudformation = new AWS.CloudFormation({ region: 'ap-southeast-1' });
const cloudfront = new AWS.CloudFront({ region: 'ap-southeast-1' });

const environment = process.argv[2] || 'dev';
const stackName = `game-vibe-plane-${environment}`;

console.log(`🚀 Deploying frontend to ${environment} environment...`);

async function getStackOutputs() {
  try {
    const result = await cloudformation.describeStacks({ StackName: stackName }).promise();
    const stack = result.Stacks[0];
    const outputs = {};
    
    stack.Outputs.forEach(output => {
      outputs[output.OutputKey] = output.OutputValue;
    });
    
    return outputs;
  } catch (error) {
    console.error('❌ Error getting stack outputs:', error.message);
    process.exit(1);
  }
}

async function updateFrontendConfig(apiUrl, wsUrl) {
  const configPath = path.join(__dirname, '../frontend/js/config/endpoints.js');
  
  const configContent = `// Auto-generated endpoint configuration
// Environment: ${environment}
// Generated: ${new Date().toISOString()}

class EndpointManager {
  constructor() {
    this.initialized = false;
    this.endpoints = {};
  }

  async initialize() {
    if (this.initialized) return;

    this.endpoints.api = "${apiUrl}";
    this.endpoints.ws = "${wsUrl}";
    this.endpoints.token = "game_vibe_plane_${environment}_token";
    this.endpoints.timestamp = Date.now();

    this.initialized = true;
    console.log("Endpoints initialized for ${environment}");
  }

  getApiEndpoint() {
    if (!this.initialized) {
      console.error("Endpoints not initialized");
      return null;
    }
    return this.endpoints.api;
  }

  getWsEndpoint() {
    if (!this.initialized) {
      console.error("Endpoints not initialized");
      return null;
    }
    return this.endpoints.ws;
  }

  getToken() {
    if (!this.initialized) {
      console.error("Endpoints not initialized");
      return null;
    }
    return this.endpoints.token;
  }
}

// Create global instance
const endpointManager = new EndpointManager();

// Export for use
window.EndpointManager = EndpointManager;
window.endpointManager = endpointManager;
`;

  fs.writeFileSync(configPath, configContent);
  console.log('✅ Updated frontend configuration');
}

async function uploadFile(bucketName, filePath, key) {
  const fileContent = fs.readFileSync(filePath);
  const contentType = mime.lookup(filePath) || 'application/octet-stream';
  
  const params = {
    Bucket: bucketName,
    Key: key,
    Body: fileContent,
    ContentType: contentType,
    CacheControl: key.endsWith('.html') ? 'no-cache' : 'max-age=31536000'
  };

  await s3.upload(params).promise();
}

async function uploadDirectory(bucketName, dirPath, prefix = '') {
  const files = fs.readdirSync(dirPath);
  
  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      await uploadDirectory(bucketName, filePath, path.join(prefix, file));
    } else {
      const key = path.join(prefix, file).replace(/\\\\/g, '/');
      await uploadFile(bucketName, filePath, key);
      console.log(`📁 Uploaded: ${key}`);
    }
  }
}

async function invalidateCloudFront(distributionId) {
  const params = {
    DistributionId: distributionId,
    InvalidationBatch: {
      CallerReference: Date.now().toString(),
      Paths: {
        Quantity: 1,
        Items: ['/*']
      }
    }
  };

  const result = await cloudfront.createInvalidation(params).promise();
  console.log(`🔄 CloudFront invalidation created: ${result.Invalidation.Id}`);
}

async function main() {
  try {
    // Get stack outputs
    const outputs = await getStackOutputs();
    const bucketName = outputs.FrontendBucketName;
    const apiUrl = outputs.ApiGatewayUrl;
    const wsUrl = outputs.WebSocketUrl;
    const distributionId = outputs.CloudFrontDistributionId;

    if (!bucketName || !apiUrl || !wsUrl) {
      throw new Error('Missing required stack outputs');
    }

    console.log(`📦 S3 Bucket: ${bucketName}`);
    console.log(`🔗 API URL: ${apiUrl}`);
    console.log(`🔌 WebSocket URL: ${wsUrl}`);

    // Update frontend configuration
    await updateFrontendConfig(apiUrl, wsUrl);

    // Upload frontend files
    const frontendDir = path.join(__dirname, '../frontend');
    await uploadDirectory(bucketName, frontendDir);

    // Invalidate CloudFront cache
    if (distributionId) {
      await invalidateCloudFront(distributionId);
    }

    console.log('✅ Frontend deployment completed successfully!');
    console.log(`🌐 Frontend URL: ${outputs.CloudFrontUrl}`);

  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    process.exit(1);
  }
}

main();