# vue-svg-component
**Transform svg to vue component, Suitable for *vite* and *webpack*.**

**中文文档请查看`README_CN.md`**

The functional points included are as follows:
* Use svg file as vue component.
* During the conversion process, the existing fixed color values in the SVG file will be filled and converted to currentColor, making it easier to use CSS to set the color (if your project does not want this processing, then there is actually no need to use the SVG file in the form of Vue components. It should be more reasonable to use IMG directly).
* During the conversion process, the use of `svgo` will be optimized to compress and eliminate redundant information in the source code of SVG.
* Without any additional configuration processing, the introduction of all SVGs within the project will be transformed. If you only want to process a certain part of the SVGs, you can achieve it by customizing the configuration identifier. Please refer to the following description for specific configurations.

## Installation
```sh
# npm
npm i vue-svg-component -D
```

## Usage examples
First, import file:
```js
import HomeIcon from '@/assets/home.svg'
// Alternatively, by adding query parameters such as com, it can be identified that only the introduction of this type of SVG file will be converted into a component
import HomeIcon from '@/assets/home.svg?com'
```
Then use it this way:
```html
<HomeIcon style="color: red" />
<!-- or -->
<component :is="HomeIcon" class="svg-icon" />
```
As for how to set colors for icons, two situations need to be distinguished to handle:
1. If the icon itself is a monochromatic SVG file, you only need to set the color attribute;
2. If the icon itself is a multi-color SVG file, setting the color value directly in the outer layer is not sufficient. Different color values need to be set for different nodes in the SVG file to achieve a multi-color effect. For example, different colors can be set for nodes such as rect and path inside the icon:
    ```css
    .svg-icon {
      rect {
        color: red;
      }
      path {
        color: black;
      }
    }
    ```

## Vite environment configuration
Configure in `vite.config.js`:
```js
import svgToComponent from 'vue-svg-component'

export default defineConfig({
  plugins: [svgToComponent({
    query: 'com', // Only match processing .svg?com，such as：import HomeIcon from '@/assets/home.svg?com'
  })],
})
```
For the `vue-svg-component` in the Vite environment, it can be identified by passing in the parameter `query` as a specific string that only such svg will be converted into a vue component. If the parameter is empty, all svgs will be converted by default.

## Webpack environment configuration
Configure in `vue.config.js`：
```js
configureWebpack: {
  module: {
    rules: [
      {
        test: /\.svg$/,
        // Convert all SVGs:
        // loader: 'vue-svg-component/webpack',
        // Convert specific SVGs:
        oneOf: [
          {
            resourceQuery: /com/, // Only match processing .svg?com，such as：import HomeIcon from '@/assets/home.svg?com'
            use: 'vue-svg-component/webpack',
          },
        ],
      },
    ],
  },
},
// or
chainWebpack(config) {
  config.module
    .rule('svg-loader')
    .test(/\.svg$/) // Process all
    // .test(/\.svg\?com$/)  // only .svg?com
    .use('vue-svg-component/webpack')
    .loader('vue-svg-component/webpack')
    .end()
},
```
The above configuration is different from using the input parameter `query` to process svg files of a specified type in the Vite environment. In the Webpack environment, you can directly use the `oneOf` configuration or customize the regular expression of `test` to achieve this.

It should be noted that if there are any unclear additional rules for SVG configuration within the project that result in importing SVG files with results that are not just component content but other results, webpack can provide an [inline method](https://www.webpackjs.com/concepts/loaders/#inline) to enforce the use of only `vue-svg-component` for processing:
```js
import Icon from '!!vue-svg-component/webpack!./assets/icon.svg'
```
You can also achieve this by modifying the suffix of the SVG file to another specific file format, such as changing it to `.svgcom` to indicate that this is an SVG file that will be processed as a component during import, but this approach is obviously not elegant enough.

In addition, you can use the command:
```sh
vue inspect > webpack.config.js
```
To output the complete webpack configuration information in the project, check the specific processing rules for SVG files that already exist, and then take corresponding measures accordingly. For example, the Vue project created through VueCLI will have this processing rule configured by default:
```js
/* config.module.rule('svg') */
{
  test: /\.(svg)(\?.*)?$/,
  type: 'asset/resource',
  generator: {
    filename: 'img/[name].[hash:8][ext]'
  }
},
```
This will always result in a file path when importing an SVG file. Then, you can delete this rule by configuring it as follows:
```js
chainWebpack(config) {
  config.module.rules.delete('svg')
},
```