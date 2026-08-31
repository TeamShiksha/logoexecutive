const crypto = require("crypto");
const axios = require("axios");

const SUPPORTED_PROVIDERS = ["google", "discord", "linkedin", "github"];

/**
 * Utility for provider-agnostic OAuth 2.0 flows.
 */
class OAuthUtility {
  /**
   * Generates a cryptographically random CSRF state token.
   * @returns {string} Hex encoded random state token.
   */
  generateState() {
    return crypto.randomBytes(32).toString("hex");
  }

  /**
   * Checks if a provider is supported.
   * @param {string} provider
   * @returns {boolean}
   */
  isProviderSupported(provider) {
    return SUPPORTED_PROVIDERS.includes(provider?.toLowerCase());
  }

  /**
   * Generates the provider authorization URL.
   * @param {string} provider - Auth provider (e.g. 'google')
   * @param {string} state - CSRF state token
   * @returns {string} Authorization URL
   */
  getAuthUrl(provider, state) {
    const p = provider?.toLowerCase();
    if (!this.isProviderSupported(p)) {
      throw new Error(`Unsupported OAuth provider: ${provider}`);
    }

    if (p === "google") {
      const clientId = process.env.GOOGLE_CLIENT_ID;
      const redirectUri = process.env.GOOGLE_REDIRECT_URI;

      if (!clientId || !redirectUri) {
        throw new Error(
          "Google OAuth environment variables are not configured."
        );
      }

      const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: "code",
        scope: "openid email profile",
        state: state,
        access_type: "offline",
        prompt: "select_account",
      });

      return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    }

    throw new Error(`OAuth provider ${provider} is not configured.`);
  }

  /**
   * Exchanges an authorization code for normalized user profile data.
   * @param {string} provider - Auth provider (e.g. 'google')
   * @param {string} code - Authorization code from callback
   * @returns {Promise<{providerId: string, email: string, name: string, avatarUrl: string}>}
   */
  async getNormalizedProfile(provider, code) {
    const p = provider?.toLowerCase();
    if (!this.isProviderSupported(p)) {
      throw new Error(`Unsupported OAuth provider: ${provider}`);
    }

    if (p === "google") {
      return await this.getGoogleProfile(code);
    }

    throw new Error(
      `OAuth provider ${provider} profile exchange is not configured.`
    );
  }

  /**
   * Google-specific token exchange and userinfo profile fetch.
   * @param {string} code
   */
  async getGoogleProfile(code) {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI;

    if (!clientId || !clientSecret || !redirectUri) {
      throw new Error("Google OAuth environment variables are missing.");
    }

    // 1. Exchange code for access_token
    const tokenResponse = await axios.post(
      "https://oauth2.googleapis.com/token",
      new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }).toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const { access_token } = tokenResponse.data;

    // 2. Fetch user profile from Google UserInfo endpoint
    const profileResponse = await axios.get(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    const data = profileResponse.data;

    if (!data || !data.email) {
      const error = new Error("No email provided by Google OAuth.");
      error.code = "no_email_provided";
      throw error;
    }

    return {
      providerId: data.id,
      email: data.email,
      name: data.name || data.email.split("@")[0],
      avatarUrl: data.picture || "",
    };
  }
}

module.exports = new OAuthUtility();
