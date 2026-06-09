/** Split text around case-insensitive occurrences of query, wrapping matches in <mark>. */
export function highlightText(text: string, query: string) {
  if (!query) return text;
  const lower = text.toLowerCase();
  const q = query.toLowerCase();
  const out: React.ReactNode[] = [];
  let i = 0;
  let idx = lower.indexOf(q);
  let key = 0;
  while (idx !== -1) {
    if (idx > i) out.push(text.slice(i, idx));
    out.push(<mark key={key++}>{text.slice(idx, idx + query.length)}</mark>);
    i = idx + query.length;
    idx = lower.indexOf(q, i);
  }
  if (i < text.length) out.push(text.slice(i));
  return out;
}
