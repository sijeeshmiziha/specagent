export function truncateTail(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  const omitted = text.length - maxLen;
  return `[...${omitted} characters omitted from start...]\n\n${text.slice(-maxLen)}`;
}
