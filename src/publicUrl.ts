/** Build a URL to an asset served from Vite's public directory. */
export function publicUrl(path: string): string {
  return `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`
}

export const hasZimApi = !import.meta.env.BASE_URL.startsWith('/Qalam/')
