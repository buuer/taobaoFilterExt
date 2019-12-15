// import { terser } from 'rollup-plugin-terser'

import fs from 'fs-extra'

fs.emptyDirSync('./dist')
fs.copy('./assets', './dist')

// const plugins = [terser()]

export default [
  {
    input: './src/content.js',
    output: {
      file: './dist/content.js',
      format: 'iife'
    }
    // plugins
  }
]
