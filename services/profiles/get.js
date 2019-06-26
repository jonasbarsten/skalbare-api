import * as dynamoDbLib from "../../libs/dynamodb-lib";
import { success, failure } from "../../libs/response-lib";

export async function main(event, context) {

  console.log(event);

  const params = {
    TableName: process.env.profilesTable,
    // 'Key' defines the partition key and sort key of the item to be retrieved
    // - 'userId': Identity Pool identity id of the authenticated user
    // - 'noteId': path parameter
    Key: {
      // userId: event.requestContext.identity.cognitoIdentityId,
      // profileId: event.pathParameters.id
      userId: event.pathParameters.id
    }
  };

  console.log(params);

  try {
    const result = await dynamoDbLib.call("get", params);
    if (result.Item) {

      console.log(result.Item);
      // Return the retrieved item
      return success(result.Item);
    } else {

      console.log('failfail');
      return failure({ status: false, error: "Item not found." });
    }
  } catch (e) {

    console.log('errorerror');
    return failure({ status: false });
  }
}
