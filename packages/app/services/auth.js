const UserService = require("./users");
const SubscriptionService = require("./subscriptions");
const { exchangeCodeForProfile } = require("../utils/oauth");
const {
  OAuthErrorCodes,
  Messages,
  OAuthProviderIdFields,
} = require("../utils/constants");

class AuthService {
  constructor() {
    this.userService = new UserService();
    this.subscriptionService = new SubscriptionService();
  }

  /**
   * Processes an OAuth callback for any supported provider.
   * Lookup order: provider ID → email (link ID) → create user.
   *
   * @param {string} provider - OAuth provider key.
   * @param {string} code - Authorization code from the provider.
   * @returns {Promise<Object>} - Resolved user document.
   */
  async processOAuthCallback(provider, code) {
    const profile = await exchangeCodeForProfile(provider, code);

    if (!profile.email) {
      const error = new Error(Messages.NO_EMAIL_PROVIDED);
      error.code = OAuthErrorCodes.NO_EMAIL_PROVIDED;
      throw error;
    }

    let user = await this.userService.getUserByProviderId(provider, profile.id);
    if (user) {
      if (user.is_deleted) {
        const error = new Error(Messages.ACCOUNT_DELETED);
        error.code = OAuthErrorCodes.ACCOUNT_DELETED;
        throw error;
      }
      return user;
    }

    user = await this.userService.getUserByEmail(profile.email);
    if (user) {
      if (user.is_deleted) {
        const error = new Error(Messages.ACCOUNT_DELETED);
        error.code = OAuthErrorCodes.ACCOUNT_DELETED;
        throw error;
      }

      const providerIdField = OAuthProviderIdFields[provider];
      if (!user[providerIdField]) {
        await this.userService.linkOAuthProvider(
          user._id,
          provider,
          profile.id
        );
        user = await this.userService.getUser(user._id);
      }
      return user;
    }

    const newSubscription = await this.subscriptionService.createSubscription();
    if (!newSubscription) {
      const error = new Error(Messages.SOMETHING_WENT_WRONG);
      error.code = OAuthErrorCodes.OAUTH_FAILED;
      throw error;
    }

    const newUser = await this.userService.createOAuthUser({
      email: profile.email,
      name: profile.username || profile.email.split("@")[0],
      provider,
      providerId: profile.id,
      subscription_id: newSubscription._id,
    });

    if (!newUser) {
      const error = new Error(Messages.SOMETHING_WENT_WRONG);
      error.code = OAuthErrorCodes.OAUTH_FAILED;
      throw error;
    }

    return newUser;
  }
}

module.exports = AuthService;
