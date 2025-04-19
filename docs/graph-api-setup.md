# Azure AD Graph API Setup and Environment Configuration

## Prerequisites

- Azure AD administrator account
- Node.js (v14+) and pnpm installed
- Project dependencies installed: run `pnpm install`
- NextAuth.js configured in the project (see https://next-auth.js.org/)

## Azure AD App Registration

1. Navigate to the Azure portal: https://portal.azure.com
2. Sign in with an account having **Global Administrator** or **Application Administrator** rights.
3. In the left-hand menu, select **Azure Active Directory** > **App registrations**.
4. Locate and select the **QAS Portal** application.
5. Under **Authentication**, verify your redirect URIs.
6. Under **Certificates & secrets**, create a new **Client Secret** if one does not exist.

## Microsoft Graph API Permissions

1. In the **QAS Portal** App Registration, select **API permissions**.
2. Click **Add a permission** > **Microsoft Graph** > **Application permissions**.
3. Search for and select **Mail.Send**.
4. Click **Add permissions**.
5. Click **Grant admin consent for <Your Tenant Name>** and confirm.
6. Verify the status reads **Granted for <Your Tenant Name>** with a green checkmark.

For more details, refer to the official Microsoft Graph docs: https://learn.microsoft.com/graph/api/resources/mail-api

## Environment Variables

Add the following to your `.env.local` for local development and to your Vercel Dashboard under **Settings > Environment Variables**:

```bash
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<your-random-secret>
AZURE_AD_TENANT_ID=<your-tenant-id>
AZURE_AD_CLIENT_ID=<your-client-id>
AZURE_AD_CLIENT_SECRET=<your-client-secret>
EMAIL_FROM=no-reply@qaspecialists.com.au
```

Replace placeholder values with those obtained from your Azure portal.

## Testing the Configuration

Use the Microsoft Graph SDK to test the connection:

```javascript
import { Client } from "@microsoft/microsoft-graph-client";
import "isomorphic-fetch";

async function testGraphConnection() {
  const client = Client.init({
    authProvider: (done) => {
      done(null, "<ACCESS_TOKEN>"); // Replace with valid token
    },
  });

  const res = await client.api("/me").get();
  console.log("Graph API response:", res);
}

testGraphConnection().catch(console.error);
```

Expected output: your user profile information.

## Troubleshooting Guide

- **Authentication Errors**:
  - Check redirect URIs in Azure AD App Registration.
  - Ensure environment variables match exactly.
- **Permission Denied**:
  - Verify **Mail.Send** is granted and consented.
  - Confirm your account has admin rights.
- **Token Expiration**:
  - Rotate and update client secrets regularly.

## Security Considerations

- Follow the **least privilege** principle; only request needed permissions.
- Rotate client secrets periodically.
- Do not commit real secrets to source control.

## Version History

| Version | Date       | Changes                                 |
| ------- | ---------- | --------------------------------------- |
| 1.0.0   | 2025-04-19 | Initial creation of Graph API setup doc |
