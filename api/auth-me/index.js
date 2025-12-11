// /api/auth-me.js
// Azure Function: returns logged-in user info + subscription tier

const { TableClient } = require("@azure/data-tables");

module.exports = async function (context, req) {
  try {
    // 1. Get user info from Static Web Apps auth
    const principalHeader = req.headers["x-ms-client-principal"];

    if (!principalHeader) {
      context.res = {
        status: 200,
        body: {
          isLoggedIn: false,
          email: null,
          subscriptionTier: "free",
        },
      };
      return;
    }

    const decoded = JSON.parse(
      Buffer.from(principalHeader, "base64").toString("utf8")
    );
    const email = decoded.userDetails || null;

    if (!email) {
      context.res = {
        status: 200,
        body: {
          isLoggedIn: false,
          email: null,
          subscriptionTier: "free",
        },
      };
      return;
    }

    // 2. Hard-coded owners (only place owners live now)
    const OWNER_EMAILS = [
      "msaulnier@cncflorida.com",
      "joesorentino10@gmail.com",
      "jbelt@beltengineering.com",
      "lbelt17@outlook.com",
    ];

    if (OWNER_EMAILS.includes(email.toLowerCase())) {
      context.res = {
        status: 200,
        body: {
          isLoggedIn: true,
          email,
          subscriptionTier: "owner",
        },
      };
      return;
    }

    // 3. Connect to Azure Table Storage
    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
    const tableName = "Users";
    const partitionKey = "users";

    const client = TableClient.fromConnectionString(connectionString, tableName);

    let subscriptionTier = "free";

    try {
      const entity = await client.getEntity(partitionKey, email);
      if (entity && entity.subscriptionTier) {
        subscriptionTier = entity.subscriptionTier;
      }
    } catch (err) {
      // If entity not found or other error, keep default "free"
      context.log("auth-me: no table entry for user, defaulting to free");
    }

    // 4. Return final result
    context.res = {
      status: 200,
      body: {
        isLoggedIn: true,
        email,
        subscriptionTier,
      },
    };
  } catch (err) {
    context.log("auth-me error:", err);
    context.res = {
      status: 500,
      body: {
        isLoggedIn: false,
        email: null,
        subscriptionTier: "free",
        error: "Auth server error",
      },
    };
  }
};
