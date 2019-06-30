import AWS from "aws-sdk";
import { success, failure } from "../../libs/response-lib";

export async function main (event, context) {
  var params = {
    UserPoolId: process.env.cognitoIdentiyPoolId
  };

  const cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider();

  try {
    const result = await cognitoidentityserviceprovider.listUsers(params);
    console.log(result);
    return success(result.Items);
  } catch (e) {
    return failure({ status: false });
  }
}