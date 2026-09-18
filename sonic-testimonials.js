/* Video testimonials.
   The section stays hidden until at least one client-approved testimonial is
   added to the APPROVED_TEAM data below. Requirements per public testifying client:
   written approval for video, name, image, business name and spoken statement.
   No placeholder or fictional content is ever rendered. */
const APPROVED_VIDEO_TESTIMONIALS = []

document.addEventListener('DOMContentLoaded', () => {
    const section = document.getElementById('testimonials')
    const grid = document.getElementById('testimonial-grid')
    const tmpl = document.getElementById('testimonial-modal')
    if (!section || !grid || !tmpl || !APPROVED_VIDEO_TESTIMONIALS.length) return

    section.hidden = false

    const openModal = (card, index) => {
        const modal = tmpl.content.cloneNode(true).querySelector('.modal')
        const video = modal.querySelector('.video-frame')
        const t = APPROVED_VIDEO_TESTIMONIALS[index]
        video.dataset.src = t.video
        video.poster = t.poster
        modal.querySelector('#modal-title').textContent = `${t.clientName} · ${t.businessName}`
        if (t.captionsVtt) {
            const track = document.createElement('track')
            track.kind = 'captions'
            track.src = t.captionsVtt
            track.srclang = 'en'
            track.label = 'English'
            video.appendChild(track)
        }
        modal.querySelector('.transcript').textContent = t.transcript
        document.body.appendChild(modal)
        video.focus()

        const close = () => {
            video.pause()
            modal.remove()
            document.removeEventListener('keydown', onKey)
            card.querySelector('.play').focus()
        }
        const onKey = (e) => {
            if (e.key === 'Escape') close()
            if (e.key === 'Tab') {
                const f = modal.querySelectorAll('video, button')
                const first = f[0]
                const last = f[f.length - 1]
                if (e.shiftKey && document.activeElement === first) {
                    e.preventDefault()
                    last.focus()
                } else if (!e.shiftKey && document.activeElement === last) {
                    e.preventDefault()
                    first.focus()
                }
            }
        }
        modal.querySelector('.modal-close').addEventListener('click', close)
        document.addEventListener('keydown', onKey)
    }

    APPROVED_VIDEO_TESTIMONIALS.forEach((t, index) => {
        const card = document.createElement('article')
        card.className = 'testimonial-card'
        card.innerHTML = `
            <button class="play" data-testimonial="${index}" aria-label="Play video testimonial from ${t.clientName.replace(/"/g, '&quot;')}" style="position:absolute;inset:0;margin:auto;background:none;border:none;z-index:2">
            </button>
            <div class="thumb">
                <img src="${t.poster}" alt="" style="width:100%;height:100%;object-fit:cover">
                <span class="dur">${t.duration}</span>
            </div>
            <div class="who">${t.clientName}</div>
            <div class="biz">${t.businessName} · ${t.role}</div>
            <p class="sum">${t.summary}</p>
            <a class="tag" href="${t.caseStudyUrl || 'client-stories.html'}">Read the case study →</a>
        `
        card.querySelector('[data-testimonial]').addEventListener('click', () => openModal(card, index))
        grid.appendChild(card)
    })
})