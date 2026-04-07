export function formatTabLabel(label: string): string {
  if (!label) return '';
  return label
    .replace(/[-_]+/g, ' ')
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}
