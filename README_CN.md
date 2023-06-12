# vue-svg-component
**这是一个在 vue 项目中可以将对 svg 文件的引入转换为一个 component 的项目，同时适用于 *vite* 和 *webpack*。**

包含的功能点如下：
* 以 vue 组件的形式使用 svg 文件。
* 转换的过程中会对 svg 文件内已有的固定色值填充转换为 currentColor，从而方便使用 css 来设置 color（如果你的项目不希望有这个处理，那其实也就不需要通过 vue 组件的形式来使用 svg 文件，直接用 img 来使用应该是更合理的）。
* 转换的过程中会对使用 `svgo` 来对 svg 的源代码进行优化处理（压缩及消除冗余信息）。
* 在不做任何额外配置处理的情况下，会对项目内所有 svg 的引入做转换处理，如果只想对某部分 svg 做处理，可以通过自定义配置标识来实现，具体配置请见后文描述。

## 安装
```sh
# npm
npm i vue-svg-component -D
```

## 使用示例
先通过 import 进行导入：
```js
import HomeIcon from '@/assets/home.svg'
// 或者通过追加 com 这样的 query 参数来标识只有这一类的 svg 文件的引入才会被转换为一个组件
import HomeIcon from '@/assets/home.svg?com'
```
然后这样使用：
```html
<HomeIcon style="color: red" />
<!-- 或者 -->
<component :is="HomeIcon" class="svg-icon" />
```
至于如何给 icon 设置颜色，要区分两种情况来处理：
1. 如果 icon 本身是一个单色的 svg 文件，则只需要通过设置 color 属性即可；
2. 如果 icon 本身是一个多色的 svg 文件，那在外层直接设置 color 值就不满足需要了，需要对 svg 文件内的不同节点设置不同的 color 值才能达到多色的效果，例如可以找到 icon 内部的 rect、path 等节点分别设置不同的颜色
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

## Vite 环境配置
在 `vite.config.js` 中配置：
```js
import svgToComponent from 'vue-svg-component'

export default defineConfig({
  plugins: [svgToComponent({
    query: 'com', // 只匹配处理 .svg?com 这一类的 svg，比如：import HomeIcon from '@/assets/home.svg?com'
  })],
})
```
针对 Vite 环境下的 `vue-svg-component` 可以通过传入参数 `query` 为某个特定的字符串来标识只有此类 svg 才会被转换成一个 vue 组件，若参数为空，则默认会对全部 svg 进行转换处理。

## Webpack 环境配置
在 `vue.config.js` 中配置：
```js
configureWebpack: {
  module: {
    rules: [
      {
        test: /\.svg$/,
        // 对全部的 svg 进行转换：
        // loader: 'vue-svg-component/webpack',
        // 对特定的 svg 进行转换：
        oneOf: [
          {
            resourceQuery: /com/, // 只匹配处理 .svg?com 这一类的 svg，比如：import HomeIcon from '@/assets/home.svg?com'
            use: 'vue-svg-component/webpack',
          },
        ],
      },
    ],
  },
},
// 或者
chainWebpack(config) {
  config.module
    .rule('svg-loader')
    .test(/\.svg$/) // 处理全部的
    // .test(/\.svg\?com$/)  // 处理 .svg?com 这一类的
    .use('vue-svg-component/webpack')
    .loader('vue-svg-component/webpack')
    .end()
},
```
如上配置，区别于 Vite 环境使用入参 `query` 来处理指定类型的 svg 文件，在 Webpack 环境下可以直接使用 `oneOf` 配置或者直接自定义 `test` 的正则表达式来实现。

需要特别注意的是：如果项目内有什么不清楚的额外针对 svg 配置的规则从而导致 import svg 文件的时候始终得到的结果都不是一个组件内容而是其它结果的话，可以通过 webpack 提供的[内联方式](https://www.webpackjs.com/concepts/loaders/#inline)来强制只使用 `vue-svg-component` 进行处理:
```js
import Icon from '!!vue-svg-component/webpack!./assets/icon.svg'
```
还可以通过修改 svg 文件的后缀为另外一个特定的文件格式达到目的，比如改为 `.svgcom` 来标识这是一个在 import 时会被处理为 component 的 svg 文件，但是这种方式显然不够优雅。

此外，可以通过命令：
```sh
vue inspect > webpack.config.js
```
来输出项目中完整的 webpack 配置信息，查看具体是已经存在什么针对 svg 文件的处理规则，从而对症下药进行相应处理。比如通过 VueCLI 创建的 vue 项目内就会默认配置这个处理规则：
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
这就会导致 import 一个 svg 文件的时候始终得到的就是一个文件路径。然后可以通过如下配置来删除这个规则即可：
```js
chainWebpack(config) {
  config.module.rules.delete('svg')
},
```