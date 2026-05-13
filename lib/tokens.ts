// Rough token estimation (GPT-style: ~4 chars per token)
// For accurate counts you'd use tiktoken, but this is good enough for display
export function estimateTokens(text: string): number {
  return Math.round(text.length / 4);
}

export function estimateCostSavings(
  inputTokensBefore: number,
  inputTokensAfter: number
): number {
  // Using claude-haiku pricing: $0.25 per 1M input tokens
  const COST_PER_TOKEN = 0.00000025;
  const saved = inputTokensBefore - inputTokensAfter;
  return Math.max(0, saved * COST_PER_TOKEN);
}

export function formatCostPer1000(costPerCall: number): string {
  const per1000 = costPerCall * 1000;
  if (per1000 < 0.01) return `$${(per1000 * 100).toFixed(2)}¢`;
  return `$${per1000.toFixed(3)}`;
}
