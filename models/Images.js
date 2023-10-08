class Images {
    imageId;
	imageUrl;
	usageCount;
    createdAt;

	constructor(params) {
        this.imageId = params.imageId;
		this.imageUrl = params.imageUrl;
		this.usageCount = params.usageCount;
		this.createdAt = new Date.now();
	}

	getSubscriptionData() {
		return {
			imageUrl: this.imageUrl,
			usageCount: this.usageCount,
		};
	}
}

module.exports = Images;
