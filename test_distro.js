const { HeliosDistribution } = require('helios-core/common')
const fs = require('fs')

const raw = JSON.parse(fs.readFileSync('distribution.json', 'utf-8'))
console.log('Top keys:', Object.keys(raw))
console.log('Servers:', raw.servers.length)
console.log('Modules count:', raw.servers[0].modules.length)

try {
    const d = new HeliosDistribution(raw, 'test_common', 'test_instances')
    console.log('HeliosDistribution OK. Servers:', d.servers.length)
    const mainServer = d.getMainServer()
    console.log('Main server modules:', mainServer.modules.length)
    const forgeMods = mainServer.modules.filter(m => m.rawModule.type === 'ForgeMod')
    console.log('ForgeMod count:', forgeMods.length)
    if (forgeMods.length > 0) {
        console.log('First ForgeMod ID:', forgeMods[0].rawModule.id)
        console.log('First ForgeMod URL (60):', forgeMods[0].rawModule.artifact.url.substring(0, 60))
    }
    console.log('SUCCESS - distribution.json is valid!')
} catch(e) {
    console.error('ERROR:', e.message)
}
