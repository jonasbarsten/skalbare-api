import * as dynamoDbLib from "../../libs/dynamodb-lib";
import { success, failure } from "../../libs/response-lib";

// import listUsers from '../users/list';

export async function main (event, context) {

  // const users = await listUsers();
  // const usersJSON = JSON.parse(users.body);
  // const userNames = usersJSON.map((user) => {
  //   return user.Username;
  // });

  // console.log(userNames);

  const params = {
    TableName: process.env.profilesTable
  };

  try {
    const result = await dynamoDbLib.call("scan", params);
    return success(result.Items);
  } catch (e) {
    return failure({ status: false });
  }
}
