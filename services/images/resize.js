import { s3Handler } from "../../libs/s3-lib";
import sharp from "sharp";

export default async function main (bucket, width, height, key, newKey) {

  console.log('enter RESIZE');

  try {

    const streamResize = sharp().resize(width, height).toFormat('png');
    const readStream = s3Handler.readStream({ Bucket: bucket, Key: key });
    const { writeStream, uploaded } = s3Handler.writeStream({ Bucket: bucket, Key: newKey });

    readStream.pipe(streamResize).pipe(writeStream);

    await uploaded;
    return {status: true, data: newKey};

  } catch (e) {
    return { status: false, data: e };
  }
};