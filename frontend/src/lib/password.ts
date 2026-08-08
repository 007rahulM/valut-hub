export function generateStrongPassword(length = 16): string {
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

  const chars = [
    UPPER[randInt(UPPER.length)],
    LOWER[randInt(LOWER.length)],
    DIGITS[randInt(DIGITS.length)],
    SYMBOLS[randInt(SYMBOLS.length)],
  ];
  
  for (let i = chars.length; i < length; i++) {
    chars.push(all[randInt(all.length)]);
  }
  
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  
  return chars.join("");
}