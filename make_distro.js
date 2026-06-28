const fs = require('fs')
const path = require('path')
const got = require(path.join('C:', 'Users', 'Пользователь', 'Desktop', 'HeliosLauncher-master', 'node_modules', 'got'))

const RAW = 'https://raw.githubusercontent.com/Pasterox-sborka/sborka-number1/main'
const MODS_DIR = path.join(__dirname, 'mods')

const distro = {
    rss: RAW + '/rss.xml',
    servers: [{
        id: 'pasterox',
        icon: RAW + '/icon.png',
        modpackDir: 'pasterox',
        minecraftVersion: '1.21.1',
        address: 'c15.play2go.cloud:20058',
        modules: []
    }]
}

// Load existing distribution to preserve NeoForge + VersionManifest
const existing = JSON.parse(fs.readFileSync(path.join(__dirname, 'distribution.json'), 'utf-8'))
const neoforgeModule = existing.servers[0].modules[0]  // Keep NeoForge + VersionManifest as-is

const modFiles = fs.readdirSync(MODS_DIR).filter(f => f.endsWith('.jar'))

async function main() {
    // Get sizes for all mod files
    for (const file of modFiles) {
        const fullPath = path.join(MODS_DIR, file)
        const stats = fs.statSync(fullPath)
        const name = file.replace(/\.jar$/, '')
        const safeId = name.replace(/[^a-zA-Z0-9._-]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '').substring(0, 80)
        const mavenId = 'pasterox:' + safeId + ':1.0'

        distro.servers[0].modules.push({
            id: mavenId,
            name: name,
            type: 'ForgeMod',
            required: { value: true, def: true },
            artifact: {
                url: RAW + '/mods/' + encodeURIComponent(file),
                size: stats.size
            }
        })
    }

    // Prepend NeoForge module at the beginning
    distro.servers[0].modules.unshift(neoforgeModule)

    fs.writeFileSync(path.join(__dirname, 'distribution_new.json'), JSON.stringify(distro, null, 4), 'utf-8')
    console.log('DONE. Mods:', modFiles.length, 'Size:', fs.statSync(path.join(__dirname, 'distribution_new.json')).size, 'bytes')
}

main().catch(e => console.error('FATAL:', e.message))
