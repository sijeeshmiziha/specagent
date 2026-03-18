/**
 * Shared helpers for example modules (headers, etc.).
 */

export function printHeader(title: string, description: string): void {
  console.log('');
  console.log(`  ${title}`);
  console.log('  ' + '─'.repeat(Math.min(50, description.length)));
  console.log(`  ${description}`);
  console.log('');
}
