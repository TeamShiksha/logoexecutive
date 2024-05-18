const { createKey, fetchKeysByuserid, isAPIKeyPresent, destroyKey } = require("../../../services");
const { KeyCollection } = require("../../../utils/firestore");
const { Keys } = require("../../../models");
const { Timestamp } = require("firebase-admin/firestore");
const { v4 } = require("uuid");
const { mockKeys } = require("../../../utils/mocks/Keys");

jest.mock("uuid", () => ({
    v4: jest.fn(() => mockKeys[0].keyId),
}));

describe("createKey", () => {
    it("should create a key in the database and return the created key object", async () => {
        jest.spyOn(KeyCollection.doc(mockKeys[0].keyId), "set").mockResolvedValue(true);

        const result = await createKey(mockKeys[0]);
        expect(result).toBeInstanceOf(Keys);
        expect(result.keyId).toBe(mockKeys[0].keyId);
        expect(result.key).toMatch(/^[A-F0-9]{32}$/)
        expect(result.userId).toBe(mockKeys[0].userId);
    });

    it("should throw an error if Firestore operation fails", async () => {
        const errorMessage = "Firestore operation failed";

        jest.spyOn(KeyCollection, "doc").mockImplementationOnce(() => {
            throw new Error("Firestore operation failed");
        });

        await expect(createKey(mockKeys[0])).rejects.toThrow(errorMessage);
    });
});

describe("fetchKeysByuserid", () => {
    it("should fetch keys by userId from the key collection", async () => {
        jest.spyOn(KeyCollection, "where").mockReturnValueOnce({
            get: jest.fn().mockResolvedValueOnce({
                empty: false,
                docs: mockKeys.map(key => ({ data: () => key })),
            }),
        });

        const result = await fetchKeysByuserid(mockKeys[0].userId);
        expect(result.length).toBe(mockKeys.length);
        expect(result[0]).toBeInstanceOf(Keys);
        expect(result[0].keyId).toBe(mockKeys[0].keyId);
        expect(result.length).toBe(mockKeys.length);
    });

    it("should return null if no keys are found for the provided userId", async () => {
        jest.spyOn(KeyCollection, "where").mockReturnValue({
            get: jest.fn().mockResolvedValue({ empty: true }),
        });

        const result = await fetchKeysByuserid(mockKeys[0].userId);
        expect(result).toBeNull();
    });

    it("should throw an error if Firestore operation fails", async () => {
        const errorMessage = "Firestore operation failed";

        jest.spyOn(KeyCollection, "where").mockReturnValue({
            get: jest.fn().mockRejectedValueOnce(new Error(errorMessage))
        });
        await expect(fetchKeysByuserid(mockKeys[0].userId)).rejects.toThrow(errorMessage);
    });
});

describe("isAPIKeyPresent", () => {
    it("should return true if the API key exists in the key collection", async () => {
        const mockApiKey = "mockApiKey";

        jest.spyOn(KeyCollection, "where").mockReturnValueOnce({
            get: jest.fn().mockResolvedValueOnce({ empty: false }),
        });

        const result = await isAPIKeyPresent(mockApiKey);
        expect(result).toBe(true);
    });

    it("should return false if the API key does not exist in the key collection", async () => {
        const mockApiKey = "mockApiKey";

        jest.spyOn(KeyCollection, "where").mockReturnValueOnce({
            get: jest.fn().mockResolvedValueOnce({ empty: true }),
        });

        const result = await isAPIKeyPresent(mockApiKey);
        expect(result).toBe(false);
    });

    it("should throw an error if Firestore operation fails", async () => {
        const mockApiKey = "mockApiKey";
        const errorMessage = "Firestore operation failed";

        jest.spyOn(KeyCollection, "where").mockReturnValue({
            get: jest.fn().mockRejectedValueOnce(new Error(errorMessage))
        });

        await expect(isAPIKeyPresent(mockApiKey)).rejects.toThrow(errorMessage);
    });
});

describe("destroyKey", () => {
    it("should delete the key by keyId from the key collection", async () => {
        const mockKeyId = "mockKeyId";

        jest.spyOn(KeyCollection, "doc").mockReturnValue({
            delete: jest.fn().mockResolvedValue(true)
        });

        const result = await destroyKey(mockKeyId);
        expect(result).toBe(true);
    });

    it("should throw an error if Firestore operation fails", async () => {
        const mockKeyId = "mockKeyId";
        const errorMessage = "Firestore operation failed";

        jest.spyOn(KeyCollection, "doc").mockReturnValue({
            delete: jest.fn().mockRejectedValueOnce(new Error(errorMessage))
        });
        await expect(destroyKey(mockKeyId)).rejects.toThrow(errorMessage);
    });

});
