document.addEventListener('DOMContentLoaded', () => {
    const header = document.querySelector('.header')
    const onScroll = () => header && header.classList.toggle('scrolled', window.scrollY > 10)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })

    const menuBtn = document.querySelector('.menu-btn')
    const nav = document.querySelector('.nav')
    if (menuBtn && nav) {
        menuBtn.addEventListener('click', () => nav.classList.toggle('open'))
        nav.querySelectorAll('a').forEach((a) =>
            a.addEventListener('click', () => nav.classList.remove('open'))
        )
    }

    const reveals = document.querySelectorAll('.reveal')
    if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('in')
                        io.unobserve(entry.target)
                    }
                })
            },
            { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
        )
        reveals.forEach((el) => io.observe(el))
    } else {
        reveals.forEach((el) => el.classList.add('in'))
    }

    const year = document.querySelector('[data-year]')
    if (year) year.textContent = new Date().getFullYear()

    const faqItems = document.querySelectorAll('.faq-item')
    faqItems.forEach((item) => {
        const btn = item.querySelector('.faq-q')
        const panel = item.querySelector('.faq-a')
        if (!btn) return
        btn.addEventListener('click', () => {
            const isOpen = item.classList.contains('open')
            faqItems.forEach((i) => i.classList.remove('open'))
            if (!isOpen) item.classList.add('open')
        })
        if (panel) panel.setAttribute('aria-hidden', 'true')
    })

    const escapeModal = (e) => {
        if (e.key === 'Escape') closeModal()
    }

    function closeModal() {
        const modal = document.querySelector('.modal')
        const video = modal && modal.querySelector('video, iframe')
        if (modal) {
            if (video) {
                video.pause && video.pause()
                if (video.tagName === 'IFRAME') video.src = ''
            }
            modal.remove()
        }
        document.removeEventListener('keydown', escapeModal)
        const launcher = document.querySelector('[data-modal-launcher]')
        launcher && launcher.focus()
    }

    document.querySelectorAll('[data-modal-launcher]').forEach((launcher) => {
        launcher.addEventListener('click', () => {
            const tmpl = document.getElementById(launcher.dataset.modalTarget)
            if (tmpl) {
                document.body.appendChild(tmpl.content.cloneNode(true))
                const modal = document.querySelector('.modal')
                const close = modal && modal.querySelector('.modal-close')
                close && close.addEventListener('click', closeModal)
                modal && modal.querySelector('button, a, .play') && modal.querySelector('button, a, .play').focus()
                document.addEventListener('keydown', escapeModal)
            }
        })
    })
})