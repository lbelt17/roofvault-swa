const { TableClient } = require("@azure/data-tables");

module.exports = async function (context, req) {
  try {
    const principalHeader = req.headers["x-ms-client-principal"];

    // Base shape (new + backwards compatible)
    const baseBody = {
      // NEW
      isLoggedIn: false,
      email: null,
      plan: "free",       // free | premium
      roles: [],

      // BACKWARDS COMPAT
      subscriptionTier: "free", // free | premium | owner (legacy)
      isAuthenticated: false,
    };

    if (!principalHeader) {
      context.res = { status: 200, body: baseBody };
      return;
    }

    const decoded = JSON.parse(
      Buffer.from(principalHeader, "base64").toString("utf8")
    );

    const email = (decoded.userDetails || "").trim().toLowerCase();

    if (!email) {
      context.res = { status: 200, body: baseBody };
      return;
    }

    const OWNER_EMAILS = [
      "msaulnier@cncflorida.com",
      "joesorentino10@gmail.com",
      "jbelt@beltengineering.com",
      "lbelt17@outlook.com",
    ].map((e) => e.toLowerCase());

    const body = {
      ...baseBody,
      isLoggedIn: true,
      isAuthenticated: true,
      email,
      roles: ["authenticated"],
    };

    // Owner override
    if (OWNER_EMAILS.includes(email)) {
      body.roles.push("owner");
      body.plan = "premium";
      body.subscriptionTier = "owner"; // legacy UI will now show owner
      context.res = { status: 200, body };
      return;
    }

    // Default for logged-in non-owner
    body.subscriptionTier = "free";

    // Optional table lookup for premium users
    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
    const tableName = "Users";
    const partitionKey = "users";

    if (connectionString) {
      try {
        const client = TableClient.fromConnectionString(connectionString, tableName);
        const entity = await client.getEntity(partitionKey, email);

        const plan =
          (entity && (entity.plan || entity.subscriptionTier) || "")
            .toString()
            .trim()
            .toLowerCase();

        if (plan === "premium") {
          body.plan = "premium";
          body.subscriptionTier = "premium";
        }
      } catch (err) {
        context.log("auth-me: no table entry for user, defaulting to free");
      }
    }

    context.res = { status: 200, body };
  } catch (err) {
    context.log("auth-me error:", err);
    context.res = {
      status: 500,
      body: {
        isLoggedIn: false,
        email: null,
        plan: "free",
        roles: [],
        subscriptionTier: "free",
        isAuthenticated: false,
        error: "Auth server error",
      },
    };
  }
};
