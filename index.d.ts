interface Options {
  query?: string
}

declare module 'vue-svg-component' {
  import { LoaderModule } from 'webpack'
  import { Plugin } from 'vite'
  /**
   * @description Transform svg to vue component.
   * @param query Used to identify which files should be transformed, if undefined or empty string, will transform all svg files to vue component.
   * @returns Webpack loader or Vite plugin
   */
  function svgToComponent(options?: Options): LoaderModule | Plugin
  export default svgToComponent
}

declare module '*.svg?com' {
  import { FunctionalComponent, SVGAttributes } from 'vue'
  const src: FunctionalComponent<SVGAttributes>
  export default src
}