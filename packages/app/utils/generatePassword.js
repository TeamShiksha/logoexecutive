const crypto = require("crypto");

/**
 * Generates a cryptographically secure random password of specified length.
 *
 * This function uses a CSPRNG to generate passwords using a combination of lowercase letters,
 * digits, and special characters. Default length is 12 characters.
 *
 * Ensures the password always contains at least:
 * - 1 lowercase letter
 * - 1 uppercase letter
 * - 1 digit
 * - 1 special character
 *
 * @param {number} [length=12] - The desired length of the generated password. Default is 12.
 * @returns {string} A secure randomly generated password.
 *
 * @example
 * const password = generatePassword(16);
 * console.log(password); // Outputs a 16-character random password.
 */
function generatePassword(length = 12) {
  const lower = "abcdefghijklmnopqrstuvwxyz";
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const digits = "0123456789";
  const specials = "!@#$%^&*";

  const allChars = lower + upper + digits + specials;

  // Ensure at least one from each set
  let password = [
    lower[crypto.randomBytes(1)[0] % lower.length],
    upper[crypto.randomBytes(1)[0] % upper.length],
    digits[crypto.randomBytes(1)[0] % digits.length],
    specials[crypto.randomBytes(1)[0] % specials.length],
  ];

  // Fill the rest randomly
  const randomBytes = crypto.randomBytes(length - 4);
  for (let i = 0; i < randomBytes.length; i++) {
    password.push(allChars[randomBytes[i] % allChars.length]);
  }

  // Shuffle the array to avoid predictable first 4 chars (Fisher-Yates shuffle)
  for (let i = password.length - 1; i > 0; i--) {
    const j = crypto.randomBytes(1)[0] % (i + 1);
    [password[i], password[j]] = [password[j], password[i]];
  }

  return password.join("");
}

module.exports = { generatePassword };
