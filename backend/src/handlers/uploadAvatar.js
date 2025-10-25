const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const { corsHeaders } = require('../utils/cors');
const { validateInput } = require('../utils/security');

const s3 = new AWS.S3();
const dynamodb = new AWS.DynamoDB.DocumentClient();

const AVATAR_BUCKET = process.env.AVATAR_BUCKET;
const AVATARS_TABLE = process.env.AVATARS_TABLE;

// Allowed file types and sizes
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

exports.handler = async (event) => {
  console.log('Upload avatar request:', JSON.stringify(event, null, 2));

  try {
    // Handle preflight OPTIONS request
    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: '',
      };
    }

    // Parse multipart form data (simplified - in production use proper multipart parser)
    const contentType = event.headers['content-type'] || event.headers['Content-Type'];
    
    if (!contentType || !contentType.includes('multipart/form-data')) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({
          error: 'Content-Type must be multipart/form-data'
        }),
      };
    }

    // For this example, we'll expect the file data to be base64 encoded in the body
    // In a real implementation, you'd use a proper multipart parser
    let requestBody;
    try {
      requestBody = JSON.parse(event.body);
    } catch (error) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({
          error: 'Invalid JSON in request body'
        }),
      };
    }

    const { userId, fileData, fileName, fileType } = requestBody;

    // Validate required fields
    if (!userId || !fileData || !fileName || !fileType) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({
          error: 'Missing required fields: userId, fileData, fileName, fileType'
        }),
      };
    }

    // Validate user ID
    if (!validateInput(userId, 'userId')) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({
          error: 'Invalid userId format'
        }),
      };
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(fileType)) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({
          error: 'Invalid file type. Allowed: JPG, PNG, GIF'
        }),
      };
    }

    // Decode base64 file data
    let fileBuffer;
    try {
      fileBuffer = Buffer.from(fileData, 'base64');
    } catch (error) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({
          error: 'Invalid base64 file data'
        }),
      };
    }

    // Validate file size
    if (fileBuffer.length > MAX_FILE_SIZE) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({
          error: 'File size exceeds 2MB limit'
        }),
      };
    }

    // Generate unique file name
    const fileExtension = fileName.split('.').pop();
    const uniqueFileName = `${userId}/${uuidv4()}.${fileExtension}`;

    // Upload to S3
    const uploadParams = {
      Bucket: AVATAR_BUCKET,
      Key: uniqueFileName,
      Body: fileBuffer,
      ContentType: fileType,
      CacheControl: 'max-age=31536000', // 1 year cache
      Metadata: {
        userId: userId,
        originalName: fileName,
        uploadedAt: new Date().toISOString()
      }
    };

    const uploadResult = await s3.upload(uploadParams).promise();
    const avatarUrl = uploadResult.Location;

    // Update user's avatar in DynamoDB
    const avatarData = {
      type: 'custom',
      url: avatarUrl,
      s3Key: uniqueFileName,
      uploadedAt: new Date().toISOString(),
      fileType: fileType,
      fileSize: fileBuffer.length
    };

    const updateParams = {
      TableName: AVATARS_TABLE,
      Key: { userId },
      UpdateExpression: 'SET avatar = :avatar, updatedAt = :updatedAt',
      ExpressionAttributeValues: {
        ':avatar': avatarData,
        ':updatedAt': new Date().toISOString()
      },
      ReturnValues: 'ALL_NEW'
    };

    await dynamodb.update(updateParams).promise();

    console.log('Avatar uploaded successfully:', avatarUrl);

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        success: true,
        url: avatarUrl,
        avatar: avatarData
      }),
    };

  } catch (error) {
    console.error('Error uploading avatar:', error);

    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message
      }),
    };
  }
};