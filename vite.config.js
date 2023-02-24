import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      // Could also be a dictionary or array of multiple entry points
      entry: resolve(__dirname, 'src/validity.js'),
      name: 'alpine-validity',
      // the proper extensions will be added
      fileName: 'alpine-validity'
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: ['alpinejs'],
      output: {
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
          Alpine: 'Alpine'
        }
      }
    }
  }
})
