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

const promptUser = (assets: Assets, cb: (data: any) => void): void => {
  const handleCancel = (): void => {
    dialog.close();
  };
  const handleSave = (): void => {
    dialog.close();
    cb(`foo`);
  };

  const dialog: Window = new Window(`dialog`, `Generate Responsive Image`);
  dialog.margins = 16;

  const infoPanel: Panel = dialog.add(
    `panel`,
    undefined,
    // [0, 0, 304, 128],
    `Image Information`
  );
  infoPanel.alignment = `fill`;
  // infoPanel.margins = `0, 0, 40, 0`;
  infoPanel.orientation = `column`;
  infoPanel.spacing = 24;

  const idGroup: Group = infoPanel.add(`group`);
  idGroup.add(`statictext`, undefined, `Id:`);
  idGroup.alignment = `right`;

  const idInput: EditText = idGroup.add(
    `edittext`,
    undefined,
    app.activeDocument.name.replace(/\.[a-z]{3,4}$/i, ``)
  );
  idInput.active = true;
  idInput.characters = 20;
  idInput.helpTip = `Add the image's unique id`;

  const relDirGroup: Group = infoPanel.add(`group`);
  relDirGroup.add(`statictext`, undefined, `Directory:`);
  relDirGroup.alignment = `right`;

  const relDirInput: EditText = relDirGroup.add(`edittext`, undefined, `img/`);
  relDirInput.characters = 20;
  relDirInput.helpTip = `Add the image's relative directory`;

  const altTxtGroup: Group = infoPanel.add(`group`);
  altTxtGroup.add(`statictext`, undefined, `Alt Text:`);
  altTxtGroup.alignment = `right`;

  const altTxtInput: EditText = altTxtGroup.add(`edittext`);
  altTxtInput.characters = 20;
  altTxtInput.helpTip = `Add the image's alternative text`;

  const breakpointPanel: Panel = dialog.add(
    `panel`,
    undefined,
    // [0, 0, 304, 128],
    `Image Breakpoints`
  );

  breakpointPanel.alignment = `fill`;

  const sizes: string[] = Object.keys(assets);

  for (let i: number = 0; i < sizes.length; i++) {
    const size: string = sizes[i];
    let formattedSize: string = size;

    if (size === `xxs`) formattedSize = `Extra, extra small`;
    if (size === `xs`) formattedSize = `Extra small`;
    if (size === `s`) formattedSize = `Small`;
    if (size === `m`) formattedSize = `Medium`;
    if (size === `l`) formattedSize = `Large`;
    if (size === `xl`) formattedSize = `Extra large`;
    if (size === `xxl`) formattedSize = `Extra, extra large`;

    const sizeGroup: Group = breakpointPanel.add(`group`);
    sizeGroup.add(`statictext`, undefined, `${formattedSize}:`);
    sizeGroup.alignment = `right`;

    const sizeInput: EditText = sizeGroup.add(`edittext`);
    sizeInput.characters = 20;
    sizeInput.helpTip = `Add the ${formattedSize.toLowerCase()} breakpoint's size`;
  }

  const renameCheckbox: Checkbox = dialog.add(
    'checkbox',
    undefined,
    'Compress asset arguments'
  );
  renameCheckbox.alignment = `fill`;
  renameCheckbox.value = true;

  const btnGroup: Group = dialog.add(`group`);
  btnGroup.alignment = `right`;

  const cancelBtn: Button = btnGroup.add(`button`, undefined, `Cancel`);
  cancelBtn.onClick = handleCancel;

  const saveBtn: Button = btnGroup.add(`button`, undefined, `Save`);
  saveBtn.onClick = handleSave;

  // // The following statement resolves a presentational issue in PhotoShop where
  // // buttons are rendered inconsistently.
  // // Source: https://community.adobe.com/t5/photoshop/why-do-buttons-in-two-panels-have-different-corners/td-p/9544453?page=1

  // @ts-ignore
  dialog.cancelElement = null;

  dialog.show();
};

getAssets((assets) => {
  promptUser(assets, (data) => {
    alert(data);
  });
});
