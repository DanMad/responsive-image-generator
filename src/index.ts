// Polyfills
// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
declare interface Array<T> {
  indexOf: (searchElement: any, fromIndex?: any) => number;
}

// Extends the Array object's interface to include support for
// Array.prototype.indexOf().
if (!Array.prototype.indexOf) {
  Array.prototype.indexOf = function (searchElement: any, fromIndex?: any): number {
    let k: any;

    if (this == null) {
      alert(`Error: Array.prototype.indexOf()\n"this" is null or undefined.`);
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
    const hasDontEnumBug: boolean = !{ toString: null }.propertyIsEnumerable(`toString`);
    const hasOwnProperty: (name: string) => boolean = Object.prototype.hasOwnProperty;

    return function (obj: any): string[] {
      if (typeof obj !== `function` && (typeof obj !== `object` || obj === null)) {
        alert(`Error: Object.keys()\nCalled on a non-object.`);
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
  l: string;
  m: string;
  s: string;
  xl: string;
  xs: string;
}

const breakpoints: Breakpoints = {
  l: `1280px`,
  m: `768px`,
  s: `480px`,
  xl: `1920px`,
  xs: `320`,
};

const srcDir: string = `images/`;

// Application
// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
const generateImg = (img: Image): void => {
  const compressArg = (prop: AssetParam, obj: AssetArgs): void => {
    if (!!obj[prop]) {
      let compressedArg: string = obj[prop]!.toLowerCase();

      if (prop === `context`) {
        compressedArg = compressedArg
          .replace(/^e?x(tra)?-*/i, `x`)
          .replace(/l((ar)?ge)?$/i, `l`)
          .replace(/^m(ed(ium)?)?$/i, `m`)
          .replace(/s(m(al)?l)?$/i, `s`);
      } else if (prop === `def`) {
        compressedArg = `${compressedArg.match(/[1-9]/)![0]}x`;
      } else if (prop === `ext`) {
        compressedArg = compressedArg.replace(`jpeg`, `jpg`);
      } else if (prop === `qual`) {
        compressedArg = compressedArg.replace(/0{1,2}%$/, ``);
      } else if (prop === `size`) {
        compressedArg = compressedArg.replace(`px`, ``).replace(/\s*?x\s*/i, `x`);
      }

      obj[prop] = compressedArg;
    }
  };
  const getAssetSrc = (asset: Asset): string => {
    let src: string = `/${trimDir(img.srcDir)}/`;

    if (!!img.name) {
      src += toKebabCase(img.name);
    } else {
      src += asset.args.name;
    }

    if (!!asset.args.context) {
      src += `-${asset.args.context}`;
    }

    if (!!asset.args.def) {
      src += `-${asset.args.def}`;
    }

    src += asset.args.ext;

    if (!!asset.args.context && asset.index > 1) {
      src += ` ${asset.index}x`;
    }

    return src;
  };
  const getAssetStatement = (asset: Asset): string => {
    let statement: string = ``;

    if (asset.args.size) {
      statement += `${asset.args.size} `;
    }

    if (!!img.name) {
      statement += toKebabCase(img.name);
    } else {
      statement += asset.args.name;
    }

    if (!!asset.args.context) {
      statement += `-${asset.args.context}`;
    }

    if (!!asset.args.def) {
      statement += `-${asset.args.def}`;
    }

    statement += asset.args.ext;

    if (!!asset.args.qual) {
      statement += `${asset.args.qual}`;
    }

    return statement;
  };
  const getLayerStatements = (layerId: number): string[] => {
    const layerStatements: string[] = [];

    for (let i: number = 0, len: number = sortedContexts.length; i < len; i++) {
      const sortedContext: TShirtSize = sortedContexts[i];
      const contextAssets: Assets = img.contexts[sortedContext]!.assets;
      for (let i: number = 0, len: number = contextAssets.length; i < len; i++) {
        const contextAsset: Asset = contextAssets[i];

        if (contextAsset.layerId === layerId) {
          const statement: string = getAssetStatement(contextAsset);

          layerStatements.push(statement);
        }
      }
    }

    return layerStatements;
  };
  const hasAlt = (alt: string): boolean => {
    return !!alt;
  };
  const sortAssets = (assets: Assets): void => {
    const defAscend = (a: Asset, b: Asset): number => {
      return a.index - b.index;
    };

    assets.sort(defAscend);
  };
  const toKebabCase = (str: string): string => {
    return str
      .replace(/([A-Z])([A-Z])/g, `$1-$2`)
      .replace(/([a-z])([A-Z])/g, `$1-$2`)
      .replace(/[\s_]+/g, `-`)
      .toLowerCase();
  };
  const trimDir = (dir: string): string => {
    let trimmedDir: string = dir;

    trimmedDir = trimmedDir.replace(/\/{2,}/g, `/`);
    trimmedDir = trimmedDir.replace(/(^\/*|\/*$)/g, ``);

    return trimmedDir;
  };

  const sortedContexts: TShirtSizes = sortContexts(Object.keys(img.contexts));

  for (let i: number = 0, len: number = sortedContexts.length; i < len; i++) {
    const assets: Assets = img.contexts[sortedContexts[i]]!.assets;

    sortAssets(assets);

    if (img.compress) {
      for (let i: number = 0, len: number = assets.length; i < len; i++) {
        const args: AssetArgs = assets[i].args;

        compressArg(`context`, args);
        compressArg(`def`, args);
        compressArg(`ext`, args);
        compressArg(`qual`, args);
        compressArg(`size`, args);
      }
    }
  }

  const docName: string = app.activeDocument.name.replace(/\.[a-z]{3,4}$/i, ``);
  const docPath: Folder = app.activeDocument.path;
  const file: File = File(`${docPath}/${docName}-assets/responsive-image.html`);

  if (file.exists) {
    file.remove();
  }

  file.encoding = 'utf-8';
  file.open('w');

  const tab: string = `  `;

  if (hasMultipleContexts(sortedContexts)) {
    file.writeln(`<picture>`);

    for (let i: number = sortedContexts.length; i > 0; i--) {
      const sortedContext: TShirtSize = sortedContexts[i - 1];
      const assets: Assets = img.contexts[sortedContext]!.assets;

      if (i === 1) {
        file.writeln(`${tab}<img`);

        if (hasAlt(img.alt)) {
          file.writeln(`${tab}${tab}alt="${img.alt}"`);
        }

        for (let i: number = 0, len: number = assets.length; i < len; i++) {
          const asset: Asset = assets[i];

          if (i === 0) {
            file.writeln(`${tab}${tab}src="${getAssetSrc(asset)}"`);

            if (len > 1) {
              file.writeln(`${tab}${tab}srcset="`);
            }
          } else {
            if (i === len - 1) {
              file.writeln(`${tab}${tab}${tab}${getAssetSrc(asset)}`);
              file.writeln(`${tab}${tab}"`);
            } else {
              file.writeln(`${tab}${tab}${tab}${getAssetSrc(asset)},`);
            }
          }
        }

        file.writeln(`${tab}/>`);
      } else {
        file.writeln(`${tab}<source`);
        file.writeln(
          `${tab}${tab}media="${(Number(img.contexts[sortedContexts[i - 2]]!.maxWidth!.match(/\d+/)![0]) + 1) / 16}em"`
        );
        file.writeln(`${tab}${tab}srcset="`);

        for (let i: number = 0, len: number = assets.length; i < len; i++) {
          const asset: Asset = assets[i];

          if (i === len - 1) {
            file.writeln(`${tab}${tab}${tab}${getAssetSrc(asset)}`);
            file.writeln(`${tab}${tab}"`);
          } else {
            file.writeln(`${tab}${tab}${tab}${getAssetSrc(asset)},`);
          }
        }

        file.writeln(`${tab}/>`);
      }
    }

    file.writeln(`</picture>`);
  } else {
    file.writeln(`<img`);

    if (hasAlt(img.alt)) {
      file.writeln(`${tab}alt="${img.alt}"`);
    }

    const assets: Assets = [];

    for (let i: number = 0, len: number = sortedContexts.length; i < len; i++) {
      const sortedContext: TShirtSize = sortedContexts[i];
      const contextAssets: Assets = img.contexts[sortedContext]!.assets;

      for (let i: number = 0, len: number = contextAssets.length; i < len; i++) {
        const contextAsset: Asset = contextAssets[i];

        if (!hasIndex(contextAsset.index, assets)) {
          assets.push(contextAsset);
        }
      }
    }

    sortAssets(assets);

    for (let i: number = 0, len: number = assets.length; i < len; i++) {
      const asset: Asset = assets[i];

      if (i === 0) {
        file.writeln(`${tab}src="${getAssetSrc(asset)}"`);

        if (len > 1) {
          file.writeln(`${tab}srcset="`);
        }
      } else {
        if (i === len - 1) {
          file.writeln(`${tab}${tab}${getAssetSrc(asset)}`);
          file.writeln(`${tab}"`);
        } else {
          file.writeln(`${tab}${tab}${getAssetSrc(asset)},`);
        }
      }
    }

    file.writeln(`/>`);
  }

  file.close();

  const layerStatements: any = {};
  const layersToUpdate: number[] = [];

  for (let i: number = 0, len: number = sortedContexts.length; i < len; i++) {
    const sortedContext: TShirtSize = sortedContexts[i];
    const contextAssets: Assets = img.contexts[sortedContext]!.assets;

    for (let i: number = 0, len: number = contextAssets.length; i < len; i++) {
      const contextAsset: Asset = contextAssets[i];

      if (layersToUpdate.indexOf(contextAsset.layerId) === -1) {
        const statements = getLayerStatements(contextAsset.layerId);

        layerStatements[contextAsset.layerId] = statements;
        layersToUpdate.push(contextAsset.layerId);
      }
    }
  }

  const scanLayers = (layers: Layers): void => {
    const isGroupLayer = (layer: Layer): layer is LayerSet => {
      return layer.typename === `LayerSet`;
    };

    for (let i: number = 0, len: number = layers.length; i < len; i++) {
      const layer: Layer = layers[i];

      if (layersToUpdate.indexOf(layer.id) !== -1) {
        layer.name = layerStatements[layer.id].reverse().join(`, `);
      }

      if (isGroupLayer(layer)) {
        scanLayers(layer.layers);
      }
    }
  };

  scanLayers(app.activeDocument.layers);
};

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

const getAssetData = (cb: (assetData: Contexts) => void): void => {
  const scanLayers = (layers: Layers, cb: (assetData: Contexts) => void): void => {
    const addAssetArgProp = (prop: AssetParam, arg: string, obj: AssetArgs): void => {
      if (!!arg) {
        obj[prop] = arg;
      } else {
        return;
      }
    };
    const addAsset = (prop: TShirtSize, asset: Asset, obj: Contexts): void => {
      if (!!obj[prop]) {
        if (!hasIndex(asset.index, obj[prop]!.assets)) {
          obj[prop]!.assets.push(asset);
        }
      } else {
        obj[prop] = {
          assets: [asset],
        };

        if (prop !== `unset`) {
          obj[prop]!.maxWidth = breakpoints[prop];
        }
      }
    };
    const getAssetArg = (param: AssetParam, statement: string): string => {
      if (assetArgPatterns[param].test(statement)) {
        return statement.match(assetArgPatterns[param])![0];
      } else {
        return ``;
      }
    };
    const getAssetIndex = (def: string): number => {
      if (!!def) {
        return Number(def.match(/\d+/));
      } else {
        return 1;
      }
    };
    const getTShirtSize = (context: string): TShirtSize => {
      let tShirtSize: TShirtSize = `unset`;

      if (/^e?x(tra)?-*?l((ar)?ge)?$/i.test(context)) {
        tShirtSize = `xl`;
      } else if (/^e?x(tra)?-*?s(m(al)?l)?$/i.test(context)) {
        tShirtSize = `xs`;
      } else if (/^l((ar)?ge)?$/i.test(context)) {
        tShirtSize = `l`;
      } else if (/^m(ed(ium)?)?$/i.test(context)) {
        tShirtSize = `m`;
      } else if (/^s(m(al)?l)?$/i.test(context)) {
        tShirtSize = `s`;
      }

      return tShirtSize;
    };
    const hasAssetDeclaration = (statement: string): boolean => {
      return assetArgPatterns.ext.test(statement);
    };
    const isAssetLayer = (layer: Layer): boolean => {
      return hasAssetDeclaration(layer.name);
    };
    const isGroupLayer = (layer: Layer): layer is LayerSet => {
      return layer.typename === `LayerSet`;
    };
    const removeAssetArg = (param: AssetParam, statement: string): string => {
      return statement.replace(assetArgPatterns[param], ``).replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0\-_]+$/g, ``);
    };

    const assetArgPatterns: AssetArgPatterns = {
      context: /(m(ed(ium)?)?|(e?x(tra)?-*)?(s(m(al)?l)?|l((ar)?ge)?))$/i,
      def: /@?[1-9]x?$/i,
      ext: /\.(gif|jpe?g|png)/i,
      qual: /(([1-9][0-9]?|100)%|10|[1-9])$/,
      size: /^\d{1,5}((\.\d{1,3})?%|([cm]m|in|px)?\s*?x\s*?\d{1,5}([cm]m|in|px)?)(?=\s)/i,
    };

    scanDepth++;

    for (let i: number = 0, len: number = layers.length; i < len; i++) {
      const layer: Layer = layers[i];

      if (isAssetLayer(layer)) {
        const statements: string[] = layer.name.split(`,`);

        for (let i: number = 0, len: number = statements.length; i < len; i++) {
          let statement: string = statements[i].trim();

          if (hasAssetDeclaration(statement)) {
            let size: string = getAssetArg(`size`, statement);
            statement = removeAssetArg(`size`, statement);

            let qual: string = getAssetArg(`qual`, statement);
            statement = removeAssetArg(`qual`, statement);

            let ext: string = getAssetArg(`ext`, statement);
            statement = removeAssetArg(`ext`, statement);

            let def: string = getAssetArg(`def`, statement);
            statement = removeAssetArg(`def`, statement);

            let context: string = getAssetArg(`context`, statement);
            statement = removeAssetArg(`context`, statement);

            const assetArgs: AssetArgs = {
              ext,
              name: statement,
            };

            addAssetArgProp(`def`, def, assetArgs);
            addAssetArgProp(`context`, context, assetArgs);
            addAssetArgProp(`qual`, qual, assetArgs);
            addAssetArgProp(`size`, size, assetArgs);

            const asset: Asset = {
              args: assetArgs,
              index: getAssetIndex(def),
              layerId: layer.id,
            };
            const tShirtSize: TShirtSize = getTShirtSize(context);

            addAsset(tShirtSize, asset, assetData);
          }
        }
      }

      if (isGroupLayer(layer)) {
        scanLayers(layer.layers, cb);
      }
    }

    scanDepth--;

    if (!scanDepth) {
      cb(assetData);
    }
  };

  const assetData: Contexts = {};
  let scanDepth: number = 0;

  scanLayers(app.activeDocument.layers, cb);
};
const hasIndex = (index: number, assets: Assets): boolean => {
  let res: boolean = false;

  for (let i: number = 0, len: number = assets.length; i < len; i++) {
    const asset: Asset = assets[i];

    if (asset.index === index) {
      res = true;

      break;
    }
  }

  return res;
};
const hasMultipleContexts = (sizes: TShirtSizes): boolean => {
  return sizes.length > 1 && sizes.indexOf(`unset`) === -1;
};

interface EditTexts {
  l?: EditText;
  m?: EditText;
  s?: EditText;
  unset?: EditText;
  xl?: EditText;
  xs?: EditText;
}

interface Image {
  alt: string;
  compress: boolean;
  contexts: Contexts;
  name: string;
  srcDir: string;
}

const promptUser = (assetData: Contexts, cb: (img: Image) => void): void => {
  const handleCancel = (): void => {
    dialog.close();
  };
  const handleSave = (): void => {
    dialog.close();

    const img: Image = {
      alt: altInput.text,
      compress: compressCheckbox.value,
      contexts: assetData,
      name: nameInput.text,
      srcDir: srcDirInput.text,
    };

    for (let tShirtSize in contextInputs) {
      if (isTShirtSize(tShirtSize)) {
        img.contexts[tShirtSize]!.maxWidth = contextInputs[tShirtSize]!.text;
      }
    }

    cb(img);
  };
  const hasAsset = (assetData: Contexts): boolean => {
    return !!Object.keys(assetData).length;
  };
  const isTShirtSize = (str: string): str is TShirtSize => {
    const tShirtSizes: TShirtSizes = [`xs`, `s`, `m`, `l`, `xl`, `unset`];
    return !!tShirtSizes.indexOf(str);
  };

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

  const nameGroup: Group = infoPanel.add(`group`);
  nameGroup.add(`statictext`, undefined, `Name:`);
  nameGroup.alignment = `right`;
  nameGroup.spacing = 0;

  const docName: string = app.activeDocument.name.replace(/\.[a-z]{3,4}$/i, ``);

  const nameInput: EditText = nameGroup.add(`edittext`, undefined, docName);
  nameInput.active = true;
  nameInput.characters = 16;
  nameInput.helpTip = `Add the image's name`;

  const srcDirGroup: Group = infoPanel.add(`group`);
  srcDirGroup.add(`statictext`, undefined, `Src Directory:`);
  srcDirGroup.alignment = `right`;
  srcDirGroup.spacing = 0;

  const srcDirInput: EditText = srcDirGroup.add(`edittext`, undefined, srcDir);
  srcDirInput.characters = 16;
  srcDirInput.helpTip = `Add the image's source directory`;

  const altGroup: Group = infoPanel.add(`group`);
  altGroup.add(`statictext`, undefined, `Alt Text:`);
  altGroup.alignment = `right`;
  altGroup.spacing = 0;

  const altInput: EditText = altGroup.add(`edittext`);
  altInput.characters = 16;
  altInput.helpTip = `Add the image's alternative text`;

  const contextInputs: EditTexts = {};
  const sortedContexts: TShirtSizes = sortContexts(Object.keys(assetData));

  if (hasMultipleContexts(sortedContexts)) {
    const contextPanel: Panel = dialog.add(`panel`, undefined, `Image Breakpoints`);
    contextPanel.alignment = `fill`;
    contextPanel.margins = 16;
    contextPanel.spacing = 12;

    for (let i: number = 0, len: number = sortedContexts.length; i < len; i++) {
      const sortedContext: TShirtSize = sortedContexts[i];

      const contextGroup: Group = contextPanel.add(`group`);
      contextGroup.add(`statictext`, undefined, `${sortedContext.toUpperCase()}:`);
      contextGroup.alignment = `right`;
      contextGroup.spacing = 0;

      const contextInput: EditText = contextGroup.add(`edittext`, undefined, assetData[sortedContext]!.maxWidth);
      contextInput.characters = 16;
      contextInput.helpTip = `Add the breakpoint's max-width`;

      contextInputs[sortedContext] = contextInput;
    }
  }

  const compressCheckbox: Checkbox = dialog.add('checkbox', undefined, 'Compress asset arguments');
  compressCheckbox.alignment = `fill`;
  compressCheckbox.value = true;

  const btnGroup: Group = dialog.add(`group`);
  btnGroup.alignment = `right`;
  btnGroup.spacing = 8;

  const cancelBtn: Button = btnGroup.add(`button`, undefined, `Cancel`);
  cancelBtn.onClick = handleCancel;

  const saveBtn: Button = btnGroup.add(`button`, undefined, `Save`);
  saveBtn.onClick = handleSave;

  if (hasAsset(assetData)) {
    dialog.show();
  }
};
const sortContexts = (sizes: string[]): TShirtSizes => {
  const orderedContexts: TShirtSizes = [`xs`, `s`, `m`, `l`, `xl`, `unset`];
  const sortedContexts: TShirtSizes = [];

  for (let i: number = 0, len: number = orderedContexts.length; i < len; i++) {
    const orderedContext: TShirtSize = orderedContexts[i];

    if (sizes.indexOf(orderedContext) !== -1) {
      sortedContexts.push(orderedContext);
    }
  }

  return sortedContexts;
};

getAssetData((assetData): void => {
  promptUser(assetData, (img): void => {
    generateImg(img);
  });
});
