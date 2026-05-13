import Anthropic from '@anthropic-ai/sdk'
import { ValidationFailure } from './validate'

const anthropic = new Anthropic()

export async function repairCompression(
  original: string,
  compressed: string,
  failures: ValidationFailure[]
): Promise<string> {
  // Hard fallback for length violations — should be extremely rare after max_tokens cap
  const lengthFailure = failures.find(f => f.type === 'longer_than_input')
  if (lengthFailure) {
    return original
  }

  const missingItems = failures
    .filter(f => f.originalSnippet)
    .map(f => f.originalSnippet!)

  if (missingItems.length === 0) return compressed

  const repairPrompt = `The following compressed text is missing some technical content from the original.

COMPRESSED TEXT:
${compressed}

MISSING ITEMS THAT MUST BE REINSERTED:
${missingItems.map((item, i) => `${i + 1}. ${item}`).join('\n')}

Reinsert each missing item into the most logical position in the compressed text. Do not change anything else. Output only the fixed compressed text:`

  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: Math.ceil(compressed.length / 4) + 200,
    messages: [{ role: 'user', content: repairPrompt }]
  })

  return response.content[0].type === 'text' ? response.content[0].text : compressed
}
