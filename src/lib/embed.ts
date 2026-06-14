export function parseEmbedUrl(input: string): { url: string; type: "embed" | "dir" } | null {
  if (!input) return null
  const srcMatch = input.match(/src=["']([^"']+)["']/)
  const url = srcMatch ? srcMatch[1] : (input.startsWith("http") ? input : null)
  if (!url) return null
  return { url, type: url.includes("maps/embed") ? "embed" : "dir" }
}
