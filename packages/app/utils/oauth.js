const crypto = require("crypto");
const axios = require("axios");
const {
  AuthProvider,
  OAuthProviders,
  OAuthErrorCodes,
  Messages,
} = require("./constants");

const PROVIDER_CONFIG = {
  [AuthProvider.DISCORD]: {
    authUrl: "https://discord.com/api/oauth2/authorize",
    tokenUrl: "https://discord.com/api/oauth2/token",
    userUrl: "https://discord.com/api/users/@me",
    scopes: "identify email",
    envPrefix: "DISCORD",
  },
  [AuthProvider.GOOGLE]: {
    authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    userUrl: "https://www.googleapis.com/oauth2/v2/userinfo",
    scopes: "openid email profile",
    envPrefix: "GOOGLE",
  },
  [AuthProvider.LINKEDIN]: {
    authUrl: "https://www.linkedin.com/oauth/v2/authorization",
    tokenUrl: "https://www.linkedin.com/oauth/v2/accessToken",
    userUrl: "https://api.linkedin.com/v2/userinfo",
    scopes: "openid profile email",
    envPrefix: "LINKEDIN",
  },
  [AuthProvider.GITHUB]: {
    authUrl: "https://github.com/login/oauth/authorize",
    tokenUrl: "https://github.com/login/oauth/access_token",
    userUrl: "https://api.github.com/user",
    emailsUrl: "https://api.github.com/user/emails",
    scopes: "user:email",
    envPrefix: "GITHUB",
  },
};

/**
 * @param {string} provider
 * @returns {boolean}
 */
function isSupportedProvider(provider) {
  return OAuthProviders.includes(provider);
}

/**
 * @param {string} provider
 * @returns {{ clientId: string, clientSecret: string, redirectUri: string }}
 */
function getProviderCredentials(provider) {
  const config = PROVIDER_CONFIG[provider];
  if (!config) {
    const error = new Error(Messages.UNSUPPORTED_OAUTH_PROVIDER);
    error.code = OAuthErrorCodes.UNSUPPORTED_PROVIDER;
    throw error;
  }

  const clientId = process.env[`${config.envPrefix}_CLIENT_ID`];
  const clientSecret = process.env[`${config.envPrefix}_CLIENT_SECRET`];
  const redirectUri = process.env[`${config.envPrefix}_REDIRECT_URI`];

  if (!clientId || !clientSecret || !redirectUri) {
    const error = new Error(Messages.OAUTH_NOT_CONFIGURED);
    error.code = OAuthErrorCodes.OAUTH_FAILED;
    throw error;
  }

  return { clientId, clientSecret, redirectUri };
}

/**
 * Generates a cryptographically random OAuth state value.
 * @returns {string}
 */
function generateState() {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Builds the provider authorization URL and accompanying CSRF state.
 * @param {string} provider
 * @returns {{ url: string, state: string }}
 */
function generateAuthUrl(provider) {
  if (!isSupportedProvider(provider)) {
    const error = new Error(Messages.UNSUPPORTED_OAUTH_PROVIDER);
    error.code = OAuthErrorCodes.UNSUPPORTED_PROVIDER;
    throw error;
  }

  const config = PROVIDER_CONFIG[provider];
  const { clientId, redirectUri } = getProviderCredentials(provider);
  const state = generateState();

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: config.scopes,
    state,
  });

  if (provider === AuthProvider.GOOGLE) {
    params.set("access_type", "offline");
    params.set("prompt", "consent");
  }

  return {
    url: `${config.authUrl}?${params.toString()}`,
    state,
  };
}

/**
 * Exchanges an authorization code for an access token.
 * @param {string} provider
 * @param {string} code
 * @returns {Promise<string>}
 */
async function exchangeCodeForToken(provider, code) {
  const config = PROVIDER_CONFIG[provider];
  const { clientId, clientSecret, redirectUri } =
    getProviderCredentials(provider);

  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    code,
    redirect_uri: redirectUri,
    grant_type: "authorization_code",
  });

  const headers = {
    "Content-Type": "application/x-www-form-urlencoded",
    Accept: "application/json",
  };

  const { data } = await axios.post(config.tokenUrl, body.toString(), {
    headers,
  });

  if (!data.access_token) {
    const error = new Error(Messages.OAUTH_FAILED);
    error.code = OAuthErrorCodes.OAUTH_FAILED;
    throw error;
  }

  return data.access_token;
}

