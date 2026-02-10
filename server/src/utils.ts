const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

export function generateUsername(length: number = 16): string {
  let result = "";
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  for (let i = 0; i < length; i++) {
    result += CHARS[bytes[i] % CHARS.length];
  }
  return result;
}

export function generateMessageId(): string {
  return crypto.randomUUID();
}
