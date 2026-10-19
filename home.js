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

/* Walkthrough booking form: sends through FormSubmit to info@sonnetghana.com.
   Without JavaScript the form still posts normally and returns to ?booked=1. */
const bookingForm = document.getElementById('booking-form')
if (bookingForm) {
    const status = document.getElementById('booking-status')
    const submit = bookingForm.querySelector('button[type="submit"]')
    const fallback = 'Please call <a href="tel:+233545489242">+233 54 548 9242</a> or <a href="https://wa.me/233257940113">message us on WhatsApp</a>.'
    const setStatus = (kind, html) => { status.className = 'form-status ' + kind; status.innerHTML = html }

    const dialog = document.getElementById('booking-dialog')
    function openBooking() {
        closeMenu()
        if (!dialog.open) dialog.showModal()
        bookingForm.elements.name.focus()
    }
    // The header button opens the form; without JavaScript it falls back to email.
    document.querySelectorAll('[data-open-booking]').forEach((link) => link.addEventListener('click', (event) => {
        if (typeof dialog.showModal !== 'function') return
        event.preventDefault()
        openBooking()
    }))
    dialog.querySelectorAll('[data-close-booking]').forEach((btn) => btn.addEventListener('click', () => dialog.close()))
    dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close() }) // backdrop

    if (new URLSearchParams(location.search).get('booked') === '1') {
        setStatus('ok', 'Thank you. We’ve received your request and will call you shortly to arrange your walkthrough.')
        if (typeof dialog.showModal === 'function') dialog.showModal()
    }

    const checks = {
        name: (v) => v.trim().length >= 2 || 'Please enter your name.',
        phone: (v) => v.replace(/\D/g, '').length >= 9 || 'Please enter a phone number we can call.',
        email: (v) => !v.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) || 'Please check the email address, or leave it blank.'
    }
    function validate(input) {
        const check = checks[input.name]
        if (!check) return true
        const result = check(input.value)
        const id = input.id + '-error'
        let error = document.getElementById(id)
        if (result === true) {
            input.removeAttribute('aria-invalid')
            input.removeAttribute('aria-describedby')
            if (error) error.remove()
            return true
        }
        if (!error) {
            error = document.createElement('p')
            error.className = 'field-error'
            error.id = id
            input.after(error)
        }
        error.textContent = result
        input.setAttribute('aria-invalid', 'true')
        input.setAttribute('aria-describedby', id)
        return false
    }
    bookingForm.querySelectorAll('input[name="name"], input[name="phone"], input[name="email"]').forEach((input) => {
        input.addEventListener('blur', () => { if (input.value) validate(input) })
        input.addEventListener('input', () => { if (input.getAttribute('aria-invalid')) validate(input) })
    })

    bookingForm.addEventListener('submit', async (event) => {
        event.preventDefault()
        const fields = ['name', 'phone', 'email'].map((n) => bookingForm.elements[n])
        const invalid = fields.filter((input) => !validate(input))
        if (invalid.length) { invalid[0].focus(); return }

        const data = Object.fromEntries(new FormData(bookingForm))
        if (data._honey) return // filled in by a bot
        delete data._next
        if (data.email) data._replyto = data.email
        submit.disabled = true
        submit.textContent = 'Sending…'
        setStatus('', '')
        try {
            const response = await fetch(bookingForm.action.replace('formsubmit.co/', 'formsubmit.co/ajax/'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                body: JSON.stringify(data)
            })
            const result = await response.json().catch(() => ({}))
            if (!response.ok || String(result.success) !== 'true') throw new Error(result.message || 'Send failed')
            bookingForm.reset()
            setStatus('ok', 'Thank you. We’ve received your request and will call you shortly to arrange your walkthrough.')
        } catch (err) {
            setStatus('error', 'Sorry, your request didn’t send. ' + fallback)
        } finally {
            submit.disabled = false
            submit.textContent = 'Book a walkthrough'
        }
    })
}
