// Use to webpack
const { compileTemplate } = require('@vue/compiler-sfc')
const { optimize } = require('svgo')

function svgToComponent(svg) {
  // Compress SVG images to eliminate redundant information and reduce file size
  let newSvg = optimize(svg, {
    path: this.resourcePath
  }).data

  // Change the fixed color value fill in the SVG file to currentColor
  const regex = /fill="#([\da-f]{3}){1,2}"/gi
  newSvg = newSvg.replace(regex, 'fill="currentColor"')

  // compile
  const { code } = compileTemplate({
    id: this.resourcePath,
    source: newSvg,
    filename: this.resourcePath,
    transformAssetUrls: false
  })

  return `${code}\nexport default { render: render }`
}

module.exports = svgToComponent