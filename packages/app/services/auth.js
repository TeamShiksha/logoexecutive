const UserService = require("./users");
const SubscriptionService = require("./subscriptions");
const oauthUtility = require("../utils/oauth");

class AuthService {
  constructor() {
    this.userService = new UserService();
    this.subscriptionService = new SubscriptionService();
  }

  /**
   * Processes the OAuth callback for any supported provider.
   * @param {string} provider - Provider name (e.g. 'google')
   * @param {string} code - OAuth authorization code
   * @returns {Promise<Object>} Resolves to user document
   */
  async processOAuthCallback(provider, code) {
    // 1. Get normalized profile from utility
    const profile = await oauthUtility.getNormalizedProfile(provider, code);
    const { providerId, email, name } = profile;

    if (!email) {
      const err = new Error("No email provided by OAuth provider.");
      err.code = "no_email_provided";
      throw err;
    }

    // 2. Look up user by provider ID
    let user = await this.userService.getUserByProviderId(provider, providerId);

    if (user) {
      if (user.is_deleted) {
        const err = new Error("Account has been deleted.");
        err.code = "account_deleted";
        throw err;
      }
      return user;
    }

    // 3. Look up user by email
    user = await this.userService.getUserByEmail(email);

    if (user) {
      if (user.is_deleted) {
        const err = new Error("Account has been deleted.");
        err.code = "account_deleted";
        throw err;
      }

      // Link provider ID to existing account
      await this.userService.linkProviderId(user._id, provider, providerId);
      user = await this.userService.getUserByEmail(email);
      return user;
    }

    // 4. Create new user + subscription
    const subscription = await this.subscriptionService.createSubscription();
    if (!subscription) {
      throw new Error("Failed to create user subscription.");
    }

    const newUser = await this.userService.createOAuthUser({
      name,
      email,
      provider,
      providerId,
      subscription_id: subscription._id,
    });

    return newUser;
  }
}

module.exports = AuthService;
