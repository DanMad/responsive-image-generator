// Extends the Object object's interface to include support for Object.keys().
declare interface Object {
  keys: (obj: any) => string[];
}

if (!Object.keys) {
  Object.keys = ((): ((obj: any) => string[]) => {
    const hasOwnProperty = Object.prototype.hasOwnProperty;
    const hasDontEnumBug: boolean = !{ toString: null }.propertyIsEnumerable(
      `toString`
    );
    const dontEnums: string[] = [
      `toString`,
      `toLocaleString`,
      `valueOf`,
      `hasOwnProperty`,
      `isPrototypeOf`,
      `propertyIsEnumerable`,
      `constructor`,
    ];
    const dontEnumsLength: number = dontEnums.length;

    return (obj: any): string[] => {
      if (
        typeof obj !== `function` &&
        (typeof obj !== `object` || obj === null)
      ) {
        alert(`ERROR: Object.keys called on non-object`);
        // throw new TypeError('Object.keys called on non-object');
      }

      const result: string[] = [];
      let prop: number;

      for (let prop in obj) {
        if (hasOwnProperty.call(obj, prop)) {
          result.push(prop);
        }
      }

      if (hasDontEnumBug) {
        for (let i: number = 0; i < dontEnumsLength; i++) {
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

interface Asset {
  definition?: string;
  dimensions?: string;
  extension: string;
  name: string;
  quality?: string;
  size: string;
}

interface Assets {
  xxs?: Asset[];
  xs?: Asset[];
  s?: Asset[];
  m?: Asset[];
  l?: Asset[];
  xl?: Asset[];
  xxl?: Asset[];
}

type AssetArgument =
  | `definition`
  | `dimensions`
  | `extension`
  | `name`
  | `quality`
  | `size`;

const formatSize = (size: string): string => {
  let formattedSize: string = size;

  formattedSize.replace(/(e?x(tra)?)-*/gi, `x`);
  formattedSize.replace(/s(m(al)?l)?/i, `s`);
  formattedSize.replace(/m(ed(ium)?)?/i, `s`);
  formattedSize.replace(/l((ar)?ge)?/i, `s`);

  return formattedSize;
};

const getAssets = (callback: (assets: Assets) => void): void => {
  const checkLayers = (
    layers: Layers,
    callback: (assets: Assets) => void
  ): void => {
    const getArg = (str: string, arg: AssetArgument): string => {
      const regExps = {
        definition: /@?[1-9]x?(?=\.(gif|jpe?g|png))/i,
        dimensions: /^\d{1,5}((\.\d{1,3})?%|([cm]m|in|px)?\s*?x\s*?\d{1,5}([cm]m|in|px)?)(?=\s)/i,
        extension: /\.(gif|jpe?g|png)/i,
        name: /[a-z][\w@-]+(?=\.(gif|jpe?g|png))/i,
        quality: /(([1-9][0-9]?|100)%|10|[1-9])(?=\s*?(,|$))/,
        size: /(s(m(al)?l)?|m(ed(ium)?)?|l((ar)?ge)?)(?=(-+@?[1-9]x?)?\.(gif|jpe?g|png))/i,
      };

      if (regExps[arg].test(str)) {
        return str.match(regExps[arg])![0];
      } else {
        return ``;
      }
    };

    const hasAsset = (str: string): boolean => {
      return /\.(gif|jpe?g|png)/i.test(str);
    };

    const isAssetLayer = (layer: Layer): boolean => {
      return hasAsset(layer.name);
    };

    const isGroup = (layer: Layer): layer is LayerSet => {
      return layer.typename === `LayerSet`;
    };

    layerDepth++;

    for (let i: number = 0; i < layers.length; i++) {
      const layer: Layer = layers[i];

      if (isAssetLayer(layer)) {
        const layerDecs: string[] = layer.name.split(`,`);

        for (let i: number = 0; i < layerDecs.length; i++) {
          const layerDec: string = layerDecs[i].trim();

          if (hasAsset(layerDec)) {
            const definition: string = getArg(layerDec, `definition`);
            const dimensions: string = getArg(layerDec, `dimensions`);
            const extension: string = getArg(layerDec, `extension`);
            const name: string = getArg(layerDec, `name`);
            const quality: string = getArg(layerDec, `quality`);
            let size: string = getArg(layerDec, `size`);

            const asset: Asset = { extension, name, size };

            if (!!definition) {
              asset.definition = definition;
            }

            if (!!dimensions) {
              asset.dimensions = dimensions;
            }

            if (!!quality) {
              asset.quality = quality;
            }

            size = formatSize(size);

            // @ts-ignore
            if (!assets[size]) {
              // @ts-ignore
              assets[size] = [];
            }

            // @ts-ignore
            assets[size].push(asset);
          }
        }
      }

      if (isGroup(layer)) {
        checkLayers(layer.layers, callback);
      }
    }

    layerDepth--;

    if (layerDepth === 0) {
      callback(assets);
    }
  };

  const assets: Assets = {};
  let layerDepth: number = 0;

  checkLayers(app.activeDocument.layers, callback);
};

const promptUser = (assets: Assets, callback: (data: any) => void): void => {};

getAssets((assets) => {
  promptUser(assets, () => {});

  // const assetSizes: string[] = Object.keys(assets);

  // for (let i: number = 0; i < assetSizes.length; i++) {
  //   const assetSize: string = assetSizes[i];

  //   alert(assetSize);
  // }
});
