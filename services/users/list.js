import AWS from "aws-sdk";
import { success, failure } from "../../libs/response-lib";
const cognito = new AWS.CognitoIdentityServiceProvider();

export default async function main (event, context) {

  const params = {
    // UserPoolId: 'us-east-1_nwwbtYMOe'
    UserPoolId: 'us-east-1_WaYiSCIq8'
  };

  try {
    const result = await cognito.listUsers(params).promise();
    return success(result.Users);
  } catch (e) {
    console.log(e);
    return failure({ status: false });
  }
}