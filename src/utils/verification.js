import { apiCall } from 'nexus-module';

/**
 * Verification tier thresholds in DIST tokens.
 * Matches distordia_com/verification/api.js standards.
 */
export const TIER_THRESHOLDS = {
  L0: 1,
  L1: 1000,
  L2: 10000,
  L3: 100000,
};

/**
 * Tier display configuration for beautiful badge rendering.
 */
export const TIER_CONFIG = {
  L1: { label: 'Verified L1', description: 'Basic Verification', color: '#43a047' },
  L2: { label: 'Verified L2', description: 'Business Verified', color: '#1e88e5' },
  L3: { label: 'Verified L3', description: 'Premium Verified', color: '#ffd700' },
};

const DISTORDIA_NAMESPACE = 'distordia';

// Cache verified namespaces to avoid repeated API calls
let verifiedCache = {};
let cacheTimestamp = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Fetch verified namespaces for a given tier from the on-chain registry.
 * Registry assets are named: distordia:{TIER}-verified-{index}
 */
async function fetchVerifiedForTier(tier) {
  const namespaces = [];
  let assetIndex = 1;
  let hasMore = true;

  while (hasMore) {
    try {
      const assetName = `${DISTORDIA_NAMESPACE}:${tier}-verified-${assetIndex}`;
      const result = await apiCall('register/get/asset', {
        name: assetName,
      });

      if (result && result['distordia-type'] === 'verification-registry') {
        const entries = JSON.parse(result.namespaces || '[]');
        namespaces.push(
          ...entries.map((e) => ({
            ...e,
            tier: tier,
          }))
        );
      }
      assetIndex++;
    } catch {
      hasMore = false;
    }
  }

  return namespaces;
}

/**
 * Fetch all verified namespaces across all tiers.
 * Results are cached for CACHE_TTL milliseconds.
 */
export async function fetchAllVerified() {
  const now = Date.now();
  if (now - cacheTimestamp < CACHE_TTL && Object.keys(verifiedCache).length > 0) {
    return verifiedCache;
  }

  const allVerified = {};

  for (const tier of ['L3', 'L2', 'L1']) {
    try {
      const tierNamespaces = await fetchVerifiedForTier(tier);
      for (const ns of tierNamespaces) {
        // Higher tier takes precedence
        if (!allVerified[ns.genesis]) {
          allVerified[ns.genesis] = {
            namespace: ns.namespace,
            genesis: ns.genesis,
            tier: tier,
            balance: ns.balance,
          };
        }
      }
    } catch {
      // Tier fetch failed, skip
    }
  }

  verifiedCache = allVerified;
  cacheTimestamp = now;

  return allVerified;
}

/**
 * Look up the verification tier for a genesis ID.
 * Returns the tier string (L1/L2/L3) or null if not verified.
 */
export function getTierForGenesis(genesisId, verifiedMap) {
  if (!verifiedMap || !genesisId) return null;
  const entry = verifiedMap[genesisId];
  return entry ? entry.tier : null;
}

/**
 * Format a genesis/address for display.
 */
export function formatAddress(address, length = 12) {
  if (!address) return 'Unknown';
  if (address.length <= length) return address;
  const half = Math.floor(length / 2);
  return `${address.slice(0, half)}...${address.slice(-half)}`;
}

/**
 * Format a UNIX timestamp for display.
 */
export function formatTime(timestamp) {
  if (!timestamp) return 'Unknown';
  const date = new Date(timestamp * 1000);
  const now = new Date();
  const diff = (now - date) / 1000;

  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;

  return date.toLocaleDateString();
}
