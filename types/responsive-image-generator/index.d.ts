/**
 * An asset object.
 */
type Asset = {
  context?: string;
  def?: string;
  ext: string;
  name: string;
  qual?: string;
  size?: string;
};

/**
 * The argments of the context parameter.
 */
type AssetContext = 'l' | 'm' | 's' | 'xl' | 'xs';

/**
 * The parameters of an asset.
 */
type AssetParam = 'ext' | 'context' | 'def' | 'name' | 'qual' | 'size';

/**
 * All necessary responsive image information.
 */
type ResponsiveImageInfo = {
  assets: Partial<Record<AssetContext, Asset[]>>;
  contexts: AssetContext[];
  dialog: any;
  docName: string;
  layers: any[];
  path: string;
};
