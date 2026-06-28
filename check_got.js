const path = require('path')
const heliosCore = path.join(__dirname, '..', '..', 'HeliosLauncher-master', 'node_modules')

try {
    const got = require('got')
    console.log('got version:', require('got/package.json').version)
    console.log('got.main:', require('got/package.json').main)
    
    const pkg = require('got/package.json')
    console.log('exports:', JSON.stringify(pkg.exports))
    console.log('type:', pkg.type)
    
    // Try different import paths
    const got2 = require(path.join(heliosCore, 'got'))
    console.log('from heliosCore: OK, version:', require(path.join(heliosCore, 'got/package.json')).version)
    
    // Test head request
    got2.head('https://cdn.jsdelivr.net/gh/Pasterox-sborka/sborka-number1@main/mods/jei-1.21.1-neoforge-19.27.0.340.jar')
        .then(r => console.log('HEAD OK:', r.headers['content-length']))
        .catch(e => console.log('HEAD FAIL:', e.message))
} catch(e) {
    console.error('ERROR:', e.message)
}
