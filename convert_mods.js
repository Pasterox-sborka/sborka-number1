const fs = require('fs')
const path = require('path')

// Use got from HeliosLauncher's node_modules
const got = require(path.join('C:', 'Users', 'Пользователь', 'Desktop', 'HeliosLauncher-master', 'node_modules', 'got'))

const RAW = 'https://raw.githubusercontent.com/Pasterox-sborka/sborka-number1/main'
const CDN = 'https://cdn.jsdelivr.net/gh/Pasterox-sborka/sborka-number1@main'

const distro = JSON.parse(fs.readFileSync('distribution.json', 'utf-8'))
const server = distro.servers[0]
const mods = server.mods

async function main() {
    const newModules = [...server.modules]

    for (const [i, mod] of mods.entries()) {
        const name = mod.name.replace(/\.jar$/, '')
        const safeId = name.replace(/[^a-zA-Z0-9._-]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '')
        const mavenId = 'pasterox:' + safeId.substring(0, 80) + ':1.0'

        const cdnUrl = mod.url.replace(RAW, CDN)
        let size = 0

        try {
            const res = await got.head(cdnUrl, { timeout: { request: 10000 } })
            size = parseInt(res.headers['content-length'] || '0')
        } catch (e) {
            // size stays 0
        }

        const entry = {
            id: mavenId,
            name: mod.name,
            type: 'ForgeMod',
            required: { value: mod.required !== false, def: true },
            artifact: {
                url: cdnUrl,
                size: size
            }
        }
        newModules.push(entry)

        if ((i + 1) % 20 === 0) console.log('Progress:', (i + 1), '/', mods.length)
    }

    server.modules = newModules
    delete server.mods

    // Fix RSS and icon URLs
    distro.rss = CDN + '/rss.xml'
    server.icon = CDN + '/icon.png'

    fs.writeFileSync('distribution_new.json', JSON.stringify(distro, null, 4), 'utf-8')
    console.log('\nDONE. Mods:', mods.length, 'Size:', fs.statSync('distribution_new.json').size, 'bytes')
}

main().catch(e => console.error('FATAL:', e))
