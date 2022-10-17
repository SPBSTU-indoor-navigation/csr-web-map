import style from './light.js'
import { writeFileSync } from 'fs'
import path from 'path';

let css = '';
Object.entries(style.annotation.occupant).forEach(([key, value]) => {
  if (value.pointFill) {
    css += `.background-color-occupant-${key.replace('.', '-')} { background-color: ${value.pointFill}; }\n`
  }
})

Object.entries(style.annotation.attraction).forEach(([key, value]) => {
  css += `.attraction-${key} { background-color: ${value}; }\n`
})

const url = path.join(import.meta.url.replace('file:', ''), '../light.css')
writeFileSync(url, css)