/**
 * Normalises a Discord user profile.
 * @param {Object} data
 * @returns {{ id: string, email: string|null, username: string, avatar: string|null }}
 */
function normalizeDiscordProfile(data) {
  const avatar = data.avatar
    ? `https://cdn.discordapp.com/avatars/${data.id}/${data.avatar}.png`
    : null;

  return {
    id: String(data.id),
    email: data.email || null,
    username: data.global_name || data.username || data.email?.split("@")[0],
    avatar,
  };
}

/**
 * Normalises a Google user profile.
 * @param {Object} data
 * @returns {{ id: string, email: string|null, username: string, avatar: string|null }}
 */
function normalizeGoogleProfile(data) {
  return {
    id: String(data.id),
    email: data.email || null,
    username: data.name || data.email?.split("@")[0],
    avatar: data.picture || null,
  };
}

/**
 * Normalises a LinkedIn OpenID userinfo profile.
 * @param {Object} data
 * @returns {{ id: string, email: string|null, username: string, avatar: string|null }}
 */
function normalizeLinkedInProfile(data) {
  return {
    id: String(data.sub),
    email: data.email || null,
    username: data.name || data.email?.split("@")[0],
    avatar: data.picture || null,
  };
}

/**
 * Normalises a GitHub user profile.
 * @param {Object} data
 * @param {string|null} [email]
 * @returns {{ id: string, email: string|null, username: string, avatar: string|null }}
 */
function normalizeGitHubProfile(data, email = null) {
  return {
    id: String(data.id),
    email: email || data.email || null,
    username: data.name || data.login || email?.split("@")[0],
    avatar: data.avatar_url || null,
  };
}

/**
 * Fetches the primary verified email from GitHub when the user profile omits it.
 * @param {string} accessToken
 * @returns {Promise<string|null>}
 */
async function fetchGitHubPrimaryEmail(accessToken) {
  const { data } = await axios.get(PROVIDER_CONFIG[AuthProvider.GITHUB].emailsUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github+json",
    },
  });

  if (!Array.isArray(data)) {
    return null;
  }

  const primary = data.find((entry) => entry.primary && entry.verified);
  if (primary?.email) {
    return primary.email;
  }

  const verified = data.find((entry) => entry.verified);
  return verified?.email || null;
}

/**
 * Exchanges an authorization code for a normalised OAuth profile.
 * @param {string} provider
 * @param {string} code
 * @returns {Promise<{ id: string, email: string|null, username: string, avatar: string|null }>}
 */
async function exchangeCodeForProfile(provider, code) {
  if (!isSupportedProvider(provider)) {
    const error = new Error(Messages.UNSUPPORTED_OAUTH_PROVIDER);
    error.code = OAuthErrorCodes.UNSUPPORTED_PROVIDER;
    throw error;
  }

  try {
    const accessToken = await exchangeCodeForToken(provider, code);
    const config = PROVIDER_CONFIG[provider];

    const { data } = await axios.get(config.userUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    });

    let profile;
    switch (provider) {
      case AuthProvider.DISCORD:
        profile = normalizeDiscordProfile(data);
        break;
      case AuthProvider.GOOGLE:
        profile = normalizeGoogleProfile(data);
        break;
      case AuthProvider.LINKEDIN:
        profile = normalizeLinkedInProfile(data);
        break;
      case AuthProvider.GITHUB: {
        let email = data.email || null;
        if (!email) {
          email = await fetchGitHubPrimaryEmail(accessToken);
        }
        profile = normalizeGitHubProfile(data, email);
        break;
      }
      default: {
        const error = new Error(Messages.UNSUPPORTED_OAUTH_PROVIDER);
        error.code = OAuthErrorCodes.UNSUPPORTED_PROVIDER;
        throw error;
      }
    }

    if (!profile.email) {
      const error = new Error(Messages.NO_EMAIL_PROVIDED);
      error.code = OAuthErrorCodes.NO_EMAIL_PROVIDED;
      throw error;
    }

    return profile;
  } catch (err) {
    if (err.code && Object.values(OAuthErrorCodes).includes(err.code)) {
      throw err;
    }
    const error = new Error(Messages.OAUTH_FAILED);
    error.code = OAuthErrorCodes.OAUTH_FAILED;
    error.cause = err;
    throw error;
  }
}

module.exports = {
  isSupportedProvider,
  getProviderCredentials,
  generateState,
  generateAuthUrl,
  exchangeCodeForProfile,
  PROVIDER_CONFIG,
};
