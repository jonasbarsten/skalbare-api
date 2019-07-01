import { success, failure } from "../../libs/response-lib";
import { s3Handler } from "../../libs/s3-lib";
const sharp = require("sharp");

export async function main (event) {

  console.log('gogo')!

  const { level, user, size, image } = event.pathParameters;

  try {
    const sizeArray = size.split('x');
    const width = parseInt(sizeArray[0]);
    const height = parseInt(sizeArray[1]);
    const Key = `${level}/${user}/${image}`;
    const newKey = `${level}/${user}/${width}x${height}/${image}`;

    // TODO: set dynamically
    const Bucket = "skalbare-api-dev-attachmentsbucket-1tsv3sa7oezub";
    const streamResize = sharp().resize(width, height).toFormat('png');
    const readStream = s3Handler.readStream({ Bucket, Key });
    const { writeStream, uploaded } = s3Handler.writeStream({ Bucket, Key: newKey });

    readStream.pipe(streamResize).pipe(writeStream);

    await uploaded;
    return success(newKey);

  } catch (e) {
    console.log('Fail :/');
    console.log(e);
    return failure({ status: false });
  }
};