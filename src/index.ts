// Polyfills
// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
declare interface Array<T> {
  indexOf: (searchElement: any, fromIndex?: any) => number;
}

// Extends the Array object's interface to include support for
// Array.prototype.indexOf().
if (!Array.prototype.indexOf) {
  Array.prototype.indexOf = function (
    searchElement: any,
    fromIndex?: any
  ): number {
    let k: any;

    if (this == null) {
      // throw new TypeError('"this" is null or not defined');
    }

    const o: any = Object(this);
    const len: number = o.length >>> 0;

    if (len === 0) {
      return -1;
    }

    const n: number = fromIndex | 0;

    if (n >= len) {
      return -1;
    }

    k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);

    for (; k < len; k++) {
      if (k in o && o[k] === searchElement) {
        return k;
      }
    }
    return -1;
  };
}

declare interface Object {
  keys: (obj: any) => string[];
}

// Extends the Object object's interface to include support for Object.keys().
if (!Object.keys) {
  Object.keys = (function (): (obj: any) => string[] {
    const dontEnums: string[] = [
      `toString`,
      `toLocaleString`,
      `valueOf`,
      `hasOwnProperty`,
      `isPrototypeOf`,
      `propertyIsEnumerable`,
      `constructor`,
    ];
    const hasDontEnumBug: boolean = !{ toString: null }.propertyIsEnumerable(
      `toString`
    );
    const hasOwnProperty: (name: string) => boolean =
      Object.prototype.hasOwnProperty;

    return function (obj: any): string[] {
      if (
        typeof obj !== `function` &&
        (typeof obj !== `object` || obj === null)
      ) {
        // ! Determine appropriate error handling solution
        // throw new TypeError('Object.keys called on non-object');
      }

      const result: string[] = [];

      for (let prop in obj) {
        if (hasOwnProperty.call(obj, prop)) {
          result.push(prop);
        }
      }

      if (hasDontEnumBug) {
        for (let i: number = 0; i < dontEnums.length; i++) {
          if (hasOwnProperty.call(obj, dontEnums[i])) {
            result.push(dontEnums[i]);
          }
        }
      }

      return result;
    };
  })();
}

declare interface String {
  trim(): string;
}

// Extends the String object's interface to include support for
// String.prototype.trim().
if (!String.prototype.trim) {
  String.prototype.trim = function (): string {
    return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, ``);
  };
}

// Configuration
// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
interface Breakpoints {
  [key: string]: number;
}

const breakpoints: Breakpoints = {
  l: 1280,
  m: 768,
  s: 480,
  xl: 1920,
  xs: 320,
};

const srcDir: string = `images/`;

// Application
// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
interface Asset {
  definition?: string;
  dimensions?: string;
  extension?: string;
  name?: string;
  quality?: string;
  size?: string;
}

type Assets = Asset[];

type Parameter = `definition` | `dimensions` | `extension` | `quality` | `size`;

// Investigate breaking down into more modular RegExps
interface ArgumentPatterns {
  definition: RegExp;
  dimensions: RegExp;
  extension: RegExp;
  quality: RegExp;
  size: RegExp;
}

interface Size {
  assets: Assets;
  maxWidth?: string;
}

interface Sizes {
  [key: string]: Size;
}

const compressSize = (size: string): string => {
  return size
    .replace(/(e?x(tra)?-*)/gi, `x`)
    .replace(/s(m(al)?l)?$/i, `s`)
    .replace(/m(ed(ium)?)?$/i, `m`)
    .replace(/l((ar)?ge)?$/i, `l`);
};

const getAssetSizes = (cb: (sizes: Sizes) => void): void => {
  const scanLayers = (layers: Layers, cb: (sizes: Sizes) => void): void => {
    const hasAsset = (str: string): boolean => {
      return argPatterns.extension.test(str);
    };
    const isLayerSet = (layer: Layer): layer is LayerSet => {
      return layer.typename === `LayerSet`;
    };
    const setParam = (param: Parameter, str: string, obj: Asset): string => {
      if (argPatterns[param].test(str)) {
        obj[param] = str.match(argPatterns[param])![0];
      }

      return str
        .replace(argPatterns[param], ``)
        .replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0\-_]+$/g, ``);
    };

    const argPatterns: ArgumentPatterns = {
      definition: /@?[1-9]x?$/i,
      dimensions: /^\d{1,5}((\.\d{1,3})?%|([cm]m|in|px)?\s*?x\s*?\d{1,5}([cm]m|in|px)?)(?=\s)/i,
      extension: /\.(gif|jpe?g|png)/i,
      quality: /(([1-9][0-9]?|100)%|10|[1-9])$/,
      size: /(m(ed(ium)?)?|(e?x(tra)?-*)?(s(m(al)?l)?|l((ar)?ge)?))$/i,
    };

    scanDepth++;

    for (let i: number = 0; i < layers.length; i++) {
      const layer: Layer = layers[i];

      if (hasAsset(layer.name)) {
        const statments: string[] = layer.name.split(`,`);

        for (let i: number = 0; i < statments.length; i++) {
          let statement: string = statments[i].trim();

          if (hasAsset(statement)) {
            const asset: Asset = {};

            statement = setParam(`dimensions`, statement, asset);
            statement = setParam(`quality`, statement, asset);
            statement = setParam(`extension`, statement, asset);
            statement = setParam(`definition`, statement, asset);
            statement = setParam(`size`, statement, asset);

            asset.name = statement;

            let size: string;

            if (!!asset.size) {
              size = compressSize(asset.size);
            } else {
              size = `default`;
            }

            if (!!sizes[size]) {
              sizes[size].assets.push(asset);
            } else {
              sizes[size] = {
                assets: [asset],
              };
            }
          }
        }
      }

      if (isLayerSet(layer)) {
        scanLayers(layer.layers, cb);
      }
    }

    scanDepth--;

    if (!scanDepth) {
      cb(sizes);
    }
  };

  const sizes: Sizes = {};

  let scanDepth: number = 0;

  scanLayers(app.activeDocument.layers, cb);
};

