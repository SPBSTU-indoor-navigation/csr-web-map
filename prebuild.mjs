import { readdir } from 'node:fs/promises'
import { join } from 'node:path'

const deepReadDir = async (dirPath) => await Promise.all(
  (await readdir(dirPath, { withFileTypes: true })).map(async (dirent) => {
    const path = join(dirPath, dirent.name)
    return dirent.isDirectory() ? await deepReadDir(path) : path
  }),
)

const files = (await deepReadDir('src')).flat(Infinity)
files.filter((file) => file.endsWith('.prebuild.mjs')).forEach((file) => {
  console.log(`Running prebuild script for ${file}`);
  import(`./${file}`)
})
