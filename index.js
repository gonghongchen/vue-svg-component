// Use to vite
const { compileTemplate } = require('@vue/compiler-sfc')
const { optimize } = require('svgo')
const fs = require('fs/promises')

function svgToComponent (options = {}) {

  return {
    name: 'vue-svg-component',
    enforce: 'pre',

    async load (path) {
      const { query } = options
      const svgReg = query ? new RegExp(`\\.svg\\?${query}$`) : /\.svg$/

      if (!(svgReg).test(path)) {
        return
      } 

      let svg = ''
      !!query && (path = path.replace(`?${query}`, ''))

      try {
        svg = await fs.readFile(path, 'utf-8')
      } catch (ex) {
        console.warn('\n', `${path} couldn't be loaded by vue-svg-component loader.`)
        return
      }

      // Compress SVG images to eliminate redundant information and reduce file size
      svg = optimize(svg, {
        path
      }).data

      // Change the fixed color value fill in the SVG file to currentColor
      const regex = /fill="#([\da-f]{3}){1,2}"/gi
      svg = svg.replace(regex, 'fill="currentColor"')

      // compile
      const { code } = compileTemplate({
        id: path,
        source: svg,
        filename: path,
        transformAssetUrls: false
      })

      return `${code}\nexport default { render: render }`
    }
  }
}

module.exports = svgToComponent
