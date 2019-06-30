import AWS from "aws-sdk";
import { success, failure } from "../../libs/response-lib";

export async function main (event, context) {
  const params = {
    UserPoolId: process.env.cognitoIdentiyPoolId
  };

  const cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider();

  cognitoidentityserviceprovider.listUsers(params, function(err, data) {
    if (err) console.log(err);
    else console.log(data);
  });
}