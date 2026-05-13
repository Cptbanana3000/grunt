export const PLANS = {
  free: {
    name: 'Free',
    dailyCompressions: 10,
    levels: ['lite', 'full'] as const,
    price: 0,
  },
  pro: {
    name: 'Pro',
    dailyCompressions: Infinity,
    levels: ['lite', 'full', 'ultra', 'wenyan'] as const,
    price: 5,
  },
}

export type Plan = keyof typeof PLANS
export type CompressionLevel = 'lite' | 'full' | 'ultra' | 'wenyan'

export function canUseLevel(plan: Plan, level: CompressionLevel): boolean {
  return (PLANS[plan].levels as readonly string[]).includes(level)
}

export function isWithinDailyLimit(plan: Plan, usedToday: number): boolean {
  return usedToday < PLANS[plan].dailyCompressions
}
