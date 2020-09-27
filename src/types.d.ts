/**
 *  Adobe® Photoshop's application object
 */
declare const app: any;

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
  maxWidths: Partial<Record<AssetContext, number>>;
  name: string;
  srcDir: string;
};
