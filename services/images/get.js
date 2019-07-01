import { success, failure } from "../../libs/response-lib";
import { s3Handler, s3Checker } from "../../libs/s3-lib";
import resize from './resize';

export async function main (event) {

  const { level, user, size, image } = event.pathParameters;
  const sizeArray = size.split('x');
  const width = parseInt(sizeArray[0]);
  const height = parseInt(sizeArray[1]);
  const bucket = "skalbare-api-dev-attachmentsbucket-1tsv3sa7oezub";
  const key = `${level}/${user}/${image}`;
  const newKey = `${level}/${user}/${width}x${height}/${image}`;

  const resizedExists = await s3Checker(bucket, newKey);

  if (resizedExists) {
    return success(newKey);
  };

  const originalExists = await s3Checker(bucket, key);

  if (!originalExists) {
    return failure({ status: false });
  };

  const resizeResult = await resize(bucket, width, height, key, newKey);

  if (resizeResult.status === true) {
    return success(resizeResult.data);
  } else {
    return failure({ status: false });
  }

};