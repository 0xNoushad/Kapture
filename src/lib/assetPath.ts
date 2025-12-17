export async function getAssetPath(relativePath: string): Promise<string> {
  // Web: assets are served from public folder
  return `/${relativePath.replace(/^\//, "")}`;
}

export default getAssetPath;
