import uuid from "uuid";
import * as dynamoDbLib from "../../libs/dynamodb-lib";
import { success, failure } from "../../libs/response-lib";

export async function main(event, context) {

  const data = JSON.parse(event.body);
  const params = {
    TableName: process.env.profilesTable,
    Item: {
      userId: event.requestContext.identity.cognitoIdentityId,
      profileId: data.profileId,
      bio: data.bio,
      profileImage: data.profileImage,
      profileCover: data.profileCover,
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