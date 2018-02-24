'use strict';
const AWS = require('aws-sdk');
const rekognition = new AWS.Rekognition();
const s3 = new AWS.S3();

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

  rekognition.startCelebrityRecognition(params).promise()
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
  const message = JSON.parse(event.Records[0].Sns.Message);
  const jobId = message.JobId;   
  const bucketName = message.Video.S3Bucket;  
  const objectKey = message.Video.S3ObjectName;
  const metadataObjectKey = objectKey + '.people.json';

  const rekognitionParams = {
    JobId: jobId,
  };

  rekognition.getCelebrityRecognition(rekognitionParams).promise()
    .then((res) => {
      const s3Params = {
        Bucket: bucketName,
        Key: metadataObjectKey,
        Body: JSON.stringify(res),
      };
      s3.putObject(s3Params).promise()
        .then((res) => {
          const response = {
            statusCode: 200,
            body: JSON.stringify(res),
          };
          callback(null, response);
        });
    })
    .catch((err) => {
      console.log(err);
      callback(err, null); 
    });
};
