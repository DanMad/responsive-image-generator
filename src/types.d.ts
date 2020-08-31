declare interface Array<T> {
  indexOf: (searchElement: any, fromIndex?: any) => number;
}

declare interface Object {
  keys: (obj: any) => string[];
}

declare interface String {
  trim(): string;
}

interface Breakpoints {
  l: string;
  m: string;
  s: string;
  xl: string;
  xs: string;
}

interface Asset {
  args: AssetArgs;
  index: number;
  layerId: number;
}

interface AssetArgPatterns {
  context: RegExp;
  def: RegExp;
  ext: RegExp;
  qual: RegExp;
  size: RegExp;
}

interface AssetArgs {
  context?: string;
  def?: string;
  ext: string;
  name: string;
  qual?: string;
  size?: string;
}

type AssetParam = `context` | `def` | `ext` | `qual` | `size`;
type Assets = Asset[];

interface Context {
  assets: Assets;
  maxWidth?: string;
}

interface Contexts {
  l?: Context;
  m?: Context;
  s?: Context;
  unset?: Context;
  xl?: Context;
  xs?: Context;
}

type TShirtSize = `l` | `m` | `s` | `unset` | `xl` | `xs`;
type TShirtSizes = TShirtSize[];

interface TempImage {
  alt: string;
  compress: boolean;
  contexts: Contexts;
  name: string;
  srcDir: string;
}

interface EditTexts {
  l?: EditText;
  m?: EditText;
  s?: EditText;
  unset?: EditText;
  xl?: EditText;
  xs?: EditText;
}
