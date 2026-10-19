/* Captures the website's POS imagery from the real demo (demo.html).
   Re-run this whenever the demo interface changes, so the homepage
   never shows an outdated screen.

   Needs Node and puppeteer-core (uses your installed Chrome):
     npm i --no-save puppeteer-core
     node tools/capture-demo.cjs
   Set CHROME_PATH if Chrome is not in the default Windows location. */
const http = require('http')
const fs = require('fs')
const path = require('path')
const puppeteer = require('puppeteer-core')

const ROOT = path.resolve(__dirname, '..')
const OUT = path.join(ROOT, 'assets', 'demo')
const CHROME = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const TYPES = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.png': 'image/png', '.jpg': 'image/jpeg', '.ico': 'image/x-icon' }

const server = http.createServer((req, res) => {
    const file = path.join(ROOT, decodeURIComponent(req.url.split(/[?#]/)[0]))
    if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); return res.end() }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' })
    fs.createReadStream(file).pipe(res)
})

const wait = (ms) => new Promise((r) => setTimeout(r, ms))

async function main() {
    fs.mkdirSync(OUT, { recursive: true })
    await new Promise((r) => server.listen(0, r))
    const base = `http://localhost:${server.address().port}/demo.html`
    const browser = await puppeteer.launch({ executablePath: CHROME, headless: true })
    const page = await browser.newPage()

    async function open(view, viewport) {
        await page.setViewport(viewport)
        await page.goto('about:blank') // force a fresh load, even when only the hash changes
        await page.goto(base + (view ? '#' + view : ''), { waitUntil: 'networkidle0' })
        await page.evaluate(() => { localStorage.clear(); document.getElementById('reset-demo').click() })
        await page.evaluate(() => document.fonts.ready)
        // Hide the fictional-data banner in stills; the site captions say the data is fictional.
        await page.addStyleTag({ content: '.demo-notice{display:none!important}' })
        await wait(300)
    }
    const shot = (name, opts = {}) => page.screenshot({ path: path.join(OUT, name), type: 'webp', quality: 82, ...opts })
    const desktop = { width: 1280, height: 800, deviceScaleFactor: 2 }

    /* Feature rows: one cropped view per capability. */
    await open('products', desktop)
    await shot('feature-stock.webp', { clip: { x: 256, y: 65, width: 1024, height: 640 } })

    await open('pos', desktop)
    await page.click('.pkg[data-pid="P01"]')
    await page.click('.pkg[data-pid="P05"]')
    await page.click('.pkg[data-pid="P05"]')
    await shot('feature-sale.webp', { clip: { x: 256, y: 65, width: 1024, height: 640 } })

    await open('reports', desktop)
    await page.evaluate(() => window.scrollTo(0, 0))
    await shot('feature-reports.webp', { clip: { x: 256, y: 65, width: 1024, height: 640 } })

    /* Sale walkthrough: real interactions, one frame per step. The viewport is
       tall enough to show the whole cart, so every frame shares one framing. */
    await open('pos', { width: 1280, height: 1160, deviceScaleFactor: 2 })
    const frameClip = { x: 256, y: 0, width: 1024, height: 1160 }
    const frame = (n) => shot(`sale-${n}.webp`, { clip: frameClip })
    await page.type('#pos-search', 'rice', { delay: 40 })
    await frame(1)
    await page.click('.pkg[data-pid="P01"]')
    await page.click('#pos-search', { clickCount: 3 }); await page.keyboard.press('Backspace')
    await page.click('.pkg[data-pid="P05"]')
    await page.click('.pkg[data-pid="P05"]')
    await frame(2)
    await page.select('#check-customer', 'C2')
    await frame(3)
    await page.select('#payment-select', 'momo')
    await page.type('#check-momo', 'MM-204518', { delay: 30 })
    await frame(4)
    await page.click('#complete-sale')
    await wait(200)
    await frame(5)
    await page.click('#view-receipt')
    await wait(300)
    await frame(6)
    await page.click('#r-close')
    await page.click('.demo-nav-item[data-view="reports"]')
    await wait(300)
    await frame(7)

    /* Mobile hero still: the responsive dashboard. */
    await open('dashboard', { width: 390, height: 760, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
    await shot('mobile-dashboard.webp')

    /* Social-sharing image (1200x630). */
    await open('dashboard', { width: 1200, height: 630, deviceScaleFactor: 1 })
    await page.screenshot({ path: path.join(OUT, 'og-dashboard.jpg'), type: 'jpeg', quality: 86 })

    await browser.close()
    server.close()
    console.log('Saved demo captures to', OUT)
}

main().catch((err) => { console.error(err); process.exit(1) })
