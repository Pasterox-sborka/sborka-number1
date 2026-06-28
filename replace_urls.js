const fs = require('fs')

const RAW = 'https://raw.githubusercontent.com/Pasterox-sborka/sborka-number1/main'
const CDN = 'https://cdn.jsdelivr.net/gh/Pasterox-sborka/sborka-number1@main'

let data = fs.readFileSync('distribution_new.json', 'utf-8')
data = data.split(RAW).join(CDN)
fs.writeFileSync('distribution.json', data, 'utf-8')
console.log('Replaced. Size:', fs.statSync('distribution.json').size)
