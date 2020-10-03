// Config

/**
 * The default max-width values for each asset context's breakpoint.
 */
const CONTEXT_MAX_WIDTHS: Record<AssetContext, number> = {
  l: 1280,
  m: 768,
  s: 480,
  xl: 1920,
  xs: 320,
};

/**
 * The default file name that is suggested when generating a responsive image
 * snippet.
 */
const FILE_NAME: string = `responsive-image`;

/**
 * The default src directory that assets will be referenced from in the
 * responsive image snippet.
 */
const SRC_DIR: string = `/images`;

// ES3 Polyfills

/**
 * Extends the Array object's interface to include support for
 * Array.prototype.indexOf().
 */
if (!Array.prototype.indexOf) {
  Array.prototype.indexOf = function (
    searchElement: any,
    fromIndex?: any
  ): number {
    let k: number;

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

/**
 * Extends the Object object's interface to include support for Object.keys().
 */
if (!Object.keys) {
  Object.keys = (function (): (obj: any) => string[] {
    const hasOwnProperty: (name: string) => boolean =
      Object.prototype.hasOwnProperty;
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

    return function (obj: any): string[] {
      if (
        typeof obj !== `function` &&
        (typeof obj !== `object` || obj === null)
      ) {
        alert(`Error: Object.keys()\nCalled on a non-object.`);
      }

      const result: string[] = [];

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

/**
 * Extends the String object's interface to include support for
 * String.prototype.trim().
 */
if (!String.prototype.trim) {
  String.prototype.trim = function (): string {
    return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, ``);
  };
}

// Application

/**
 * Generates an img tag from `assets` and `resImg`, then writes it to `file`.
 *
 * @since 1.0.0
 *
 * @param {Object} file The file to write the img tag to.
 * @param {Array} assets The object containing assets to include.
 * @param {Object} resImg The object containing alt text and src directory path.
 * @param {number} tabCount The number of tabs the image tag should be nested.
 * @returns {void} This function doesn't have a return statement.
 */
const generateImgTag = (
  file: any,
  assets: Asset[],
  resImg: ResponsiveImage,
  tabCount: number = 0
): void => {
  let tabs: string = ``;

  for (let i: number = 0; i < tabCount; i++) {
    tabs += `  `;
  }

  file.writeln(`${tabs}<img`);

  if (!!resImg.altText) {
    file.writeln(`${tabs}  alt="${resImg.altText}"`);
  }

  file.writeln(`${tabs}  src="${resImg.srcDir}/${assets[0].fileName}"`);

  if (assets.length > 1) {
    file.writeln(`${tabs}  srcset="`);

    for (let i: number = 1, len: number = assets.length; i < len; i++) {
      file.write(
        `${tabs}    ${resImg.srcDir}/${assets[i].fileName} ${assets[i].def}x`
      );

      if (i < len - 1) {
        file.write(`,`);
      }

      file.write(`\n`);
    }

    file.writeln(`${tabs}  "`);
  }

  file.writeln(`${tabs}/>`);
};

/**
 * Generates a picture tag from `resImg`, then writes it to `file`.
 *
 * @since 1.0.0
 *
 * @param {Object} file The file to write the img tag to.
 * @param {Object} resImg The object containing alt text, src directory path and
 * context max-widths.
 * @returns {void} This function doesn't have a return statement.
 */
const generatePictureTag = (file: any, resImg: ResponsiveImage) => {
  file.writeln(`<picture>`);

  const contexts: AssetContext[] = sortContexts(Object.keys(assets));
  const maxWidths: AssetContext[] = sortContexts(Object.keys(resImg.maxWidths));

  for (let i: number = contexts.length; i > 0; i--) {
    const contextualAssets: Asset[] = sortAssets(assets[contexts[i - 1]]!);
    const minWidth: number = resImg.maxWidths[maxWidths[i - 2]]! + 1;

    if (i > 1) {
      file.writeln(`  <source`);
      file.writeln(`    media="(min-width: ${minWidth / 16}em)"`);
      file.writeln(`    srcset="`);

      for (
        let i: number = 0, len: number = contextualAssets.length;
        i < len;
        i++
      ) {
        file.write(`      ${resImg.srcDir}/${contextualAssets[i].fileName}`);

        if (contextualAssets[i].def > 1) {
          file.write(` ${contextualAssets[i].def}x`);
        }

        if (i < len - 1) {
          file.write(`,`);
        }

        file.write(`\n`);
      }

      file.writeln(`    "`);
      file.writeln(`  />`);
    } else {
      generateImgTag(file, contextualAssets, resImg, 1);
    }
  }

  file.writeln(`</picture>`);
};

/**
 * Generates a responsive image snippet from `resImg` and  writes the html file
 * to the relevant directory.
 *
 * @since 1.0.0
 *
 * @param {Object} resImg The object to process.
 * @returns {void} This function doesn't have a return statement.
 */
const generateResponsiveImg = (resImg: ResponsiveImage): void => {
  const docName: string = app.activeDocument.name.replace(/\.[a-z]{3,4}$/i, ``);
  const docPath: string = app.activeDocument.path;

  // The following statement is ignored as the default File class expects two
  // arguments, whereas Adobe® Photoshop's File class expects one argument:
  // @ts-ignore
  const file: any = File(
    `${docPath}/${docName}-assets/${resImg.fileName}.html`
  );

  if (file.exists) {
    file.remove();
  }

  file.encoding = "utf-8";
  file.open("w");

  if (hasContexts) {
    generatePictureTag(file, resImg);
  } else {
    const context: AssetContext = Object.keys(assets)![0] as AssetContext;
    const contextualAssets: Asset[] = sortAssets(assets[context]!);

    generateImgTag(file, contextualAssets, resImg);
  }

  file.close();
};

/**
 * Creates an `asset` object from the `str` argument passed and adds it to the
 * relevant context key of the global `assets` object.
 *
 * @since 1.0.0
 *
 * @param {string} str The string to process.
 * @returns {void} This function doesn't have a return statement.
 */
const getAsset = (str: string): void => {
  const regExps: Record<Exclude<AssetParam, "name">, RegExp> = {
    context: /(m(ed(ium)?)?|(e?x(tra)?-*)?(s(m(al)?l)?|l((ar)?ge)?))$/i,
    def: /\-@?[1-9](\.\d+)?x?$/i,
    ext: /\.(gif|jpe?g|png)$/i,
    qual: /(([1-9]\d?|100)%|10|[1-9])$/,
    size: /^\d{1,5}((\.\d{1,3})?%|([cm]m|in|px)?\s*?x\s*?\d{1,5}([cm]m|in|px)?)\s*/i,
  };

  let fileName: string = str.trim();

  if (regExps.size.test(fileName)) {
    fileName = fileName.replace(regExps.size, ``);
  }

  if (regExps.qual.test(fileName)) {
    fileName = fileName.replace(regExps.qual, ``);
  }

  const asset: any = {
    fileName: fileName.replace(/\s+/g, `%20`),
  };

  if (regExps.ext.test(fileName)) {
    fileName = fileName.replace(regExps.ext, ``);
  }

  if (regExps.def.test(fileName)) {
    asset.def = toNumber(fileName.match(regExps.def)![0]);
    fileName = fileName.replace(regExps.def, ``);
  } else {
    asset.def = 1;
  }

  let context: AssetContext = `xs`;

  if (regExps.context.test(fileName)) {
    context = toContext(fileName.match(regExps.context)![0]);
  }

  if (!!assets[context]) {
    assets[context]?.push(asset);
  } else {
    assets[context] = [asset];
  }
};

/**
 * Recursively searches the active document's layer tree for valid asset
 * arguments, calls `getAsset()` on each argument, and invokes the callback
 * function passed when complete.
 *
 * @since 1.0.0
 *
 * @param {Function} fn The callback function to invoke.
 * @param {Array} layers The layer tree to search.
 * @param {number} depth The depth of recursion.
 * @returns {void} This function doesn't have a return statement.
 */
const getAssets = (
  fn: () => void,
  layers: any = app.activeDocument.layers,
  depth: number = 0
): void => {
  depth++;

  for (let i: number = 0, len: number = layers.length; i < len; i++) {
    if (hasExtension(layers[i].name)) {
      const args: string[] = layers[i].name.split(`,`);

      for (let i: number = 0, len: number = args.length; i < len; i++) {
        if (hasExtension(args[i])) {
          getAsset(args[i]);

          if (!hasAssets) {
            hasAssets = true;
          }
        }
      }
    }

    if (isGroup(layers[i])) {
      getAssets(fn, layers[i].layers, depth);
    }
  }

  depth--;

  if (!depth) {
    fn();
  }
};

/**
 * Checks if `str` contains a valid file extension.
 *
 * @since 1.0.0
 *
 * @param {string} str The string to check.
 * @param {Array} types The file types to check for.
 * @returns {boolean} Returns `true` if `str` contains a valid file extension
 * from the `types` array, else `false`.
 *
 * @example
 * hasExtension(`fileName.jpg`);
 * // => true
 *
 * hasExtension(`fileName.jpeg`, [`psd`]);
 * // => false
 */
const hasExtension = (
  str: string,
  types: string[] = [`gif`, `jpe?g`, `png`]
): boolean => {
  if (types.length === 0) {
    return false;
  }

  let regExp: string = `\\.(`;

  for (let i: number = 0, len: number = types.length; i < len; i++) {
    if (i !== types.length - 1) {
      regExp += `${types[i]}|`;
    } else {
      regExp += `${types[i]})`;
    }
  }

  return new RegExp(regExp, `i`).test(str);
};

/**
 * Checks if `layer` is a group (LayerSet).
 *
 * @since 1.0.0
 *
 * @param {Object} layer The layer to check.
 * @returns {boolean} Returns `true` if `layer` has a typename of `'LayerSet'`,
 * else `false`.
 *
 * @example
 * const layer = { typename: `ArtLayer` };
 * const group = { typename: `LayerSet` };
 *
 * isGroup(layer);
 * // => false
 *
 * isGroup(group);
 * // => true
 */
const isGroup = (layer: any): boolean => {
  return layer.typename === `LayerSet`;
};

/**
 * Presents a dialog with configurable options to the user and invokes the
 * callback function passed when the 'Save' button is pressed.
 *
 * @since 1.0.0
 *
 * @param {Function} fn The callback function to invoke.
 * @returns {void} This function doesn't have a return statement.
 */
const showDialog = (fn: (data: any) => void): void => {
  const handleCancel = (): void => {
    dialog.close();
  };

  const handleSave = (): void => {
    dialog.close();

    const resImg: ResponsiveImage = {
      altText: ``,
      fileName: FILE_NAME,
      maxWidths: {},
      srcDir: SRC_DIR,
    };

    if (!!altTextInput.text) {
      resImg.altText = altTextInput.text;
    }

    if (!!fileNameInput.text) {
      resImg.fileName = fileNameInput.text.trim();
    }

    if (hasContexts) {
      // This loop intentionally omits the last index of the `contexts` array
      // because a user shouldn't set a max-width for the image's largest context.
      // The max-width for a context (or breakpoint) only needs to be set when a
      // larger context supersedes it.
      for (let i: number = 0, len: number = contexts.length - 1; i < len; i++) {
        if (!!contextInputs[contexts[i]].text) {
          resImg.maxWidths[contexts[i]] = toNumber(
            contextInputs[contexts[i]].text
          );
        } else {
          resImg.maxWidths[contexts[i]] = CONTEXT_MAX_WIDTHS[contexts[i]];
        }
      }
    }

    if (!!srcDirInput.text) {
      resImg.srcDir = srcDirInput.text
        .trim()
        .replace(/\s+/g, `%20`)
        .replace(/\/+$/, ``);
    }

    fn(resImg);
  };

  // The following statement is ignored as the default Window class doesn't take
  // any arguments, whereas Adobe® Photoshop's Window class constructor expects
  // two arguments:
  // @ts-ignore
  const dialog: any = new Window(`dialog`, `Generate Responsive Image`);

  dialog.margins = 16;

  const infoPanel: any = dialog.add(`panel`, undefined, `Image Information`);

  infoPanel.alignment = `fill`;
  infoPanel.margins = 16;
  infoPanel.spacing = 12;

  const fileNameGroup: any = infoPanel.add(`group`);

  fileNameGroup.add(`statictext`, undefined, `File Name`);
  fileNameGroup.alignment = `right`;
  fileNameGroup.spacing = 0;

  const fileNameInput: any = fileNameGroup.add(
    `edittext`,
    undefined,
    FILE_NAME
  );

  fileNameInput.characters = 16;
  fileNameInput.helpTip = `Add the image's file name`;

  const srcDirGroup: any = infoPanel.add(`group`);

  srcDirGroup.add(`statictext`, undefined, `Src Directory`);
  srcDirGroup.alignment = `right`;
  srcDirGroup.spacing = 0;

  const srcDirInput: any = srcDirGroup.add(`edittext`, undefined, SRC_DIR);

  srcDirInput.characters = 16;
  srcDirInput.helpTip = `Add the image's src directory path`;

  const altTextGroup: any = infoPanel.add(`group`);

  altTextGroup.add(`statictext`, undefined, `Alt Text`);
  altTextGroup.alignment = `right`;
  altTextGroup.spacing = 0;

  const altTextInput: any = altTextGroup.add(`edittext`);

  altTextInput.active = true;
  altTextInput.characters = 16;
  altTextInput.helpTip = `Add the image's alt text`;

  const contextInputs: Partial<Record<AssetContext, any>> = {};
  const contexts: AssetContext[] = sortContexts(Object.keys(assets));

  if (contexts.length > 1) {
    const contextPanel: any = dialog.add(
      `panel`,
      undefined,
      `Image Breakpoints`
    );

    contextPanel.alignment = `fill`;
    contextPanel.margins = 16;
    contextPanel.spacing = 12;

    // This loop intentionally omits the last index of the `contexts` array
    // because a user shouldn't set a max-width for the image's largest context.
    // The max-width for a context (or breakpoint) only needs to be set when a
    // larger context supersedes it.
    for (let i: number = 0, len: number = contexts.length - 1; i < len; i++) {
      const contextGroup: any = contextPanel.add(`group`);

      contextGroup.add(
        `statictext`,
        undefined,
        `${contexts[i].toUpperCase()}:`
      );
      contextGroup.alignment = `right`;
      contextGroup.spacing = 0;

      const contextInput: any = contextGroup.add(
        `edittext`,
        undefined,
        `${CONTEXT_MAX_WIDTHS[contexts[i]]}px`
      );

      contextInput.characters = 16;
      contextInput.helpTip = `Add the context's max-width`;

      contextInputs[contexts[i]] = contextInput;
    }

    hasContexts = true;
  }

  const btnGroup: any = dialog.add(`group`);

  btnGroup.alignment = `right`;
  btnGroup.spacing = 0;

  const cancelBtn: any = btnGroup.add(`button`, undefined, `Cancel`);

  cancelBtn.onClick = handleCancel;

  const saveBtn: any = btnGroup.add(`button`, undefined, `Save`);

  saveBtn.onClick = handleSave;

  dialog.show();
};

/**
 * Creates a new, sorted array of assets. Assets are sorted by their `def` key
 * from lowest to highest number, and only included in the new, sorted array if
 * the `def` key is a unique number. If two assets's `def` keys are the same
 * number, the asset declared later in the active document will take precedence.
 *
 * @since 1.0.0
 *
 * @param {Array} arr The array to sort.
 * @returns {Array} Returns a new, sorted array of assets with unique `def` keys.
 *
 * @example
 * const xs = [
 *   {def: 1, fileName: `foo.jpg`},
 *   {def: 1.5, fileName: `bar.jpg`},
 *   {def: 1, fileName: `baz.jpg`},
 * ]
 *
 * const s = [
 *   {def: 1, fileName: `foo.png`},
 *   {def: 1, fileName: `bar.png`},
 *   {def: 2, fileName: `baz.png`}
 * ];
 *
 * sortAssets(xs);
 * // => `[{def: 1, fileName: `baz.jpg`}, {def: 1.5, fileName: `bar.jpg`}]`
 *
 * sortAssets(s);
 * // => `[{def: 1, fileName: `bar.png`}, {def: 2, fileName: `baz.png`}]`
 */
const sortAssets = (arr: Asset[]): Asset[] => {
  const sortedArr: Asset[] = arr.sort((a: Asset, b: Asset): number => {
    if (a.def < b.def) {
      return -1;
    }

    return 1;
  });
  const uniqueDefs: number[] = [];
  const uniqueSortedArr: Asset[] = [];

  for (let i: number = 0, len: number = sortedArr.length; i < len; i++) {
    if (uniqueDefs.indexOf(sortedArr[i].def) === -1) {
      uniqueDefs.push(sortedArr[i].def);
      uniqueSortedArr.push(sortedArr[i]);
    }
  }

  return uniqueSortedArr;
};

/**
 * Creates a new, sorted array of contexts. Contexts are only included in the
 * new, sorted array if they exist in the original `arr`.
 *
 * @since 1.0.0
 *
 * @param {Array} arr The array to sort.
 * @returns {Array} Returns a new, sorted array of contexts.
 *
 * @example
 * sortContexts([`l`, `m`, `xs`, `s`]);
 * // => [`xs`, `s`, `m`, `l`]
 *
 * sortContexts([`l`, `xl`, `s`]);
 * // => [`s`, `l`, `xl`]
 */
const sortContexts = (arr: any[]): AssetContext[] => {
  const sortedContexts: AssetContext[] = [`xs`, `s`, `m`, `l`, `xl`];
  const sortedArr: AssetContext[] = [];

  for (let i = 0, len = sortedContexts.length; i < len; i++) {
    if (arr.indexOf(sortedContexts[i]) !== -1) {
      sortedArr.push(sortedContexts[i]);
    }
  }

  return sortedArr;
};

/**
 * Converts `str` to its corresponding t-shirt size. Defaults to `'xs'` if a
 * corresponding t-shirt size cannot be determined.
 *
 * @since 1.0.0
 *
 * @param {string} str The string to check.
 * @returns {string} Returns the converted t-shirt size, else `'xs'`.
 *
 * @example
 * toContext(`Medium`);
 * // => `'m'`
 *
 * toContext(`Massive`);
 * // => `'xs'`
 */
const toContext = (str: string): AssetContext => {
  switch (true) {
    case /^l((ar)?ge)?$/i.test(str):
      return `l`;
    case /^m(ed(ium)?)?$/i.test(str):
      return `m`;
    case /^s(m(al)?l)?$/i.test(str):
      return `s`;
    case /^e?x(tra)?-*l((ar)?ge)?$/i.test(str):
      return `xl`;
    default:
      return `xs`;
  }
};

/**
 * Converts the first series of digits contained in `str` to a number.
 *
 * @since 1.0.0
 *
 * @param {string} str The string to process.
 * @returns {number} Returns the first series of digits contained in `str`, else
 * `NaN`.
 *
 * @example
 * toNumber(`2`);
 * // => 2
 *
 * toNumber(`@1.5x`);
 * // => 1.5
 */
const toNumber = (str: string): number => {
  if (/\d/.test(str)) {
    return parseFloat(str.match(/\d+(\.\d+)?/)![0]);
  }

  return NaN;
};

/**
 * The global `assets` object that stores the active document's contextualised
 * asset arguments.
 */
const assets: Partial<Record<AssetContext, Asset[]>> = {};

/**
 * The global flags referenced throughout this application.
 */
let hasAssets: boolean = false;
let hasContexts: boolean = false;

// Invocation

getAssets(() => {
  if (hasAssets) {
    showDialog((resImg: ResponsiveImage) => {
      generateResponsiveImg(resImg);
    });
  }
});
