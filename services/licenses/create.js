import uuid from "uuid";
import * as dynamoDbLib from "../../libs/dynamodb-lib";
import { success, failure } from "../../libs/response-lib";

// export async function main (event, context) {

//   const data = JSON.parse(event.body);
//   const params = {
//     TableName: process.env.licensesTable,
//     Item: {
//       userId: event.requestContext.identity.cognitoIdentityId,
//       licenseId: uuid.v1(),
//       content: data.content,
//       createdAt: Date.now()
//     }
//   };

//   try {
//     await dynamoDbLib.call("put", params);
//     return success(params.Item);
//   } catch (e) {
//     return failure({ status: false });
//   }
// }

export default async function createLicense (userId, product, type) {

  const params = {
    TableName: process.env.licensesTable,
    Item: {
      userId,
      licenseId: uuid.v1(),
      product,
      type,
      usage: 0,
      createdAt: Date.now()
    }
  };

  try {
    await dynamoDbLib.call("put", params);
    return success(params.Item);
  } catch (e) {
    return failure({ status: false });
  }
}