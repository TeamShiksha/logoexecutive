const nodeCrypto = require("node:crypto");
const { encrypt, decrypt } = require("../../utils/crypto");

const CRYPTO_KEY = nodeCrypto.randomBytes(32).toString("hex");

describe("crypto utility", () => {
  let originalKey;

  beforeAll(() => {
    originalKey = process.env.CRYPTO_KEY;
    process.env.CRYPTO_KEY = CRYPTO_KEY;
  });

  afterAll(() => {
    process.env.CRYPTO_KEY = originalKey;
  });

  describe("encrypt", () => {
    it("returns base64 encoded ciphertext, iv and tag", () => {
      const { encrypted, iv, tag } = encrypt("openlogo");

      expect(encrypted).not.toBe("openlogo");
      expect(Buffer.from(iv, "base64")).toHaveLength(12);
      expect(Buffer.from(tag, "base64")).toHaveLength(16);
    });

    it("uses a fresh iv for every call so ciphertexts differ", () => {
      const first = encrypt("openlogo");
      const second = encrypt("openlogo");

      expect(first.iv).not.toBe(second.iv);
      expect(first.encrypted).not.toBe(second.encrypted);
    });
  });

  describe("decrypt", () => {
    it("round-trips the plaintext", () => {
      const { encrypted, iv, tag } = encrypt("super-secret-api-key");

      expect(decrypt(encrypted, iv, tag)).toBe("super-secret-api-key");
    });

    it("round-trips multi-byte characters", () => {
      const text = "ओपनलोगो — logo";
      const { encrypted, iv, tag } = encrypt(text);

      expect(decrypt(encrypted, iv, tag)).toBe(text);
    });

    it("rejects a tampered authentication tag", () => {
      const { encrypted, iv } = encrypt("openlogo");
      const tamperedTag = Buffer.alloc(16).toString("base64");

      expect(() => decrypt(encrypted, iv, tamperedTag)).toThrow();
    });

    it("rejects ciphertext decrypted with a different key", () => {
      const { encrypted, iv, tag } = encrypt("openlogo");
      process.env.CRYPTO_KEY = nodeCrypto.randomBytes(32).toString("hex");

      expect(() => decrypt(encrypted, iv, tag)).toThrow();

      process.env.CRYPTO_KEY = CRYPTO_KEY;
    });
  });
});
