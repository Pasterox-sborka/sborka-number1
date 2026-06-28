const fs = require('fs')
const path = require('path')
const got = require(path.join('C:', 'Users', 'Пользователь', 'Desktop', 'HeliosLauncher-master', 'node_modules', 'got'))

const CDN = 'https://cdn.jsdelivr.net/gh/Pasterox-sborka/sborka-number1@main'
const RAW = 'https://raw.githubusercontent.com/Pasterox-sborka/sborka-number1/main'

const distro = JSON.parse(fs.readFileSync('distribution.json', 'utf-8'))
const server = distro.servers[0]
const mods = server.mods

// Use CDN only for JSON/XML/image files (CDN blocks .jar with 403)
function cdnUrl(rawUrl) {
    if (rawUrl.endsWith('.json') || rawUrl.endsWith('.xml') || rawUrl.endsWith('.png')) {
        return rawUrl.replace(RAW, CDN)
    }
    return rawUrl
}

async function main() {
    const newModules = [...server.modules]

    for (const [i, mod] of mods.entries()) {
        const name = mod.name.replace(/\.jar$/, '')
        const safeId = name.replace(/[^a-zA-Z0-9._-]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '')
        const mavenId = 'pasterox:' + safeId.substring(0, 80) + ':1.0'

        let size = 0
        try {
            const res = await got.head(mod.url, { timeout: { request: 10000 } })
            size = parseInt(res.headers['content-length'] || '0')
        } catch (e) {
            console.log('SIZE FAIL:', mod.name.substring(0, 40))
        }

        const entry = {
            id: mavenId,
            name: mod.name,
            type: 'ForgeMod',
            required: { value: mod.required !== false, def: true },
            artifact: {
                url: mod.url,
                size: size
            }
        }
        newModules.push(entry)
        if ((i + 1) % 20 === 0) console.log('Progress:', (i + 1), '/', mods.length)
    }

    server.modules = newModules
    delete server.mods

    // CDN for non-.jar assets
    distro.rss = CDN + '/rss.xml'
    server.icon = CDN + '/icon.png'

    // Fix NeoForge module URLs
    const neoforge = server.modules[0]
    neoforge.artifact.url = cdnUrl(neoforge.artifact.url)
    neoforge.subModules[0].artifact.url = cdnUrl(neoforge.subModules[0].artifact.url)

    fs.writeFileSync('distribution_new.json', JSON.stringify(distro, null, 4), 'utf-8')
    console.log('\nDONE. Mods:', mods.length, 'Size:', fs.statSync('distribution_new.json').size, 'bytes')
}

main().catch(e => console.error('FATAL:', e))
