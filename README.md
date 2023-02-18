# Responsive Image Generator

A plugin that extends Adobe® Photoshop's
[Generate Image Assets](https://helpx.adobe.com/au/photoshop/using/generate-assets-layers.html)
feature.

## Table of Contents

- [Getting Started](#getting-started)
- [Usage](#usage)
- [Issues](#issues)
- [Contributing](#contributing)

## Getting Started

1. Download the
   [Responsive Image Generator](https://raw.githubusercontent.com/danmad/responsive-image-generator/resources/responsive-image-generator.min.jsx).
2. Add the downloaded script to Photoshop's `Scripts` directory. The path to
   this directory is as follows:

   - Mac OS: `Macintosh HD/Applications/Adobe Photoshop 2023/Presets/Scripts`
   - Windows': `C:\Program Files\Adobe\Adobe Photoshop 2023\Presets\Scripts`

   **Note:** These paths may vary depending on your OS and the version of
   Photoshop you're running.

3. Navigate to `File > Scripts > Script Events Manager`. The
   `Script Events Manager` dialog should appear.

   ![Adobe® Photoshop's Script Events Manager dialog](https://github.com/danmad/responsive-image-generator/blob/resources/getting-started-example-1.png)

4. Assign the `responsive-image-generator.min.jsx` script to the `Save Document` event:

   1. Check `Enable Events to Run Scripts/Actions`.
   2. Select `Save Document` from the options in the `Photoshop Event` dropdown.
   3. Select `responsive-image-generator.min.jsx` from the options in the
      `Script` dropdown.

      **Note:** If `responsive-image-generator.min.jsx` isn't available in the
      `Script` dropdown, browse your file system and select it from Photoshop's
      `Scripts` directory.

   4. Press `Add`.

   The dialog should now appear as follows.

   ![Adobe® Photoshop's Script Events Manager dialog with Responsive Image Generator installed](https://github.com/danmad/responsive-image-generator/blob/resources/getting-started-example-2.png)

5. Press `Done`.
6. As the the Responsive Image Generator is designed to extend Photoshop's
   _Generate Image Assets_ feature, you'll also need to ensure this is toggled
   on by checking `File > Generate > Image Assets`.

Now you're good to go!

## Usage

Saving a document will call the Responsive Image Generator. If any of the
document's layer names contain asset declarations, then the Responsive Image
Generator's dialog will appear.

### Examples

Say you're working on a document called `mona-lisa.psd` and its layer names
contain the following assets declarations that need to be generated:

- `100x100 mona-lisa.jpg`
- `200x200 mona-lisa-@2x.jpg`
- `300x300 mona-lisa-@3x.jpg`

![Adobe® Photoshop's Layers panel](https://github.com/danmad/responsive-image-generator/blob/resources/usage-example-1.png)

You save the document and the Responsive Image Generator's dialog appears,
prompting you for the responsive image's `alt` text.

![Responsive Image Generator's dialog](https://github.com/danmad/responsive-image-generator/blob/resources/usage-example-2.png)

You add `"The Mona Lisa"` as `alt` text and press `Save`.

This results in a `mona-lisa.html` file being generated inside the
`mona-lisa-assets` directory alongside the generated assets. The file contains
an HTML pattern, referencing the generated assets.

```html
<img
  alt="The Mona Lisa"
  src="/images/mona-lisa.jpg"
  srcset="/images/mona-lisa-@2x.jpg 2x, /images/mona-lisa-@3x.jpg 3x"
/>
```

Expanding on this example, you now need to serve different images for different
contexts:

- `sml`
- `med`
- `lge`

This is on top of already serving different images for different resolutions.

You modify the original asset declarations and include a `sml` argument:

- `100x100 mona-lisa-sml.jpg`
- `200x200 mona-lisa-sml-@2x.jpg`
- `300x300 mona-lisa-sml-@3x.jpg`

You then wrap the orginal layer in two, new groups and include additional asset
declarations in the new group's layer names:

- `200x200 mona-lisa-med.jpg`
- `400x400 mona-lisa-med-@2x.jpg`
- `600x600 mona-lisa-med-@3x.jpg`
- `400x400 mona-lisa-lge.jpg`
- `800x800 mona-lisa-lge-@2x.jpg`
- `1200x1200 mona-lisa-lge-@3x.jpg`

![Adobe® Photoshop's Layers panel](https://github.com/danmad/responsive-image-generator/blob/resources/usage-example-3.png)

You save the document and the Responsive Image Generator's dialog appears with
additional inputs, so that you can configure the responsive image's breakpoints.

![Responsive Image Generator's dialog](https://github.com/danmad/responsive-image-generator/blob/resources/usage-example-4.png)

You're happy with the default breakpoints, so you add `"The Mona Lisa"` as `alt`
text and press `Save` again.

The HTML pattern generated in the `mona-lisa.html` file now includes `media`
attributes that specify the responsive image's breakpoints, as well as
referencing the generated assets. Ensuring that different images are served for
different resolutions _and_ different contexts.

```html
<picture>
  <source
    media="(min-width: 48.0625em)"
    srcset="
      /images/mona-lisa-lge.jpg     1x,
      /images/mona-lisa-lge-@2x.jpg 2x,
      /images/mona-lisa-lge-@3x.jpg 3x
    "
  />
  <source
    media="(min-width: 30.0625em)"
    srcset="
      /images/mona-lisa-med.jpg     1x,
      /images/mona-lisa-med-@2x.jpg 2x,
      /images/mona-lisa-med-@3x.jpg 3x
    "
  />
  <img
    alt="The Mona Lisa"
    src="/images/mona-lisa-sml.jpg"
    srcset="/images/mona-lisa-sml-@2x.jpg 2x, /images/mona-lisa-sml-@3x.jpg 3x"
  />
</picture>
```

## Issues

If you encounter any bugs, please
[post an issue](https://github.com/danmad/responsive-image-generator/issues/new).

## Contributing

Contributions are more than welcome. Ensure you read through the
[contributing guidelines](https://github.com/danmad/responsive-image-generator/blob/main/CONTRIBUTING.md)
before submitting a pull request.
