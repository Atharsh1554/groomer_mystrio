// Utility function to search for images using the unsplash_tool
// This is a wrapper around the unsplash_tool to provide a consistent interface

let unsplashToolFunction: ((query: string) => Promise<string>) | null = null;

// This function will be called by the unsplash_tool
export async function unsplash_tool(query: string): Promise<string> {
  // This is a placeholder - the actual unsplash_tool is called via the tool system
  // In the component, we'll use the actual tool call
  throw new Error('This function should be replaced with actual tool calls');
}

// Cache for image URLs to avoid repeated API calls
const imageCache = new Map<string, string>();

export async function getCachedImage(query: string): Promise<string | null> {
  return imageCache.get(query) || null;
}

export function setCachedImage(query: string, url: string): void {
  imageCache.set(query, url);
}