type StoredLink = {
  email: string;
  url: string;
  createdAt: number;
};

const globalForMagic = globalThis as unknown as {
  __fiveAmMagicLink?: StoredLink | null;
};

export function storeDevMagicLink(email: string, url: string): void {
  globalForMagic.__fiveAmMagicLink = {
    email: email.toLowerCase(),
    url,
    createdAt: Date.now(),
  };
}

export function readDevMagicLink(email?: string): StoredLink | null {
  const stored = globalForMagic.__fiveAmMagicLink ?? null;
  if (!stored) {
    return null;
  }
  // Expire after 15 minutes
  if (Date.now() - stored.createdAt > 15 * 60 * 1000) {
    globalForMagic.__fiveAmMagicLink = null;
    return null;
  }
  if (email && stored.email !== email.toLowerCase()) {
    return null;
  }
  return stored;
}
