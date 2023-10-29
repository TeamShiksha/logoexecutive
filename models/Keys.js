class Keys {
	keyId;
	userId;
	key;
	usageCount;
	createdAt;

	constructor(params) {
		this.keyId = params.keyId;
		this.userId = params.userId;
		this.key = params.key;
		this.usageCount = params.usageCount || 0;
		this.createdAt = new Date.now();
	}

	getKeyData() {
		return {
			key: this.key,
			usageCount: this.usageCount,
			createdAt: this.createdAt,
		};
	}
}

module.exports = Keys;
