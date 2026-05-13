export interface ProtectedRegion {
  placeholder: string
  original: string
}

export interface PreprocessResult {
  sanitized: string
  regions: ProtectedRegion[]
}

export function preprocessInput(input: string): PreprocessResult {
  const regions: ProtectedRegion[] = []
  let sanitized = input
  let counter = 0

  const protect = (match: string): string => {
    const placeholder = `[PROTECTED_${counter++}]`
    regions.push({ placeholder, original: match })
    return placeholder
  }

  // Triple backtick code blocks — Claude will try to complete/improve these
  sanitized = sanitized.replace(/```[\s\S]*?```/g, protect)

  // URLs — Claude shortens these
  sanitized = sanitized.replace(/https?:\/\/[^\s\)\"\'>\]\,]+/g, protect)

  // File paths with optional line numbers — exact format matters
  // e.g. /app/components/UserList.tsx:24:18
  sanitized = sanitized.replace(/(?:\/[\w\-\.]+){2,}(?::\d+)*/g, protect)

  // Inline code in backticks — preserve exact strings
  sanitized = sanitized.replace(/`[^`\n]+`/g, protect)

  return { sanitized, regions }
}

export function restoreProtectedRegions(
  compressed: string,
  regions: ProtectedRegion[]
): string {
  let restored = compressed
  for (const region of regions) {
    // split/join instead of replace: handles $ in replacement strings and replaces all occurrences
    restored = restored.split(region.placeholder).join(region.original)
  }
  return restored
}
