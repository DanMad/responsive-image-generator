# Responsive Image Generator

A plugin to extend Adobe® Photoshop's `Generate > Image Assets` behaviour.

...

## Installation

1. Download the [Responsive Image Generator](https://point-to-dl.com/).
2. Add your copy of the script to Photoshop's `Scripts` directory.

   - The directory path on Mac OS is:

     `Macintosh HD/Applications/Adobe Photoshop 2020/Presets/Scripts`.

   - The directory path on Windows is:

     `C:\Program Files\Adobe\Adobe Photoshop 2020\Presets\Scripts`.

**Note:** The paths may vary from the examples above, depending on the version of Photoshop you're running. 3. Open Photoshop. 4. Navigate to `File > Scripts > Script Events Manager`. The following dialog should appear:

![Adobe® Photoshop's Script Events Manager dialog](./images/installation-support-1.png)

5. Change the `Photoshop Event` dropdown to `Save Document`, the `Script` dropdown to `responsive-image-generator.min.jsx`, and then press `Add`. The `Script Events Manager` dialog should now show the `responsive-image-generator.min.jsx` script associated with the `Save Document` event:

![Adobe® Photoshop's Script Events Manager dialog with Responsive Image Generator installed](./images/installation-support-2.png)

6. Press `Done` and you're good to go!

## Usage

Once you've successfully completed the _Installation_ instructions, saving your documents will trigger the Responsive Image Generator. If a document contains assets that are being generated, then the Responsive Image Generator's dialog will appear.

As an example, let's say a document contains three assets; `100x100 mona-lisa.jpg`, `200x200 mona-lisa-@2x.jpg` and `300x300 mona-lisa-@3x.jpg`:

![Adobe® Photoshop's Layers panel](./images/usage-support-1.png)

When saving the document, the following Responsive Image Generator dialog will appear, prompting you for the image's `alt` text:

![Responsive Image Generator's dialog](./images/usage-support-2.png)

Let's sat you entered `"The Mona Lisa"`. This would result in a `responsive-image.html` file being generated in the `mona-lisa-assets` directory Photoshop generates, containing the following snippet:

```html
<img
  alt="The Mona Lisa"
  src="/images/mona-lisa.jpg"
  srcset="/images/mona-lisa-@2x.jpg 2x, /images/mona-lisa-@3x.jpg 3x"
/>
```

If you expanded on the original example to additional assets with contextual arguments:

- Small:
  - `100x100 mona-lisa-sml.jpg`
  - `200x200 mona-lisa-sml-@2x.jpg`
  - `300x300 mona-lisa-sml-@3x.jpg`
- Medium:
  - `200x200 mona-lisa-med.jpg`
  - `400x400 mona-lisa-med-@2x.jpg`
  - `600x600 mona-lisa-med-@3x.jpg`
- Large:
  - `400x400 mona-lisa-lge.jpg`
  - `800x800 mona-lisa-lge-@2x.jpg`
  - `1200x1200 mona-lisa-lge-@3x.jpg`

![Adobe® Photoshop's Layers panel](./images/usage-support-3.png)

When saving the document, the following Responsive Image Generator dialog will appear, prompting you for the image's `alt` text:

![Responsive Image Generator's dialog](./images/usage-support-4.png)

Let's sat you entered `"The Mona Lisa"`. This would result in a `responsive-image.html` file being generated in the `mona-lisa-assets` directory Photoshop generates, containing the following snippet:

```html
<picture>
  <source
    media="(min-width: 48.0625em)"
    srcset="
      /images/mona-lisa-lge.jpg,
      /images/mona-lisa-lge-@2x.jpg 2x,
      /images/mona-lisa-lge-@3x.jpg 3x
    "
  />
  <source
    media="(min-width: 30.0625em)"
    srcset="
      /images/mona-lisa-med.jpg,
      /images/mona-lisa-med-@2x.jpg 2x,
      /images/mona-lisa-med-@3x.jpg 3x
    "
  />
  <img alt="The Mona Lisa" src="/images/mona-lisa-sml.jpg" [//]: #
  (prettier-ignore) srcset=" /images/mona-lisa-sml-@2x.jpg 2x,
  /images/mona-lisa-sml-@3x.jpg 3x" />
</picture>
```

## Issues

If you encounter any bugs, please [post an issue](https://github.com/DanMad/responsive-image-generator/issues).

## Contributing

Contributions are more than welcome. Ensure you read through the [contributing guidelines](https://github.com/DanMad/responsive-image-generator/blob/master/CONTRIBUTING.md) before submitting a pull request.
