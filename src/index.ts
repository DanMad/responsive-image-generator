// Polyfills
// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

// Extends the Object object's interface to include support for Object.keys().
declare interface Object {
  keys: (obj: any) => string[];
}

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

// Extends the String object's interface to include support for
// String.prototype.trim().
declare interface String {
  trim(): string;
}

if (!String.prototype.trim) {
  String.prototype.trim = function (): string {
    return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, ``);
  };
}

// Configuration
// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

// ...

// Application
// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
type Asset = {
  [key in AssetArg]?: string;
};

// Needs attending to
type AssetArg =
  | `definition`
  | `dimensions`
  | `extension`
  | `name`
  | `quality`
  | `size`;

type AssetArgRegExps = {
  [key in AssetArg]: RegExp;
};

type Assets = {
  [key in AssetSizeArg]?: Asset[];
};

type AssetSizeArg = `xxs` | `xs` | `s` | `m` | `l` | `xl` | `xxl`;

const formatSize = (size: string): string => {
  return size
    .replace(/(e?x(tra)?-*)/gi, `x`)
    .replace(/s(m(al)?l)?/i, `s`)
    .replace(/m(ed(ium)?)?/i, `m`)
    .replace(/l((ar)?ge)?/i, `l`);
};

const getAssets = (cb: (assets: Assets) => void): void => {
  const scanLayers = (layers: Layers, cb: (assets: Assets) => void): void => {
    const getArg = (str: string, arg: AssetArg): string => {
      return str.match(argRegExps[arg])![0];
    };
    const hasArg = (str: string, arg: AssetArg): boolean => {
      return argRegExps[arg].test(str);
    };
    const hasAsset = (str: string): boolean => {
      return argRegExps.extension.test(str);
    };
    const isLayerSet = (layer: Layer): layer is LayerSet => {
      return layer.typename === `LayerSet`;
    };

    // Needs attending to
    const argRegExps: AssetArgRegExps = {
      definition: /@?[1-9]x?$/i,
      dimensions: /^\d{1,5}((\.\d{1,3})?%|([cm]m|in|px)?\s*?x\s*?\d{1,5}([cm]m|in|px)?)(?=\s)/i,
      extension: /\.(gif|jpe?g|png)/i,
      name: /^.+$/i,
      quality: /(([1-9][0-9]?|100)%|10|[1-9])$/,
      size: /(m(ed(ium)?)?|(e?x(tra)?-*){0,2}(s(m(al)?l)?|l((ar)?ge)?))$/i,
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

            if (hasArg(statement, `dimensions`)) {
              asset.dimensions = getArg(statement, `dimensions`);
              statement = statement.replace(argRegExps.dimensions, ``).trim();
            }

            if (hasArg(statement, `quality`)) {
              asset.quality = getArg(statement, `quality`);
              statement = statement.replace(argRegExps.quality, ``).trim();
            }

            asset.extension = getArg(statement, `extension`);
            statement = statement.replace(argRegExps.extension, ``).trim();

            if (hasArg(statement, `definition`)) {
              asset.definition = getArg(statement, `definition`);
              statement = statement
                .replace(argRegExps.definition, ``)
                .replace(/[\s\uFEFF\xA0\-_]+?$/i, ``);
            }

            if (hasArg(statement, `size`)) {
              asset.size = getArg(statement, `size`);
              statement = statement
                .replace(argRegExps.size, ``)
                .replace(/[\s\uFEFF\xA0\-_]+?$/i, ``);
            }

            asset.name = statement;

            // Needs attending to
            if (!!asset.size) {
              let formattedSize: string = asset.size;

              formattedSize = formatSize(formattedSize);

              // @ts-ignore
              if (!assets[formattedSize]) {
                // @ts-ignore
                assets[formattedSize] = [asset];
              } else {
                // @ts-ignore
                assets[formattedSize].push(asset);
              }
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
      cb(assets);
    }
  };

  const assets: Assets = {};
  let scanDepth: number = 0;

  scanLayers(app.activeDocument.layers, cb);
};

getAssets((assets) => {});
