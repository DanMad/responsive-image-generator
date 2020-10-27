// Config
// =============================================================================

/**
 * The default max-width values for each asset context's breakpoint.
 */
const CONTEXT_MAX_WIDTHS: Readonly<Record<AssetContext, number>> = {
  l: 1280,
  m: 768,
  s: 480,
  xl: 1920,
  xs: 320,
};

/**
 * The default src directory that assets will be referenced from in the
 * responsive image snippet.
 */
const SRC_DIR: Readonly<string> = `/images`;

// ES3 Polyfills
// =============================================================================

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
// =============================================================================

/**
 * Generates an img tag from `resImg` and the global `assets` object, then
 * writes it to `file`.
 *
 * @since 1.0.0
 *
 * @param {Object} file The file to write the img tag to.
 * @param {Object} resImg The object containing alt text and src directory path.
 * @param {number} tabCount The number of tabs the image tag should be nested.
 * @returns {void} This function doesn't have a return statement.
 */
const generateImgTag = (
  file: any,
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

  const contextualAssets: Asset[] = assets[contexts[0]]!;

  file.writeln(
    `${tabs}  src="${resImg.srcDir}/${getWebSafeFileName(contextualAssets[0])}"`
  );

  if (contextualAssets.length > 1) {
    file.writeln(`${tabs}  srcset="`);

    for (
      let i: number = 1, len: number = contextualAssets.length;
      i < len;
      i++
    ) {
      file.write(
        `${tabs}    ${resImg.srcDir}/${getWebSafeFileName(
          contextualAssets[i],
          true
        )}`
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
const generatePictureTag = (file: any, resImg: ResponsiveImage): void => {
  file.writeln(`<picture>`);

  for (let i: number = contexts.length; i > 0; i--) {
    const contextualAssets: Asset[] = assets[contexts[i - 1]]!;
    const minWidth: number = resImg.maxWidths[contexts[i - 2]]! + 1;

    if (i > 1) {
      file.writeln(`  <source`);
      file.writeln(`    media="(min-width: ${minWidth / 16}em)"`);
      file.writeln(`    srcset="`);

      for (
        let i: number = 0, len: number = contextualAssets.length;
        i < len;
        i++
      ) {
        file.write(
          `      ${resImg.srcDir}/${getWebSafeFileName(
            contextualAssets[i],
            true
          )}`
        );

        if (i < len - 1) {
          file.write(`,`);
        }

        file.write(`\n`);
      }

      file.writeln(`    "`);
      file.writeln(`  />`);
    } else {
      generateImgTag(file, resImg, 1);
    }
  }

  file.writeln(`</picture>`);
};

/**
 * Generates a responsive image snippet from `resImg` and writes the html file
 * to the relevant directory.
 *
 * @since 1.0.0
 *
 * @param {Object} resImg The object to process.
 * @returns {void} This function doesn't have a return statement.
 */
const generateResponsiveImg = (resImg: ResponsiveImage): void => {
  if (renameAssets) {
    for (let i: number = 0, len: number = contexts.length; i < len; i++) {
      const contextualAssets: Asset[] = assets[contexts[i]]!;

      for (
        let i: number = 0, len: number = contextualAssets.length;
        i < len;
        i++
      ) {
        contextualAssets[i].name = docName;
      }
    }

    scanLayers((layer) => {
      const args: string[] = layer.name.split(`,`);

      for (let i: number = 0, len: number = args.length; i < len; i++) {
        let asset: Asset = getAsset(args[i]);
        let newName: string = ``;

        if (!!asset.size) {
          newName += `${asset.size} `;
        }

        newName += docName;

        if (!!asset.context) {
          newName += `-${asset.context}`;
        }

        if (!!asset.def) {
          newName += `-${asset.def}`;
        }

        newName += asset.ext;

        if (!!asset.qual) {
          newName += asset.qual;
        }

        args[i] = newName;
      }

      // The following statements resolve an intermittent bug that would prevent
      // the Responsive Image Generator from overwriting the value of
      // layer.name.
      const tempLayer: any = app.activeDocument.artLayers.add();
      tempLayer.remove();

      layer.name = args.join(", ");
    });
  }

  const docPath: string = app.activeDocument.path;

  // The following statement is ignored as the Folder class is not native to
  // JavaScript.
  // @ts-ignore
  const folder: any = Folder(`${docPath}/${docName}-assets`);

  if (!folder.exists) {
    folder.create();
  }

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
    generateImgTag(file, resImg);
  }

  file.close();
};

/**
 * Creates an `asset` object from the `str` argument passed.
 *
 * @since 1.0.0
 *
 * @param {string} str The string to process.
 * @returns {Object} Returns an `asset` object.
 */
const getAsset = (str: string): Asset => {
  const regExps: Record<Exclude<AssetParam, "name">, RegExp> = {
    context: /(m(ed(ium)?)?|(e?x(tra)?-*)?(s(m(al)?l)?|l((ar)?ge)?))$/i,
    def: /@?[1-9](\.\d+)?x?$/i,
    ext: /\.(gif|jpe?g|png)$/i,
    qual: /(([1-9]\d?|100)%|10|[1-9])$/,
    size: /^\d{1,5}((\.\d{1,6})?%|([cm]m|in|px)?\s*?x\s*?\d{1,5}([cm]m|in|px)?)/i,
  };

  const asset: any = {};
  let arg: string = str.trim();

  if (regExps.size.test(arg)) {
    asset.size = arg.match(regExps.size)![0];
    arg = arg.replace(regExps.size, ``).trim();
  }

  if (regExps.qual.test(arg)) {
    asset.qual = arg.match(regExps.qual)![0];
    arg = arg.replace(regExps.qual, ``).trim();
  }

  asset.ext = arg.match(regExps.ext)![0];
  arg = arg.replace(regExps.ext, ``).trim();

  if (regExps.def.test(arg)) {
    asset.def = arg.match(regExps.def)![0];
    arg = arg
      .replace(regExps.def, ``)
      .replace(/[\-_]+$/, ``)
      .trim();
  }

  if (!!asset.def) {
    asset.int = toNumber(asset.def);
  } else {
    asset.int = 1;
  }

  if (regExps.context.test(arg)) {
    asset.context = arg.match(regExps.context)![0];
    arg = arg
      .replace(regExps.context, ``)
      .replace(/[\-_]+$/, ``)
      .trim();
  }

  asset.name = arg.trim();

  return asset;
};

/**
 * Gets all asset contexts and arguments from the active document, sorts all
 * asset contexts and arguments, and invokes the callback function passed when
 * complete.
 *
 * @since 1.0.0
 *
 * @param {Function} fn The callback function to invoke.
 * @returns {void} This function doesn't have a return statement.
 */
const getAssets = (fn: () => void): void => {
  scanLayers((layer) => {
    if (!hasAssets) {
      hasAssets = true;
    }

    const args: string[] = layer.name.split(`,`);

    for (let i: number = 0, len: number = args.length; i < len; i++) {
      let asset: Asset = getAsset(args[i]);
      let context: AssetContext;

      if (!!asset.context) {
        context = toContext(asset.context);
      } else {
        context = `xs`;
      }

      if (!!assets[context]) {
        assets[context]?.push(asset);
      } else {
        assets[context] = [asset];
      }
    }
  });

  contexts = sortContexts(Object.keys(assets) as AssetContext[]);

  if (contexts.length > 1) {
    hasContexts = true;
  }

  for (let i: number = 0, len: number = contexts.length; i < len; i++) {
    assets[contexts[i]] = sortAssets(assets[contexts[i]]!);
  }

  fn();
};

/**
 * Creates a web safe file name from the `asset` object's properties, as well as
 * the file's x-descriptor if `isSrcSetRef` is set to `true`.
 *
 * @since 1.1.0
 *
 * @param {Object} asset The object to get the web safe file's arguments from.
 * @param {boolean} isSrcSetRef The switch to determine if an x-descriptor
 * should be included as well.
 * @returns {string} Returns the web safe file name, as well as the file's
 * x-descriptor if `isSrcSetRef` is set to `true`.
 *
 * @example
 * const monaLisa = {
 *   context: `large`,
 *   ext: `.jpg`,
 *   int: 1,
 *   name: `mona lisa`
 * };
 * const monaLisaAtTwoTimes = {
 *   context: `sml`,
 *   def: `@2x`,
 *   ext: `.jpeg`,
 *   int: 2,
 *   name: `mona lisa`
 * };
 *
 * getWebSafeFileName(monaLisa);
 * // => 'mona%20lisa-large.jpg'
 *
 * getWebSafeFileName(monaLisaAtTwoTimes, true);
 * // => 'mona%20lisa-sml-@2x.jpeg 2x'
 */
const getWebSafeFileName = (
  asset: Asset,
  isSrcSetRef: boolean = false
): string => {
  let fileName: string = ``;

  fileName += asset.name.replace(/\s/g, `%20`);

  if (!!asset.context) {
    fileName += `-${asset.context}`;
  }

  if (!!asset.def) {
    fileName += `-${asset.def}`;
  }

  fileName += asset.ext;

  if (isSrcSetRef) {
    fileName += ` ${asset.int}x`;
  }

  return fileName;
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
 * Recursively scans the layer tree of the `layers` argument and invokes the
 * callback function passed for each layer that has a valid asset argument.
 *
 * @since 1.1.0
 *
 * @param {Function} fn The callback function to invoke.
 * @param {Array} layers The layer tree to scan.
 * @returns {void} This function doesn't have a return statement.
 */
const scanLayers = (
  fn: (layer: any) => void,
  layers: any = app.activeDocument.layers
): void => {
  for (let i: number = 0, len: number = layers.length; i < len; i++) {
    if (hasExtension(layers[i].name)) {
      fn(layers[i]);
    }

    if (isGroup(layers[i])) {
      scanLayers(fn, layers[i].layers);
    }
  }
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

    renameAssets = renameCheckbox.value;

    const resImg: ResponsiveImage = {
      altText: ``,
      fileName: docName,
      maxWidths: {},
      srcDir: SRC_DIR,
    };

    if (!!altTextInput.text) {
      resImg.altText = altTextInput.text.trim();
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

  const fileNameInput: any = fileNameGroup.add(`edittext`, undefined, docName);

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

  if (hasContexts) {
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
  }

  const renameCheckbox: any = dialog.add(
    "checkbox",
    undefined,
    "Rename Image Assets"
  );
  renameCheckbox.alignment = `fill`;
  renameCheckbox.helpTip = `Rename image assets as Photoshop document's name`;
  renameCheckbox.value = renameAssets;

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
 * Creates a new, sorted array of assets. Assets are sorted by their `int` key
 * from lowest to highest number, and only included in the new, sorted array if
 * the `int` key is a unique number. If two assets's `int` keys are the same
 * number, the asset declared later in the active document will take precedence.
 *
 * @since 1.0.0
 *
 * @param {Array} arr The array to sort.
 * @returns {Array} Returns a new, sorted array of assets with unique `int` keys.
 *
 * @example
 * const xs = [
 *   {int: 1, name: `foo.jpg`},
 *   {int: 1.5, name: `bar.jpg`},
 *   {int: 1, name: `baz.jpg`},
 * ]
 *
 * const s = [
 *   {int: 1, name: `foo.png`},
 *   {int: 1, name: `bar.png`},
 *   {int: 2, name: `baz.png`}
 * ];
 *
 * sortAssets(xs);
 * // => `[{int: 1, name: `baz.jpg`}, {int: 1.5, name: `bar.jpg`}]`
 *
 * sortAssets(s);
 * // => `[{int: 1, name: `bar.png`}, {int: 2, name: `baz.png`}]`
 */
const sortAssets = (arr: Asset[]): Asset[] => {
  const sortedArr: Asset[] = arr.sort((a: Asset, b: Asset): number => {
    if (a.int < b.int) {
      return -1;
    }

    return 1;
  });
  const uniqueInts: number[] = [];
  const uniqueSortedArr: Asset[] = [];

  for (let i: number = 0, len: number = sortedArr.length; i < len; i++) {
    if (uniqueInts.indexOf(sortedArr[i].int) === -1) {
      uniqueInts.push(sortedArr[i].int);
      uniqueSortedArr.push(sortedArr[i]);
    } else {
      uniqueSortedArr[uniqueInts.indexOf(sortedArr[i].int)] = sortedArr[i];
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
const sortContexts = (arr: AssetContext[]): AssetContext[] => {
  const orderedContexts: Record<AssetContext, number> = {
    xs: 0,
    s: 1,
    m: 2,
    l: 3,
    xl: 4,
  };

  return arr.sort((a: AssetContext, b: AssetContext): number => {
    return orderedContexts[a] - orderedContexts[b];
  });
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
 * The gobal `contexts` array that stores the active document's sorted contexts.
 */
let contexts: AssetContext[] = [];

/**
 * The default file name when generating a responsive image.
 */
const docName: string = app.activeDocument.name.replace(/\.[a-z]{3,4}$/i, ``);

/**
 * The global flags referenced throughout this application.
 */
let hasAssets: boolean = false;
let hasContexts: boolean = false;
let renameAssets: boolean = false;

// Invocation
// =============================================================================

getAssets(() => {
  if (hasAssets) {
    showDialog((resImg: ResponsiveImage) => {
      generateResponsiveImg(resImg);
    });
  }
});
