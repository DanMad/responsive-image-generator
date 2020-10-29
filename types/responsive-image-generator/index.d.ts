/**
 * An asset object.
 */
type Asset = {
  context?: string;
  def?: string;
  ext: string;
  int: number;
  name: string;
  qual?: string;
  size?: string;
};

/**
 * The argments of the context parameter.
 */
type AssetContext = "l" | "m" | "s" | "xl" | "xs";

/**
 * The parameters of an asset.
 */
type AssetParam = "ext" | "context" | "def" | "name" | "qual" | "size";

/**
 * A responsive image.
 */
type ResponsiveImage = {
  altText: string;
  fileName: string;
  maxWidths: Partial<Record<AssetContext, number>>;
  srcDir: string;
};
