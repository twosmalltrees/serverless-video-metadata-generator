'use strict';
import AWS from 'aws-sdk';


module.exports.extractMetadata = (event, context, callback) => {
  const bucketName = event.Records[0].s3.bucket.name;
  const objectKey = event.Records[0].s3.object.key;
  const params = {
    Video: {
      S3Object: {
        Bucket: bucketName,
        Name: objectKey,
      },
      NotificationChannel: {
        RoleArn: process.env.SNS_PUBLISH_ROLE_ARN,
        SNSTopicArn: process.env.SNS_TOPIC_ARN,
      }
    }
  }

  const response = {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Successfully processed',
      input: event,
    }),
  };

  callback(null, response);
};

module.exports.saveMetadata = (event, context, callback) => {
  const response = {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Go Serverless v1.0! Your function executed successfully!',
      input: event,
    }),
  };

  callback(null, response);

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // callback(null, { message: 'Go Serverless v1.0! Your function executed successfully!', event });
};
