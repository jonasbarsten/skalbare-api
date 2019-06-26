import uuid from "uuid";
import crypto from "crypto";
import * as dynamoDbLib from "../../libs/dynamodb-lib";
import { success, failure } from "../../libs/response-lib";

import { listLicenses } from './list';
import { addRegistration } from './update';

const decryptStringWithRsaPrivateKey = (toDecrypt) => {
  const buffer = new Buffer(toDecrypt, "base64");
  const decrypted = crypto.privateDecrypt({key: process.env.privateKey.toString(), passphrase: process.env.privateSecret}, buffer);
  return decrypted.toString("utf8");
};

const signRegistration = (registration) => {
  const sign = crypto.createSign('SHA256');
  sign.write(JSON.stringify(registration));
  sign.end();
  return sign.sign({key: process.env.privateKey.toString(), passphrase: process.env.privateSecret}, 'hex');
}

export async function main (event, context) {

  const data = JSON.parse(event.body);
  const key = data.key;
  const userId = event.requestContext.identity.cognitoIdentityId;
  const registration = JSON.parse(decryptStringWithRsaPrivateKey(key));

  if (!registration.machineId || !registration.product || !registration.version) {
    return failure({ status: false });
  }

  const usersLicenses = await listLicenses(userId);
  const usersLicensesJSON = JSON.parse(usersLicenses.body);

  const productLicenses = usersLicensesJSON.filter((license) => {
    if (license.product.indexOf(registration.product) !== -1) {
      return true;
    } else {
      return false;
    }
  });

  const availablePermanentLicense = productLicenses.filter((license) => {

    const registrations = (license.registrations && license.registrations.length) || 0;

    if (license.product === "SYNC" && license.type === "permanent" && registrations < 5) {
      return true;
    } else if (license.product !== "SYNC" && license.type === "permanent" && registrations < 1) {
      return true;
    } else {
      return false;
    }
  })[0];

  // Add registration to permanent license if available

  if (availablePermanentLicense) {
    const signature = signRegistration(registration);
    const newLicense = await addRegistration(userId, availablePermanentLicense.licenseId, registration, signature);
    if (JSON.parse(newLicense.body).status) {
      return success({ status: true, signature: signature });
    } else {
      return failure({ status: false });
    }
  }

  // Or add registration to extra license if available

  for (let i = 0; i < productLicenses.length; i++) {
    const registrations = (productLicenses[i].registrations && productLicenses[i].registrations.length) || 0;
    if (productLicenses[i].type === "extra" && registrations < 1) {
      const signature = signRegistration(registration);
      const newLicense = await addRegistration(userId, productLicenses[i].licenseId, registration, signature);
      if (JSON.parse(newLicense.body).status) {
        return success({ status: true, signature: signature });
      } else {
        return failure({ status: false });
      }
    }
  }

  // Or do not add registration since no license is available

  return failure({ status: false, message: 'No more available licenses.' });
}