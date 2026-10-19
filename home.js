const toggle = document.querySelector('.menu-toggle')
const navigation = document.getElementById('navigation')
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

/* Live demo in the hero: wide screens only. Phones get a static capture,
   so the embedded app never traps page scrolling. */
const demoFrame = document.querySelector('.product-preview iframe[data-src]')
const wide = window.matchMedia('(min-width: 701px)')
function loadDemoFrame() {
    if (!demoFrame || demoFrame.getAttribute('src') || !wide.matches) return
    demoFrame.removeAttribute('srcdoc')
    demoFrame.setAttribute('src', demoFrame.getAttribute('data-src'))
}
if (demoFrame) {
    window.addEventListener('load', () => {
        if ('requestIdleCallback' in window) requestIdleCallback(loadDemoFrame, { timeout: 1800 })
        else setTimeout(loadDemoFrame, 800)
    }, { once: true })
    wide.addEventListener('change', loadDemoFrame)
}

/* Sale walkthrough: steps through real captures of the demo. */
const steps = [...document.querySelectorAll('#sale-steps button')]
const frames = [...document.querySelectorAll('.stage img')]
const bar = document.querySelector('.stage-progress span')
const playToggle = document.getElementById('sale-toggle')
const STEP_MS = 3200
if (steps.length && frames.length === steps.length) {
    let current = 0
    let timer = null
    let playing = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let visible = false
    document.querySelector('.stage').style.setProperty('--step-ms', STEP_MS + 'ms')

    function show(index) {
        current = (index + frames.length) % frames.length
        frames.forEach((img, i) => {
            img.classList.toggle('active', i === current)
            img.setAttribute('aria-hidden', String(i !== current))
        })
        steps.forEach((btn, i) => {
            if (i === current) btn.setAttribute('aria-current', 'step')
            else btn.removeAttribute('aria-current')
        })
        schedule()
    }
    function schedule() {
        clearTimeout(timer)
        bar.classList.remove('run')
        if (!playing || !visible) return
        void bar.offsetWidth // restart the progress animation
        bar.classList.add('run')
        timer = setTimeout(() => show(current + 1), STEP_MS)
    }
    function setPlaying(value) {
        playing = value
        playToggle.textContent = playing ? 'Pause' : 'Play'
        playToggle.setAttribute('aria-pressed', String(!playing))
        schedule()
    }
    steps.forEach((btn, i) => btn.addEventListener('click', () => { playing = false; setPlaying(false); show(i) }))
    playToggle.addEventListener('click', () => setPlaying(!playing))
    new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; schedule() }, { threshold: 0.4 })
        .observe(document.querySelector('.walkthrough'))
    setPlaying(playing)
    show(0)
}
