export function generateTrackingToken(campaignId: string, userId: string): string {
  return Buffer.from(`${campaignId}:${userId}`).toString("base64url");
}

export function decodeTrackingToken(
  token: string
): { campaignId: string; userId: string } | null {
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf8");
    const [campaignId, userId] = decoded.split(":");
    if (!campaignId || !userId) return null;
    return { campaignId, userId };
  } catch {
    return null;
  }
}
