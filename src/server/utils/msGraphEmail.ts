import { ConfidentialClientApplication, Configuration } from "@azure/msal-node";
import { Client } from "@microsoft/microsoft-graph-client";
import { env } from "@/env.mjs";
import { z } from "zod";

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

/**
 * Acquire an access token using client credentials flow.
 */
async function getAccessToken(): Promise<string> {
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

/**
 * Send an email using Microsoft Graph API.
 */
export async function sendEmail(
  to: string,
  subject: string,
  htmlBody: string
): Promise<void> {
  try {
    // Validate inputs
    sendEmailInputSchema.parse({ to, subject, htmlBody });
    const accessToken = await getAccessToken();
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

    await client.api(`/users/${EMAIL_FROM}/sendMail`).post({
      message,
      saveToSentItems: true,
    });
    console.log(`Email sent to ${to} from ${EMAIL_FROM}`);
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
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
    await sendEmail(
      testRecipient,
      "Test Email",
      "<p>This is a test email.</p>"
    );
    console.log("Test email sent successfully.");
  } catch (error) {
    console.error("Test email failed:", error);
  }
}

// If this script is run directly, execute the test
if (require.main === module) {
  testSendEmail();
}
