import { ConfidentialClientApplication, Configuration } from "@azure/msal-node";
import { Client } from "@microsoft/microsoft-graph-client";
import { env } from "@/env.mjs";

/**
 * GraphClient provides authenticated Microsoft Graph API calls using client credentials flow.
 */
export class GraphClient {
  private cca: ConfidentialClientApplication;
  private scopes: string[];

  constructor(scopes: string[] = ["https://graph.microsoft.com/.default"]) {
    const msalConfig: Configuration = {
      auth: {
        clientId: env.AZURE_AD_CLIENT_ID,
        authority: `https://login.microsoftonline.com/${env.AZURE_AD_TENANT_ID}`,
        clientSecret: env.AZURE_AD_CLIENT_SECRET,
      },
    };
    this.cca = new ConfidentialClientApplication(msalConfig);
    this.scopes = scopes;
  }

  private async getAccessToken(): Promise<string> {
    const result = await this.cca.acquireTokenByClientCredential({
      scopes: this.scopes,
    });
    if (!result || !result.accessToken) {
      throw new Error("Failed to acquire access token from Microsoft Graph");
    }
    return result.accessToken;
  }

  private getAuthenticatedClient(accessToken: string): Client {
    return Client.init({
      authProvider: (done) => {
        done(null, accessToken);
      },
    });
  }

  /**
   * Returns a Graph request builder for the given path.
   */
  public async api(path: string) {
    const token = await this.getAccessToken();
    return this.getAuthenticatedClient(token).api(path);
  }

  /**
   * Performs a GET request to the given Graph API path.
   */
  public async get<T>(path: string): Promise<T> {
    const request = await this.api(path);
    // If using advanced queries (e.g., $count, $expand, endswith, startswith, members/any), Graph requires ConsistencyLevel header
    if (
      path.includes("$count") ||
      path.includes("$expand") ||
      path.includes("endswith(") ||
      path.includes("startswith(") ||
      path.includes("substringof(") ||
      path.includes("members/any")
    ) {
      request.header("ConsistencyLevel", "eventual");
    }
    const result = await request.get();
    return result as T;
  }

  /**
   * Performs a POST request to the given Graph API path.
   */
  public async post<T>(path: string, payload: unknown): Promise<T> {
    const request = await this.api(path);
    const result = await request.post(payload);
    return result as T;
  }

  /**
   * Performs a PATCH request to the given Graph API path.
   */
  public async patch<T>(path: string, payload: unknown): Promise<T> {
    const request = await this.api(path);
    const result = await request.patch(payload);
    return result as T;
  }

  /**
   * Performs a DELETE request to the given Graph API path.
   */
  public async delete<T>(path: string): Promise<T> {
    const request = await this.api(path);
    const result = await request.delete();
    return result as T;
  }
}
