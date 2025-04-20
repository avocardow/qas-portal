import { ConfidentialClientApplication, Configuration } from "@azure/msal-node";
import { Client } from "@microsoft/microsoft-graph-client";
import { env } from "../../env.mjs";
import { z } from "zod";
import { fileURLToPath } from "node:url";

// Ensure EMAIL_FROM environment variable is set
const EMAIL_FROM = process.env.EMAIL_FROM;
if (!EMAIL_FROM) {
  console.error("EMAIL_FROM environment variable is not set.");
  throw new Error("EMAIL_FROM environment variable is not defined");
}

// Input validation schema for sendEmail parameters
const sendEmailInputSchema = z.object({
  to: z.string().email(),
  subject: z.string().min(1),
  htmlBody: z.string().min(1),
});

// Add type alias for sendEmail parameters
type SendEmailParams = z.infer<typeof sendEmailInputSchema>;

// Add in-memory token cache variables
let cachedToken: string | null = null;
let cachedTokenExpiry = 0;

/**
 * Acquire an access token using client credentials flow.
 */
async function getAccessToken(): Promise<string> {
  const now = Date.now();
  if (cachedToken && now < cachedTokenExpiry) {
    console.debug(
      `Using cached access token; expires at ${new Date(cachedTokenExpiry).toISOString()}`
    );
    return cachedToken;
  }
  const msalConfig: Configuration = {
    auth: {
      clientId: env.AZURE_AD_CLIENT_ID,
      authority: `https://login.microsoftonline.com/${env.AZURE_AD_TENANT_ID}`,
      clientSecret: env.AZURE_AD_CLIENT_SECRET,
    },
  };

  const cca = new ConfidentialClientApplication(msalConfig);

  try {
    const result = await cca.acquireTokenByClientCredential({
      scopes: ["https://graph.microsoft.com/.default"],
    });
    if (!result || !result.accessToken) {
      throw new Error("Failed to acquire access token from Microsoft Graph");
    }
    // Cache token with 1 minute buffer before expiration
    cachedToken = result.accessToken;
    if (result.expiresOn) {
      cachedTokenExpiry = result.expiresOn.getTime() - 60000;
      console.info(
        `Graph API token acquired; expires at ${result.expiresOn.toISOString()}`
      );
    }
    return result.accessToken;
  } catch (error) {
    console.error("Error acquiring access token:", error);
    throw error;
  }
}

/**
 * Get an authenticated Microsoft Graph client.
 */
function getAuthenticatedClient(accessToken: string): Client {
  return Client.init({
    authProvider: (done) => {
      done(null, accessToken);
    },
  });
}

// Add GraphError interface and type guard to avoid explicit any casts
interface GraphError extends Error {
  statusCode?: number;
  code?: string;
}

function isGraphError(error: unknown): error is GraphError {
  return typeof error === "object" && error !== null && "statusCode" in error;
}

/**
 * Send an email using Microsoft Graph API.
 */
export async function sendEmail(params: SendEmailParams): Promise<void> {
  try {
    // Validate and destructure inputs
    const { to, subject, htmlBody } = sendEmailInputSchema.parse(params);
    const accessToken = await getAccessToken();
    console.debug(`Graph API access token obtained for sender ${EMAIL_FROM}`);
    const client = getAuthenticatedClient(accessToken);
    const message = {
      subject,
      body: {
        contentType: "HTML",
        content: htmlBody,
      },
      toRecipients: [
        {
          emailAddress: {
            address: to,
          },
        },
      ],
    };

    // Logging request details
    console.debug(`Sending email to ${to} from ${EMAIL_FROM}`);
    console.debug("Email message payload:", JSON.stringify(message));

    const apiPath = `/users/${EMAIL_FROM}/sendMail`;
    const apiPayload = { message, saveToSentItems: true };
    const maxRetries = 3;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await client.api(apiPath).post(apiPayload);
        console.info(`Email sent successfully to ${to}`, response);
        break;
      } catch (err) {
        const statusCode = isGraphError(err) ? err.statusCode : undefined;
        const retryable =
          statusCode && [429, 500, 502, 503, 504].includes(statusCode);
        if (retryable && attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 100;
          console.warn(
            `Attempt ${attempt} failed with status ${statusCode}. Retrying in ${delay}ms (attempt ${attempt + 1} of ${maxRetries})`
          );
          await new Promise((res) => setTimeout(res, delay));
          continue;
        }
        throw err;
      }
    }
  } catch (e) {
    console.error("Error sending email:", e);
    if (isGraphError(e) && e.statusCode) {
      console.error(`Graph API error status ${e.statusCode}`, {
        code: e.code,
        message: e.message,
      });
    }
    const message = e instanceof Error ? e.message : String(e);
    throw new Error(`Failed to send email to ${params.to}: ${message}`);
  }
}

// Simple test function to verify email sending works correctly
async function testSendEmail(): Promise<void> {
  const testRecipient = process.env.TEST_EMAIL_RECIPIENT;
  if (!testRecipient) {
    console.error("TEST_EMAIL_RECIPIENT environment variable is not set.");
    return;
  }
  try {
    await sendEmail({
      to: testRecipient,
      subject: "Test Email",
      htmlBody: "<p>This is a test email.</p>",
    });
    console.log("Test email sent successfully.");
  } catch (error) {
    console.error("Test email failed:", error);
  }
}

// If this script is run directly (ESM), execute the test
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  testSendEmail();
}
