// Constants
// =============================================================================

const ASSET_EXTENSIONS: Readonly<string[]> = ['gif', 'jpe?g', 'png'];
const CONTEXT_MAX_WIDTHS: Readonly<Record<AssetContext, number>> = {
  l: 1280,
  m: 768,
  s: 480,
  xl: 1920,
  xs: 320,
};
const SELF_CLOSING_TAGS: Readonly<string[]> = [
  'area',
  'base',
  'br',
  'col',
  'command',
  'embed',
  'hr',
  'img',
  'input',
  'keygen',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
];
const RENAME_ASSETS: boolean = false;
const SRC_DIR: string = '/images';
const TAB_CHAR: string = '  ';

// ES3 Polyfills
// =============================================================================

/**
 * Extends the Array object's interface to include support for
 * Array.prototype.indexOf() as ES3 doesn't natively support it.
 */
if (!Array.prototype.indexOf) {
  Array.prototype.indexOf = function (
    searchElement: Readonly<any>,
    fromIndex?: any,
  ): number {
    let k: number;

    if (this == null) {
      alert('Error: Array.prototype.indexOf()\n"this" is null or undefined.');
    }

    const o: Readonly<any> = Object(this);
    const len: Readonly<number> = o.length >>> 0;

    if (len === 0) {
      return -1;
    }

    const n: Readonly<number> = fromIndex | 0;

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
 * Extends the Object object's interface to include support for Object.keys()
 * as ES3 doesn't natively support it.
 */
if (!Object.keys) {
  Object.keys = (function (): (obj: Readonly<any>) => string[] {
    const hasOwnProperty: (name: Readonly<string>) => Readonly<boolean> =
      Object.prototype.hasOwnProperty;
    const hasDontEnumBug: Readonly<boolean> = !{
      toString: null,
    }.propertyIsEnumerable('toString');
    const dontEnums: Readonly<string[]> = [
      'toString',
      'toLocaleString',
      'valueOf',
      'hasOwnProperty',
      'isPrototypeOf',
      'propertyIsEnumerable',
      'constructor',
    ];
    const dontEnumsLength: Readonly<number> = dontEnums.length;

    return function (obj: Readonly<any>): string[] {
      if (
        typeof obj !== 'function' &&
        (typeof obj !== 'object' || obj === null)
      ) {
        alert('Error: Object.keys()\nCalled on a non-object.');
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
 * String.prototype.trim() as ES3 doesn't natively support it.
 */
if (!String.prototype.trim) {
  String.prototype.trim = function (): string {
    return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
  };
}

// Application
// =============================================================================

/**
 * Checks if `str` contains a valid file extension.
 *
 * @since 1.0.0
 * @arg {string} str The string to check.
 * @arg {Array} types The file types to check for.
 * @return {boolean} Returns `true` if `str` contains a valid file extension
 * from the `types` array, else `false`.
 * @example
 *
 * hasExtension('fileName.jpg');
 * // => true
 *
 * hasExtension('fileName.jpeg', ['psd']);
 * // => false
 */
const hasExtension = (
  str: Readonly<string>,
  types: Readonly<string[]> = ASSET_EXTENSIONS,
): boolean => {
  if (!types.length) {
    return false;
  }

  let regExp: string = '\\.(';

  for (let i: number = 0, len: number = types.length; i < len; i++) {
    regExp += types[i].trim();

    if (i < len - 1) {
      regExp += '|';
    } else {
      regExp += ')';
    }
  }

  return new RegExp(regExp, 'i').test(str);
};

/**
 * Renames the active document's assets, as well any existing asset objects.
 *
 * @since 1.1.0
 * @arg {Object} _ The responsive image info.
 * @return {void} This function doesn't have a return statement.
 */
const renameAssets = (_: ResponsiveImageInfo): void => {
  scanLayers((layer) => {
    const args: string[] = layer.name.split(',');

    for (let i: number = 0, len: number = args.length; i < len; i++) {
      const asset: Readonly<Asset> = toAsset(args[i]);
      let name: string = '';

      if (!!asset.size) {
        name += `${asset.size} `;
      }

      name += _.docName;

      if (!!asset.context) {
        name += `-${asset.context}`;
      }

      if (!!asset.def) {
        name += `-${asset.def}`;
      }

      name += asset.ext;

      if (!!asset.qual) {
        name += asset.qual;
      }

      args[i] = name;
    }

    // The following statements resolve an intermittent bug that would prevent
    // the Responsive Image Generator from overwriting the value of
    // `layer.name`.
    const tempLayer: any = app.activeDocument.artLayers.add();
    tempLayer.remove();

    layer.name = args.join(', ');
  }, _.layers);

  for (let i: number = 0, len: number = _.contexts.length; i < len; i++) {
    const assets: Asset[] = _.assets[_.contexts[i]]!;

    for (let i: number = 0, len: number = assets.length; i < len; i++) {
      assets[i].name = _.docName;
    }
  }
};

/**
 * Recursively scans the `layers` argument and invokes the callback function
 * passed for each layer with a name that contains a valid asset argument.
 *
 * @since 1.1.0
 * @arg {Function} fn The callback function to invoke.
 * @arg {Array} layers The layer tree to scan.
 * @return {void} This function doesn't have a return statement.
 */
const scanLayers = (
  fn: (layer: any) => void,
  layers: Readonly<any[]>,
): void => {
  for (let i: number = 0, len: number = layers.length; i < len; i++) {
    if (hasExtension(layers[i].name)) {
      fn(layers[i]);
    }

    if (layers[i].typename === 'LayerSet') {
      scanLayers(fn, layers[i].layers);
    }
  }
};

/**
 * Presents a dialog with configurable options to the user and invokes the
 * callback function passed when the `Save` button is pressed.
 *
 * @since 1.0.0
 * @arg {Function} fn The callback function to invoke.
 * @arg {Object} _ The responsive image info.
 * @return {void} This function doesn't have a return statement.
 */
const showDialog = (
  fn: (_: ResponsiveImageInfo) => void,
  _: ResponsiveImageInfo,
): void => {
  const handleCancel = (): void => {
    dialog.close();
  };

  const handleSave = (): void => {
    dialog.close();

    if (!!altTextInput.text) {
      _.dialog.altText = altTextInput.text.trim();
    }

    if (!!fileNameInput.text) {
      _.dialog.fileName = fileNameInput.text.trim();
    }

    if (!!srcDirInput.text) {
      _.dialog.srcDir = srcDirInput.text.trim();
    }

    if (_.contexts.length > 1) {
      _.dialog.maxWidths = {};

      for (
        let i: number = 0, len: number = _.contexts.length;
        i < len - 1;
        i++
      ) {
        if (!!contextInputs[_.contexts[i]].text) {
          _.dialog.maxWidths[_.contexts[i]] = toNumber(
            contextInputs[_.contexts[i]].text,
          );
        } else {
          _.dialog.maxWidths[_.contexts[i]] = CONTEXT_MAX_WIDTHS[_.contexts[i]];
        }
      }
    }

    _.dialog.renameAssets = renameAssetsCheckbox.value;
    fn(_);
  };

  // The following statement is ignored as the native `Window` class doesn't
  // expect any arguments, but Adobe® Photoshop's `Window` class expects two
  // arguments.
  // @ts-ignore
  const dialog: any = new Window('dialog', 'Generate Responsive Image');

  dialog.margins = 16;

  const generalPanel: any = dialog.add(
    'panel',
    undefined,
    'General Information',
  );

  generalPanel.alignment = 'fill';
  generalPanel.margins = 16;
  generalPanel.spacing = 12;

  const fileNameGroup: any = generalPanel.add('group');

  fileNameGroup.add('statictext', undefined, 'File Name');
  fileNameGroup.alignment = 'right';
  fileNameGroup.spacing = 0;

  const fileNameInput: any = fileNameGroup.add(
    'edittext',
    undefined,
    _.docName,
  );

  fileNameInput.characters = 16;
  fileNameInput.helpTip = "Add the image's file name";

  const srcDirGroup: any = generalPanel.add(`group`);

  srcDirGroup.add('statictext', undefined, 'Src Directory');
  srcDirGroup.alignment = 'right';
  srcDirGroup.spacing = 0;

  const srcDirInput: any = srcDirGroup.add('edittext', undefined, SRC_DIR);

  srcDirInput.characters = 16;
  srcDirInput.helpTip = "Add the image's src directory";

  const altTextGroup: any = generalPanel.add('group');

  altTextGroup.add(`statictext`, undefined, 'Alt Text');
  altTextGroup.alignment = 'right';
  altTextGroup.spacing = 0;

  const altTextInput: any = altTextGroup.add('edittext');

  altTextInput.active = true;
  altTextInput.characters = 16;
  altTextInput.helpTip = "Add the image's alt text";

  const contextInputs: Partial<Record<AssetContext, any>> = {};

  if (_.contexts.length > 1) {
    const contextualPanel: any = dialog.add(
      'panel',
      undefined,
      'Contextual Information',
    );

    contextualPanel.alignment = 'fill';
    contextualPanel.margins = 16;
    contextualPanel.spacing = 12;

    for (let i: number = 0, len: number = _.contexts.length; i < len - 1; i++) {
      const contextGroup: any = contextualPanel.add('group');

      contextGroup.add(
        'statictext',
        undefined,
        `${_.contexts[i].toUpperCase()}:`,
      );
      contextGroup.alignment = 'right';
      contextGroup.spacing = 0;

      const contextInput: any = contextGroup.add(
        'edittext',
        undefined,
        `${CONTEXT_MAX_WIDTHS[_.contexts[i]]}px`,
      );

      contextInput.characters = 16;
      contextInput.helpTip = "Add the context's max-width";
      contextInputs[_.contexts[i]] = contextInput;
    }
  }

  const renameAssetsCheckbox: any = dialog.add(
    'checkbox',
    undefined,
    'Rename Image Assets',
  );

  renameAssetsCheckbox.alignment = 'fill';
  renameAssetsCheckbox.helpTip =
    "Rename image assets as Photoshop document's name";
  renameAssetsCheckbox.value = RENAME_ASSETS;

  const actionsGroup: any = dialog.add('group');

  actionsGroup.alignment = 'right';
  actionsGroup.spacing = 0;

  const cancelBtn: any = actionsGroup.add('button', undefined, 'Cancel');

  cancelBtn.onClick = handleCancel;

  const saveBtn: any = actionsGroup.add('button', undefined, 'Save');

  saveBtn.onClick = handleSave;
  dialog.show();
};

/**
 * Creates a new, sorted array of assets. Assets are sorted by their `def` key
 * from lowest to highest number, and only included in the new, sorted array if
 * the `def` key contains a unique number. If an asset doesn't contain a `def`
 * key, it's assigned a number of 1. If two assets's `def` keys contain
 * the same number, the asset with the greater array index will take precedence.
 *
 * @since 1.0.0
 * @arg {Array} arr The array to sort.
 * @return {Array} Returns a new, sorted array of assets with unique `def`
 * keys.
 * @example
 *
 * const xs = [
 *   {name: 'foo.jpg'},
 *   {def: '@1.5x', name: 'bar.jpg'},
 *   {name: 'baz.jpg'},
 * ]
 *
 * const s = [
 *   {name: 'foo.png'},
 *   {name: 'bar.png'},
 *   {def: '@2x', name: 'baz.png'}
 * ];
 *
 * sortAssets(xs);
 * // => [{name: 'baz.jpg'}, {def: '@1.5x', name: 'bar.jpg'}]
 *
 * sortAssets(s);
 * // => [{name: 'bar.png'}, {def: '@2x', name: 'baz.png'}]
 */
const sortAssets = (arr: Asset[]): Asset[] => {
  arr.sort((a: Readonly<Asset>, b: Readonly<Asset>): Readonly<number> => {
    if (toNumber(a.def) < toNumber(b.def)) {
      return -1;
    }

    return 1;
  });

  const indexes: number[] = [];
  const uniqueArr: Asset[] = [];

  for (let i: number = 0, len: number = arr.length; i < len; i++) {
    let def: Readonly<number> = toNumber(arr[i].def);

    if (indexes.indexOf(def) === -1) {
      indexes.push(def);
      uniqueArr.push(arr[i]);
    } else {
      uniqueArr[indexes.indexOf(def)] = arr[i];
    }
  }

  return uniqueArr;
};

/**
 * Creates a new, sorted array of contexts.
 *
 * @since 1.0.0
 * @arg {Array} arr The array to sort.
 * @return {Array} Returns a new, sorted array of contexts.
 * @example
 *
 * sortContexts(['l', 'm', 'xs', 's']);
 * // => ['xs', 's', 'm', 'l']
 *
 * sortContexts(['l', 'xl', 's']);
 * // => ['s', 'l', 'xl']
 */
const sortContexts = (arr: AssetContext[]): AssetContext[] => {
  const sortOrder: Readonly<Record<AssetContext, number>> = {
    xs: 0,
    s: 1,
    m: 2,
    l: 3,
    xl: 4,
  };

  return arr.sort(
    (
      a: Readonly<AssetContext>,
      b: Readonly<AssetContext>,
    ): Readonly<number> => {
      return sortOrder[a] - sortOrder[b];
    },
  );
};

/**
 * Creates an `asset` object from the `str` argument passed.
 *
 * @since 1.0.0
 * @arg {string} str The string to process.
 * @return {Object} Returns an `asset` object.
 */
const toAsset = (str: string): Asset => {
  const regExps: Readonly<Record<Exclude<AssetParam, 'name'>, RegExp>> = {
    context: /(m(ed(ium)?)?|(e?x(tra)?-*)?(s(m(al)?l)?|l((ar)?ge)?))$/i,
    def: /@?[1-9](\.\d+)?x?$/i,
    ext: /\.(gif|jpe?g|png)$/i,
    qual: /(([1-9]\d?|100)%|10|[1-9])$/,
    size: /^\d{1,5}((\.\d{1,6})?%|([cm]m|in|px)?\s*?x\s*?\d{1,5}([cm]m|in|px)?)/i,
  };

  const asset: any = {};
  let subStr: string = str.trim();

  if (regExps.size.test(subStr)) {
    asset.size = subStr.match(regExps.size)![0];
    subStr = subStr.replace(regExps.size, '').trim();
  }

  if (regExps.qual.test(subStr)) {
    asset.qual = subStr.match(regExps.qual)![0];
    subStr = subStr.replace(regExps.qual, '').trim();
  }

  asset.ext = subStr.match(regExps.ext)![0];
  subStr = subStr.replace(regExps.ext, '').trim();

  if (regExps.def.test(subStr)) {
    asset.def = subStr.match(regExps.def)![0];
    subStr = subStr
      .replace(regExps.def, '')
      .replace(/[\-_]+$/, '')
      .trim();
  }

  if (regExps.context.test(subStr)) {
    asset.context = subStr.match(regExps.context)![0];
    subStr = subStr
      .replace(regExps.context, '')
      .replace(/[\-_]+$/, '')
      .trim();
  }

  asset.name = subStr.trim();

  return asset;
};

/**
 * Converts `str` to its corresponding t-shirt size. Defaults to `'xs'` if a
 * corresponding t-shirt size cannot be determined.
 *
 * @since 1.0.0
 * @arg {string} str The string to check.
 * @return {string} Returns the converted t-shirt size, else `'xs'`.
 * @example
 *
 * toContext('Medium');
 * // => `m`
 *
 * toContext(undefined);
 * // => 'xs'
 */
const toContext = (str: Readonly<string> = ''): AssetContext => {
  switch (true) {
    case /^l((ar)?ge)?$/i.test(str):
      return 'l';
    case /^m(ed(ium)?)?$/i.test(str):
      return 'm';
    case /^s(m(al)?l)?$/i.test(str):
      return 's';
    case /^e?x(tra)?-*l((ar)?ge)?$/i.test(str):
      return 'xl';
    default:
      return 'xs';
  }
};

/**
 * Converts `tabs` to its corresponding amount of whitespace.
 *
 * @since 1.1.0
 * @arg {number} tabs The number of tabs to be converted.
 * @return {string} Returns the corresponding amount of whitespace.
 * @example
 *
 * toIndent(2);
 * // => '    '
 *
 * toIndent(1);
 * // => '  '
 */
const toIndent = (tabs: Readonly<number>): string => {
  let indent: string = '';

  for (let i: number = 0; i < tabs; i++) {
    indent += TAB_CHAR;
  }

  return indent;
};

/**
 * Converts the first series of digits contained in `str` to a number.
 *
 * @since 1.0.0
 * @arg {string} str The string to process.
 * @return {number} Returns the first series of digits contained in `str`, else
 * `1`.
 * @example
 *
 * toNumber('2');
 * // => 2
 *
 * toNumber('@1.5x');
 * // => 1.5
 */
const toNumber = (str: Readonly<string> = ''): number => {
  if (/\d/.test(str)) {
    return parseFloat(str.match(/\d+(\.\d+)?/)![0]);
  }

  return 1;
};

/**
 * Creates a web safe src from `asset` and `dir`. If `isSrcSetRef` is set to
 * `true` then the src's x-descriptor is also appended.
 *
 * @since 1.1.0
 * @arg {Object} asset The object to get the file name from.
 * @arg {string} path The file path.
 * @arg {boolean} isSrcSetRef The flag to determine if an x-descriptor should
 * be appended.
 * @return {string} Returns the web safe src, as well as its x-descriptor if
 * `isSrcSetRef` is set to `true`.
 * @example
 *
 * const monaLisa = {
 *   context: 'large',
 *   ext: '.jpg',
 *   name: 'mona lisa'
 * };
 * const monaLisaAtTwoTimes = {
 *   context: 'sml',
 *   def: '@2x',
 *   ext: '.jpeg',
 *   name: 'mona lisa'
 * };
 *
 * toWebSafeSrc(monaLisa, 'images');
 * // => 'images/mona%20lisa-large.jpg'
 *
 * toWebSafeSrc(monaLisaAtTwoTimes, 'images', true);
 * // => 'images/mona%20lisa-sml-@2x.jpeg 2x'
 */
const toWebSafeSrc = (
  asset: Asset,
  path: string,
  isSrcSetRef: Readonly<boolean> = false,
): string => {
  let src: string = '';

  src += path.replace(/\s/g, '%20');
  src += '/';
  src += asset.name.replace(/\s/g, '%20');

  if (!!asset.context) {
    src += `-${asset.context}`;
  }

  if (!!asset.def) {
    src += `-${asset.def}`;
  }

  src += asset.ext;

  if (isSrcSetRef) {
    src += ` ${toNumber(asset.def)}x`;
  }

  return src;
};

/**
 * Writes the active document's assets and contexts, sorts through them, and
 * then invokes the callback function passed.
 *
 * @since 1.0.0
 * @arg {Function} fn The callback function to invoke.
 * @return {void} This function doesn't have a return statement.
 */
const writeAssets = (fn: (_: ResponsiveImageInfo) => void): void => {
  const _: ResponsiveImageInfo = {
    assets: {},
    contexts: [],
    dialog: {},
    docName: app.activeDocument.name.replace(/\.[a-z]{3,4}$/i, ''),
    layers: app.activeDocument.layers,
    path: app.activeDocument.path,
  };

  scanLayers((layer) => {
    const args: string[] = layer.name.split(',');

    for (let i: number = 0, len: number = args.length; i < len; i++) {
      const asset: Readonly<Asset> = toAsset(args[i]);
      const context: Readonly<AssetContext> = toContext(asset.context);

      if (!!_.assets[context]) {
        _.assets[context]!.push(asset);
      } else {
        _.assets[context] = [asset];
      }
    }
  }, _.layers);

  _.contexts = sortContexts(Object.keys(_.assets) as AssetContext[]);

  for (let i: number = 0, len: number = _.contexts.length; i < len; i++) {
    _.assets[_.contexts[i]] = sortAssets(_.assets[_.contexts[i]]!);
  }

  fn(_);
};

/**
 * Writes an attribute to `file`, based on `key` and `value`.
 *
 * @since 1.1.0
 * @arg {Object} file The file to write the attribute to.
 * @arg {string} key The attribute's key to write.
 * @arg {string|string[]} value The attribute's value to write.
 * @arg {number} tabs The number of tabs to indent.
 * @return {void} This function doesn't have a return statement.
 */
const writeAttr = (
  file: any,
  key: string,
  value: string | string[],
  tabs: Readonly<number> = 0,
): void => {
  file.write(`${toIndent(tabs)}${key.trim()}="`);

  if (typeof value === 'string') {
    file.write(`${value.trim()}"\r\n`);
  } else {
    file.write('\r\n');

    for (let i = 0, len = value.length; i < len; i++) {
      file.write(`${toIndent(tabs + 1)}${value[i].trim()}`);

      if (i < len - 1) {
        file.write(',');
      }

      file.write('\r\n');
    }

    file.write(`${toIndent(tabs)}"\r\n`);
  }
};

/**
 * Writes `tag` to `file` and then invokes the callback function passed.
 *
 * @since 1.1.0
 * @arg {Function} fn The callback function to invoke.
 * @arg {Object} file The file to write the tag to.
 * @arg {string} tag The tag to write.
 * @arg {number} tabs The number of tabs to indent.
 * @return {void} This function doesn't have a return statement.
 */
const writeTag = (
  fn: (tabs: number) => void,
  file: any,
  tag: string,
  tabs: Readonly<number> = 0,
): void => {
  const TAG: Readonly<string> = tag.trim();

  file.write(`${toIndent(tabs)}<${TAG}`);

  if (SELF_CLOSING_TAGS.indexOf(TAG) === -1) {
    file.write('>');
  }

  file.write('\r\n');
  fn(tabs + 1);
  file.write(toIndent(tabs));

  if (SELF_CLOSING_TAGS.indexOf(TAG) === -1) {
    file.write(`</${TAG}`);
  } else {
    file.write('/');
  }

  file.write('>\r\n');
};

/**
 * Writes the responsive image's HTML snippet.
 *
 * @since 1.1.0
 * @arg {Object} _ The responsive image info.
 * @return {void} This function doesn't have a return statement.
 */
const writeHTML = (_: ResponsiveImageInfo): void => {
  if (_.dialog.renameAssets) {
    renameAssets(_);
  }

  // The following statement is ignored because the `Folder` class is not native
  // to ES3.
  // @ts-ignore
  const dir: any = Folder(`${_.path}/${_.docName}-assets`);

  if (!dir.exists) {
    dir.create();
  }

  // The following statement is ignored because the native `File` class expects
  // two arguments, but Adobe® Photoshop's `File` class expects one argument.
  // @ts-ignore
  const file: any = File(
    `${_.path}/${_.docName}-assets/${_.dialog.fileName}.html`,
  );

  if (file.exists) {
    file.remove();
  }

  file.encoding = 'utf-8';
  file.open('w');

  const writeImgTag = (file: any, tabs: Readonly<number> = 0) => {
    writeTag(
      (tabs) => {
        if (!!_.dialog.altText) {
          writeAttr(file, 'alt', _.dialog.altText, tabs);
        }

        const assets: Readonly<Asset[]> = _.assets[_.contexts[0]]!;
        const src: Readonly<string> = toWebSafeSrc(assets[0], _.dialog.srcDir);
        const srcset: string[] = [];

        for (let i: number = 1, len = assets.length; i < len; i++) {
          srcset.push(toWebSafeSrc(assets[i], _.dialog.srcDir, true));
        }

        writeAttr(file, 'src', src, tabs);
        writeAttr(file, 'srcset', srcset, tabs);
      },
      file,
      'img',
      tabs,
    );
  };

  if (_.contexts.length > 1) {
    writeTag(
      (tabs) => {
        for (let i: number = _.contexts.length - 1; i >= 1; i--) {
          const assets: Readonly<Asset[]> = _.assets[_.contexts[i]]!;
          const minWidth: Readonly<number> =
            _.dialog.maxWidths[_.contexts[i - 1]]! + 1;
          const srcset: string[] = [];

          for (let i: number = 0, len: number = assets.length; i < len; i++) {
            srcset.push(toWebSafeSrc(assets[i], _.dialog.srcDir, true));
          }

          writeTag(
            (tabs) => {
              writeAttr(file, 'media', `(min-width: ${minWidth / 16}em)`, tabs);
              writeAttr(file, 'srcset', srcset, tabs);
            },
            file,
            'source',
            tabs,
          );
        }

        writeImgTag(file, tabs);
      },
      file,
      'picture',
    );
  } else {
    writeImgTag(file);
  }

  file.close();
};

// Invocation
// =============================================================================

writeAssets((_: ResponsiveImageInfo) => {
  if (Object.keys(_.assets).length > 0) {
    showDialog((_: ResponsiveImageInfo) => {
      writeHTML(_);
    }, _);
  }
});
