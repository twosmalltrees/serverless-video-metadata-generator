'use strict';
const AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-1'});

const rekognition = new AWS.Rekognition();

module.exports.extractMetadata = (event, context, callback) => {
  const bucketName = event.Records[0].s3.bucket.name;
  const objectKey = event.Records[0].s3.object.key;
  const params = {
    Video: {
      S3Object: {
        Bucket: bucketName,
        Name: objectKey
      }
    },
    NotificationChannel: {
      RoleArn: process.env.SNS_PUBLISH_ROLE_ARN,
      SNSTopicArn: process.env.SNS_TOPIC_ARN,
    },
  };

  rekognition.startLabelDetection(params).promise()
    .then((res) => {
      const response = {
        statusCode: 200,
        body: JSON.stringify(res),
      };
      callback(null, response);      
    })
    .catch((err) => {
      console.log(err);
      callback(err, null);      
    });
};

module.exports.saveMetadata = (event, context, callback) => {
  const jobId = event.Records[0].Sns.JobId;
  const bucketName = event.Records[0].Sns.Video.S3Bucket;  
  const objectKey = event.Records[0].Sns.Video.S3ObjectName;

  const rekognitionParams = {
    JobId: jobId,
  };

  rekognition.getLabelDetection(rekognitionParams).promise()
    .then((res) => {
      const response = {
        statusCode: 200,
        body: JSON.stringify(res),
      };
      callback(null, response);
    })
    .catch((err) => {
      console.log(err);
      callback(err, null);      
    });
};
