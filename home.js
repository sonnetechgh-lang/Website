/* Add exactly three approved customer videos here when supplied.
   Each entry: { name, business, src, captions, poster }.
   Use consented public media only; captions must be a WebVTT file. */
const customerVideos = []

const toggle = document.querySelector('.menu-toggle')
const navigation = document.getElementById('navigation')
const demoFrame = document.querySelector('.product-preview iframe[data-src]')
function closeMenu() {
    if (!navigation || !toggle) return
    navigation.classList.remove('open')
    toggle.setAttribute('aria-expanded', 'false')
}
if (toggle && navigation) {
    toggle.addEventListener('click', () => {
        const open = navigation.classList.toggle('open')
        toggle.setAttribute('aria-expanded', String(open))
    })
    navigation.addEventListener('click', (event) => { if (event.target.closest('a')) closeMenu() })
    document.addEventListener('keydown', (event) => { if (event.key === 'Escape') { closeMenu(); toggle.focus() } })
}
document.getElementById('year').textContent = new Date().getFullYear()

function loadDemoFrame() {
    if (!demoFrame || demoFrame.getAttribute('src')) return
    demoFrame.removeAttribute('srcdoc')
    demoFrame.setAttribute('src', demoFrame.getAttribute('data-src'))
}
if (demoFrame) {
    window.addEventListener('load', () => {
        if ('requestIdleCallback' in window) requestIdleCallback(loadDemoFrame, { timeout: 1800 })
        else setTimeout(loadDemoFrame, 800)
    }, { once: true })
}

customerVideos.slice(0, 3).forEach((story, index) => {
    if (!story.src || !story.name || !story.captions) return
    const article = document.createElement('article')
    article.className = 'customer-video'
    const video = document.createElement('video')
    video.controls = true
    video.preload = 'none'
    video.playsInline = true
    video.src = story.src
    video.setAttribute('aria-label', `${story.name} — customer story`)
    if (story.poster) video.poster = story.poster
    const captions = document.createElement('track')
    captions.kind = 'captions'
    captions.src = story.captions
    captions.srclang = 'en'
    captions.label = 'English'
    video.append(captions)
    const heading = document.createElement('h3')
    heading.textContent = story.name
    const business = document.createElement('p')
    business.textContent = story.business || ''
    article.append(video, heading, business)
    document.getElementById('customer-videos').children[index].replaceWith(article)
})
