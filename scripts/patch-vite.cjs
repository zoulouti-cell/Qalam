// Self-healing patch for the Windows sandbox: vite's optimizeSafeRealPathSync()
// spawns `net use` (child process with piped stdio), which is blocked by the
// sandbox (EPERM). We replace that exec call with a direct assignment since we
// do not need network-drive realpath mapping. Idempotent, literal replacement.
const fs = require('node:fs')
const path = require('node:path')

const target = path.join(__dirname, '..', 'node_modules', '.pnpm', 'vite@8.3.5', 'node_modules', 'vite', 'dist', 'node', 'chunks', 'node.js')

if (!fs.existsSync(target)) {
  console.log('[patch-vite] vite dist not found, skipping')
  process.exit(0)
}

const src = fs.readFileSync(target, 'utf8')

const OLD = '\texec("net use", { windowsHide: true }, (error, stdout) => {\n' +
  '\t\tif (error) return;\n' +
  '\t\tconst lines = stdout.split("\\n");\n' +
  '\t\tfor (const line of lines) {\n' +
  '\t\t\tconst m = parseNetUseRE.exec(line);\n' +
  '\t\t\tif (m) windowsNetworkMap.set(m[2], m[1]);\n' +
  '\t\t}\n' +
  '\t\tif (windowsNetworkMap.size === 0) safeRealpathSync = fs.realpathSync.native;\n' +
  '\t\telse safeRealpathSync = windowsMappedRealpathSync;\n' +
  '\t});'

const NEW = '\tsafeRealpathSync = fs.realpathSync.native;'

if (!src.includes(OLD)) {
  if (src.includes('exec("net use"')) {
    console.error('[patch-vite] ERROR: net-use exec found but literal block mismatched — file may be damaged')
    process.exit(1)
  }
  console.log('[patch-vite] net-use exec already patched or not found, skipping')
  process.exit(0)
}

const patched = src.replace(OLD, NEW)
fs.writeFileSync(target, patched)
console.log('[patch-vite] patched optimizeSafeRealPathSync (removed `net use` spawn), removed', src.length - patched.length, 'chars')
