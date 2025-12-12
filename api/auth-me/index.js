// /api/auth-me.js
// Azure Function: returns logged-in user info + plan (free/premium) + roles (owner)

const { TableClient } = require("@azure/data-tables");

module.exports = async function (context, req) {
  try {
    // 1) Get user info from Static Web Apps auth
    const principalHeader = req.headers["x-ms-client-principal"];

    // Default response shape (always consistent)
    const baseBody = {
      isLoggedIn: false,
      email: null,
      plan: "free",      // free | premium
      roles: [],         // ex: ["authenticated"] or ["authenticated","owner"]
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

    // 2) Hard-coded owners (admin override)
    const OWNER_EMAILS = [
      "msaulnier@cncflorida.com",
      "joesorentino10@gmail.com",
      "jbelt@beltengineering.com",
      "lbelt17@outlook.com",
    ].map((e) => e.toLowerCase());

    // Logged in baseline
    const body = {
      ...baseBody,
      isLoggedIn: true,
      email,
      roles: ["authenticated"],
    };

    // Owner override
    if (OWNER_EMAILS.includes(email)) {
      body.roles.push("owner");
      body.plan = "premium"; // owner gets premium access automatically
      context.res = { status: 200, body };
      return;
    }

    // 3) Pull plan from Azure Table Storage (optional; defaults to free)
    // Table schema expectation:
    // PartitionKey = "users"
    // RowKey       = <email>
    // plan         = "premium" or "free"   (we will write this later)
    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
    const tableName = "Users";
    const partitionKey = "users";

    if (connectionString) {
      try {
        const client = TableClient.fromConnectionString(connectionString, tableName);
        const entity = await client.getEntity(partitionKey, email);

        // Accept either entity.plan OR legacy entity.subscriptionTier
        const plan =
          (entity && (entity.plan || entity.subscriptionTier) || "")
            .toString()
            .trim()
            .toLowerCase();

        if (plan === "premium") body.plan = "premium";
        // If anything else, keep "free"
      } catch (err) {
        // Not found is fine; we keep free
        context.log("auth-me: no table entry for user, defaulting to free");
      }
    } else {
      context.log("auth-me: missing AZURE_STORAGE_CONNECTION_STRING, defaulting to free");
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
        error: "Auth server error",
      },
    };
  }
};
