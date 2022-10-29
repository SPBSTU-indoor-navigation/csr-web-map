import variables from './variables.js'
import { writeFileSync } from 'fs'
import path from 'path';

let css = '';

function addScssVar(name, value) {
  css += `$${name}: ${value}${typeof value === 'number' ? 'px' : ''};\n`
}
function pascal(str) {
  return str.replace(/[A-Z]/g, (a, b) => `-${a.toLowerCase()}`)
}

function bake(obj, prefix = '') {
  Object.entries(obj).forEach(([key, value]) => {
    key = pascal(key)

    if (!(typeof value === 'object')) {
      addScssVar(`${prefix}${key}`, value)
    } else {
      bake(value, `${prefix}${key}-`)
    }
  })
}

bake(variables)


const url = path.join(import.meta.url.replace('file:', ''), '../generated.scss')
writeFileSync(url, css)

