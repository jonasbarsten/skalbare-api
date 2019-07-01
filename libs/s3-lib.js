import * as AWS from "aws-sdk";
import stream from "stream";

const S3 = new AWS.S3();

class S3Handler {
  constructor() {}

  readStream({ Bucket, Key }) {
    return S3.getObject({ Bucket, Key }).createReadStream();
  }

  writeStream({ Bucket, Key }) {
    const passThrough = new stream.PassThrough();
    return {
      writeStream: passThrough,
      uploaded: S3.upload({
        ContentType: "image/png",
        Body: passThrough,
        Bucket,
        Key
      }).promise()
    };
  }
}

export const s3Handler = new S3Handler();

export function s3Checker (bucket, key) {
  return new Promise(resolve => {
    S3.getObject({Bucket: bucket, Key: key}, (err, res) => {
      if (err) {
        resolve(false);
      } else {
        resolve(true);
      }
    });
  })
}