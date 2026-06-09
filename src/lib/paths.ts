/** Directory portion of a file path (no trailing separator). */
export function dirOf(p: string): string {
  return p.replace(/[\\/][^\\/]*$/, "");
}

export function baseName(p: string): string {
  return p.replace(/^.*[\\/]/, "");
}
