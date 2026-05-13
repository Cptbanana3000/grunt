export interface ValidationResult {
  passed: boolean
  failures: ValidationFailure[]
}

export interface ValidationFailure {
  type: 'url_missing' | 'code_missing' | 'longer_than_input' | 'empty_output'
  detail: string
  originalSnippet?: string
}

export function validateCompression(
  original: string,
  compressed: string
): ValidationResult {
  const failures: ValidationFailure[] = []

  // Check 1: Output must not be empty
  if (!compressed || compressed.trim().length === 0) {
    failures.push({
      type: 'empty_output',
      detail: 'Compressed output is empty'
    })
    return { passed: false, failures }
  }

  // Check 2: Output must be shorter than input
  if (compressed.length >= original.length) {
    failures.push({
      type: 'longer_than_input',
      detail: `Output (${compressed.length} chars) is not shorter than input (${original.length} chars)`
    })
  }

  // Check 3: All URLs present in original must exist in compressed
  const urlRegex = /https?:\/\/[^\s\)\"\']+/g
  const originalUrls = original.match(urlRegex) || []
  for (const url of originalUrls) {
    if (!compressed.includes(url)) {
      failures.push({
        type: 'url_missing',
        detail: `URL was lost during compression`,
        originalSnippet: url
      })
    }
  }

  // Check 4: Code blocks present in original must exist in compressed
  const codeBlockRegex = /```[\s\S]*?```/g
  const originalCodeBlocks = original.match(codeBlockRegex) || []
  for (const block of originalCodeBlocks) {
    if (!compressed.includes(block)) {
      failures.push({
        type: 'code_missing',
        detail: `Code block was lost or modified during compression`,
        originalSnippet: block.substring(0, 50) + '...'
      })
    }
  }

  return {
    passed: failures.length === 0,
    failures
  }
}