const generateResponsiveImage = (img: ResponsiveImage): void => {};

interface EditTextRef {
  [key: string]: EditText;
}

interface ResponsiveImage {
  altText: string;
  compress: boolean;
  prefix: string;
  sizes: Sizes;
  srcDir: string;
}

const promptUser = (sizes: Sizes, cb: (img: ResponsiveImage) => void): void => {
  const handleCancel = (): void => {
    dialog.close();
  };
  const handleSave = (): void => {
    dialog.close();

    const img: ResponsiveImage = {
      altText: altTxtInput.text,
      compress: compressCheckbox.value,
      prefix: prefixInput.text,
      sizes: sizes,
      srcDir: srcDirInput.text,
    };

    for (let i: number = 0; i < sizeInputRefs.length; i++) {
      const sizeInputRef: EditTextRef = sizeInputRefs[i];
      const id: string = Object.keys(sizeInputRef)[0];
      const input: EditText = sizeInputRef[id];

      img.sizes[id].maxWidth = input.text;
    }

    cb(img);
  };
  const sortSizes = (sizes: string[], orderedSizes: string[]): string[] => {
    const sortedSizes: string[] = [];

    for (let i: number = 0; i < orderedSizes.length; i++) {
      const orderedSize: string = orderedSizes[i];

      if (sizes.indexOf(orderedSize) !== -1) {
        sortedSizes.push(orderedSize);
      }
    }

    return sortedSizes;
  };

  const docName: string = app.activeDocument.name.replace(/\.[a-z]{3,4}$/i, ``);
  const sizeInputRefs: EditTextRef[] = [];
  const sizeOrder: string[] = [`xs`, `s`, `m`, `l`, `xl`, `default`];
  const sortedSizes: string[] = sortSizes(Object.keys(sizes), sizeOrder);

  const dialog: Window = new Window(`dialog`, `Generate Responsive Image`);

  // The following statement resolves a presentational issue in PhotoShop where
  // buttons are rendered inconsistently.
  // @ts-ignore
  dialog.cancelElement = null;
  dialog.margins = 16;

  const infoPanel: Panel = dialog.add(`panel`, undefined, `Image Information`);
  infoPanel.alignment = `fill`;
  infoPanel.margins = 16;
  infoPanel.spacing = 12;

  const prefixGroup: Group = infoPanel.add(`group`);
  prefixGroup.add(`statictext`, undefined, `Prefix:`);
  prefixGroup.alignment = `right`;
  prefixGroup.spacing = 0;

  const prefixInput: EditText = prefixGroup.add(`edittext`, undefined, docName);
  prefixInput.active = true;
  prefixInput.characters = 16;
  prefixInput.helpTip = `Add the image's unique id`;

  const srcDirGroup: Group = infoPanel.add(`group`);
  srcDirGroup.add(`statictext`, undefined, `Directory:`);
  srcDirGroup.alignment = `right`;
  srcDirGroup.spacing = 0;

  const srcDirInput: EditText = srcDirGroup.add(`edittext`, undefined, srcDir);
  srcDirInput.characters = 16;
  srcDirInput.helpTip = `Add the image's relative directory`;

  const altTxtGroup: Group = infoPanel.add(`group`);
  altTxtGroup.add(`statictext`, undefined, `Alt Text:`);
  altTxtGroup.alignment = `right`;
  altTxtGroup.spacing = 0;

  const altTxtInput: EditText = altTxtGroup.add(`edittext`);
  altTxtInput.characters = 16;
  altTxtInput.helpTip = `Add the image's alternative text`;

  if (!!sortedSizes.length) {
    const sizePanel: Panel = dialog.add(
      `panel`,
      undefined,
      `Image Breakpoints`
    );
    sizePanel.alignment = `fill`;
    sizePanel.margins = 16;
    sizePanel.spacing = 12;

    for (let i: number = 0; i < sortedSizes.length; i++) {
      const sortedSize: string = sortedSizes[i];

      const sizeGroup: Group = sizePanel.add(`group`);
      sizeGroup.add(`statictext`, undefined, `${sortedSize.toUpperCase()}:`);
      sizeGroup.alignment = `right`;
      sizeGroup.spacing = 0;

      const sizeInput: EditText = sizeGroup.add(`edittext`);
      sizeInput.characters = 16;
      sizeInput.text = `${breakpoints[sortedSize]}px`;
      sizeInput.helpTip = `Add the breakpoint's max-width`;

      let sizeInputRef: EditTextRef = {};
      sizeInputRef[sortedSize] = sizeInput;
      sizeInputRefs.push(sizeInputRef);
    }
  }

  const compressCheckbox: Checkbox = dialog.add(
    'checkbox',
    undefined,
    'Compress asset arguments'
  );
  compressCheckbox.alignment = `fill`;
  compressCheckbox.value = true;

  const btnGroup: Group = dialog.add(`group`);
  btnGroup.alignment = `right`;
  btnGroup.spacing = 8;

  const cancelBtn: Button = btnGroup.add(`button`, undefined, `Cancel`);
  cancelBtn.onClick = handleCancel;

  const saveBtn: Button = btnGroup.add(`button`, undefined, `Save`);
  saveBtn.onClick = handleSave;

  dialog.show();
};

getAssetSizes((sizes) => {
  promptUser(sizes, (img) => {
    generateResponsiveImage(img);
  });
});
