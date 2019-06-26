import stripePackage from "stripe";
import { calculateCost } from "../../libs/billing-lib";
import { success, failure } from "../../libs/response-lib";

import createLicense from '../licenses/create';
import deleteLicense from '../licenses/delete';
import { listLicenses } from '../licenses/list';

export async function main(event, context) {
  
  let { product, email, source } = JSON.parse(event.body);
  const amount = calculateCost(product);
  const userId = event.requestContext.identity.cognitoIdentityId;
  const description = `Charge for ${product}`;
  const usersLicenses = await listLicenses(userId);
  const usersLicensesJSON = JSON.parse(usersLicenses.body);
  const extraLicense = product.includes("extra license");
  const baseLicense = extraLicense ? product.slice(0, -14) : null;
  
  let licenseType = "permanent";

  if (extraLicense) {
    licenseType = "extra";
  }

  // Checking if product exists in billing-lib
  if (amount === 0) {
    return failure({ message: 'No matching products' });
  }

  // Checking for existing permanent license for given product
  let existingLicense = null;

  for (var i = 0; i < usersLicensesJSON.length; i++) {
    if (usersLicensesJSON[i].product === product && usersLicensesJSON[i].type === "permanent") {
      existingLicense = usersLicensesJSON[i];
      break;
    }
  }

  if (existingLicense) {
    return failure({ message: 'You already have this license' });
  }

  // Creating license with type "extra" if base license exists
  if (extraLicense) {

    let baseLicenseExists = false;

    for (var i = 0; i < usersLicensesJSON.length; i++) {
      if (usersLicensesJSON[i].product === baseLicense && usersLicensesJSON[i].type === "permanent") {
        baseLicenseExists = true;
        break;
      }
    }

    if (baseLicenseExists) {
      product = baseLicense;
    } else {
      return failure({ message: 'Base license does not exist' });
    }
  }

  const license = await createLicense(userId, product, licenseType);
  const licenseJSON = JSON.parse(license.body);

  if (license.statusCode !== 200) {
    return failure({ message: 'Could not create license' });
  }

  const stripe = stripePackage(process.env.stripeSecretKey);

  try {
    await stripe.charges.create({
      source,
      amount,
      description,
      receipt_email: email,
      statement_descriptor: 'Edvard Gig - Software',
      currency: "usd",
      metadata: { email, license: license.body }
    });
    return success({ status: true });
  } catch (e) {
    
    await deleteLicense(userId, licenseJSON.licenseId);
    return failure({ message: e.message });
  }
}