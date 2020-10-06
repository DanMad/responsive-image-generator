/**
 * An asset object.
 */
type Asset = {
  def: number;
  fileName: string;
  id: number;
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
