# Azure Teams API Integration Setup

This document describes how to register and configure your application in Azure Active Directory for Teams chat integration, including required permissions and admin consent.

## Prerequisites

- Azure CLI installed (https://docs.microsoft.com/cli/azure/install-azure-cli)
- Access to Azure AD tenant with permissions to register applications and grant admin consent.

## Steps

1. **Register a new Azure AD app**:

   ```bash
   az ad app create \
     --display-name "QAS Portal Teams Integration" \
     --identifier-uris "https://your-domain.com/teams" \
     --required-resource-accesses @requiredResourceAccess.json
   ```

   Create `requiredResourceAccess.json` with:

   ```json
   [
     {
       "resourceAppId": "00000003-0000-0000-c000-000000000000",
       "resourceAccess": [
         { "id": "Chat.ReadWrite", "type": "Scope" },
         { "id": "User.Read.All", "type": "Scope" }
       ]
     }
   ]
   ```

2. **Add a client secret**:

   ```bash
   az ad app credential reset \
     --id <APP_ID> \
     --append \
     --display-name "TeamsClientSecret"
   ```

   Copy the generated `clientSecret`.

3. **Set environment variables**:

   Add the following to your `.env.local` or environment:

   ```env
   AZURE_AD_CLIENT_ID=<APP_ID>
   AZURE_AD_CLIENT_SECRET=<clientSecret>
   AZURE_AD_TENANT_ID=<TENANT_ID>
   ```

4. **Grant admin consent**:

   ```bash
   az ad app permission grant \
     --id <APP_ID> \
     --api 00000003-0000-0000-c000-000000000000
   az ad app permission admin-consent --id <APP_ID>
   ```

5. **Verify permissions in Azure Portal**:

   - Navigate to **Azure Active Directory** > **App registrations** > _Your App_ > **API permissions**.
   - Confirm `Chat.ReadWrite` and `User.Read.All` are **Granted** for your tenant.

## Local Development

Ensure the following environment variables are set locally:

```env
AZURE_AD_CLIENT_ID=...
AZURE_AD_CLIENT_SECRET=...
AZURE_AD_TENANT_ID=...
```

## References

- Microsoft Graph documentation: https://docs.microsoft.com/graph/overview
- Azure CLI app registration: https://docs.microsoft.com/cli/azure/ad/app
