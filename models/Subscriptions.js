class Subscriptions {
  subscriptionId;
  userId;
  isActive;
  createdAt;

  constructor(params) {
    this.subscriptionId = params.subscriptionId;
    this.userId = params.userId;
    this.isActive = params.isActive;
    this.createdAt = new Date.now();
  }

  getSubscriptionData() {
    return {
      subscriptionId: this.subscriptionId,
      isActive: this.isActive,
      createdAt: this.createdAt,
    };
  }
}

module.exports = Subscriptions;
