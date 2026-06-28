const fs = require('fs')
const path = require('path')
const got = require(path.join('C:', 'Users', 'Пользователь', 'Desktop', 'HeliosLauncher-master', 'node_modules', 'got'))

const CDN = 'https://cdn.jsdelivr.net/gh/Pasterox-sborka/sborka-number1@main'
const RAW = 'https://raw.githubusercontent.com/Pasterox-sborka/sborka-number1/main'

const distro = JSON.parse(fs.readFileSync('distribution.json', 'utf-8'))
const server = distro.servers[0]
const modules = server.modules

let fixedCount = 0
let sizeCount = 0

async function main() {
    for (const mod of modules) {
        // Fix mod artifact URLs - use raw for .jar, CDN for everything else
        if (mod.artifact && mod.artifact.url) {
            if (mod.artifact.url.startsWith(CDN)) {
                const fileName = mod.artifact.url.split('/').pop()
                if (fileName.endsWith('.jar')) {
                    mod.artifact.url = mod.artifact.url.replace(CDN, RAW)
                    fixedCount++
                }
            }
        }

        // Get correct file sizes for .jar files
        if (mod.type === 'ForgeMod' && mod.artifact && mod.artifact.url) {
            try {
                const res = await got.head(mod.artifact.url, { timeout: { request: 10000 } })
                const size = parseInt(res.headers['content-length'] || '0')
                if (size > 0) {
                    mod.artifact.size = size
                    sizeCount++
                }
            } catch (e) {
                console.log('HEAD FAIL:', mod.name?.substring(0, 40) || mod.artifact.url.split('/').pop().substring(0, 40))
            }
        }

        // Fix subModules artifact URLs
        if (mod.subModules) {
            for (const sm of mod.subModules) {
                if (sm.artifact && sm.artifact.url) {
                    if (sm.artifact.url.startsWith(CDN)) {
                        const fileName = sm.artifact.url.split('/').pop()
                        if (fileName.endsWith('.jar')) {
                            sm.artifact.url = sm.artifact.url.replace(CDN, RAW)
                            fixedCount++
                        }
                    }
                }
            }
        }
    }

    // Keep CDN for JSON/XML/png
    distro.rss = CDN + '/rss.xml'
    server.icon = CDN + '/icon.png'

    fs.writeFileSync('distribution_new.json', JSON.stringify(distro, null, 4), 'utf-8')
    console.log('Fixed URLs:', fixedCount, '| Sized:', sizeCount, '| Total:', modules.length)
}

main().catch(e => console.error('FATAL:', e.message))
