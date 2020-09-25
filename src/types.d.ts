declare interface Array<T> {
  indexOf: (searchElement: any, fromIndex?: any) => number;
}

declare interface Object {
  keys: (obj: any) => string[];
}

declare interface String {
  trim(): string;
}

type AssetContext = `l` | `m` | `s` | `xl` | `xs`;

type RequiredAssetParam = `ext` | `name`;

type OptionalAssetParam = `context` | `def` | `qual` | `size`;

type AssetParam = RequiredAssetParam | OptionalAssetParam;

type Asset = { [key in RequiredAssetParam]: string } &
  { [key in OptionalAssetParam]?: string };

type Assets = {
  contexts: Partial<Record<AssetContext, Asset[]>>;
  layers: Layer[];
};
