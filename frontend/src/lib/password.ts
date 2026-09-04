// src/lib/password.ts
// ============================================================
// PASSWORD UTILITIES
// Handles generation and validation of encryption passwords.
// ============================================================

export function generateStrongPassword(length = 12): string {
  const UPPER = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const LOWER = "abcdefghijkmnopqrstuvwxyz";
  const DIGITS = "23456789";
  const SYMBOLS = "!@#$%^&*-_=+?";
  const all = UPPER + LOWER + DIGITS + SYMBOLS;

  const randInt = (max: number) => {
    const b = new Uint32Array(1);
    crypto.getRandomValues(b);
    return b[0] % max;
  };

  // Guarantee at least one of each type
  const chars = [
    UPPER[randInt(UPPER.length)],
    LOWER[randInt(LOWER.length)],
    DIGITS[randInt(DIGITS.length)],
    SYMBOLS[randInt(SYMBOLS.length)],
  ];

  for (let i = chars.length; i < length; i++) {
    chars.push(all[randInt(all.length)]);
  }

  // Shuffle securely
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join("");
}

// Real production validation (Coach)
export function validatePassword(pwd: string): { valid: boolean; message: string } {
  if (!pwd) return { valid: false, message: "" };
  if (pwd.length < 8) return { valid: false, message: "At least 8 characters needed." };
  if (!/[A-Z]/.test(pwd)) return { valid: false, message: "Add at least one uppercase letter (A-Z)." };
  if (!/[a-z]/.test(pwd)) return { valid: false, message: "Add at least one lowercase letter (a-z)." };
  if (!/[0-9]/.test(pwd)) return { valid: false, message: "Add at least one number (0-9)." };
  // NEW: Special character check matching the SYMBOLS list above
  if (!/[!@#$%^&*\-_=+?]/.test(pwd)) return { valid: false, message: "Add at least one special character (e.g., !@#$%)." };
  return { valid: true, message: "Strong password. Ready to lock." };
}