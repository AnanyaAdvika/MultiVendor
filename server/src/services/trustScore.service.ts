import { prisma } from '../utils/prisma.js';

export interface VendorTrustMetrics {
  trustScore: number;
  badge: 'TOP_RATED' | 'VERIFIED' | 'STANDARD';
  badgeLabel: string;
  ratingScore: number;
  fulfillmentRate: number;
  onTimeRate: number;
}

export function calculateTrustScore(vendor: {
  rating: number;
  successfulOrders: number;
  cancelledOrders: number;
  onTimeDeliveries: number;
  isEcoFriendlyCertified?: boolean;
}): VendorTrustMetrics {
  const totalCompleted = vendor.successfulOrders;
  const totalHandled = vendor.successfulOrders + vendor.cancelledOrders;

  // 1. Rating factor (40 points max): 5 stars -> 40 points
  const ratingScore = Math.min(40, (vendor.rating / 5.0) * 40);

  // 2. Fulfillment rate factor (30 points max): Successful vs Cancelled
  const fulfillmentRate = totalHandled > 0 ? (totalCompleted / totalHandled) : 1.0;
  const fulfillmentScore = fulfillmentRate * 30;

  // 3. On-time delivery rate factor (20 points max)
  const onTimeRate = totalCompleted > 0 ? Math.min(1.0, vendor.onTimeDeliveries / totalCompleted) : 1.0;
  const onTimeScore = onTimeRate * 20;

  // 4. Verification & Eco Certification base factor (10 points max)
  const baseVerificationScore = vendor.isEcoFriendlyCertified ? 10 : 8;

  const rawScore = ratingScore + fulfillmentScore + onTimeScore + baseVerificationScore;
  const trustScore = Math.min(100, Math.max(0, Math.round(rawScore * 10) / 10));

  let badge: 'TOP_RATED' | 'VERIFIED' | 'STANDARD' = 'STANDARD';
  let badgeLabel = 'Active Seller';

  if (trustScore >= 90) {
    badge = 'TOP_RATED';
    badgeLabel = 'Top Rated Trusted Vendor';
  } else if (trustScore >= 75) {
    badge = 'VERIFIED';
    badgeLabel = 'Verified Vendor';
  }

  return {
    trustScore,
    badge,
    badgeLabel,
    ratingScore: Math.round(ratingScore * 10) / 10,
    fulfillmentRate: Math.round(fulfillmentRate * 100),
    onTimeRate: Math.round(onTimeRate * 100),
  };
}

export async function recalculateVendorTrust(vendorId: string) {
  const vendor = await prisma.vendor.findUnique({
    where: { id: vendorId },
  });

  if (!vendor) return null;

  const metrics = calculateTrustScore(vendor);

  const updated = await prisma.vendor.update({
    where: { id: vendorId },
    data: {
      trustScore: metrics.trustScore,
    },
  });

  return { ...updated, metrics };
}
