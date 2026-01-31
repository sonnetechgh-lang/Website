document.addEventListener('DOMContentLoaded', () => {
    // Scroll Animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.fade-up').forEach(el => {
        observer.observe(el);
    });

    // Header Scroll Effect
    const header = document.querySelector('.header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Mobile Menu Toggle
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const nav = document.querySelector('.nav');

    if (mobileBtn) {
        mobileBtn.addEventListener('click', () => {
            nav.classList.toggle('active');
        });
    }

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                if (nav.classList.contains('active')) {
                    nav.classList.remove('active');
                }

                window.scrollTo({
                    top: target.offsetTop - 100, // Offset for fixed header
                    behavior: 'smooth'
                });
            }
        });
    });

    // Typewriter Effect
    const typingElement = document.querySelector('.gradient-text');
    const heroSection = document.querySelector('.hero');
    
    if (typingElement && heroSection) {
        const textToType = typingElement.innerText;
        let charIndex = 0;
        let isTyping = false;
        
        // Ensure initial state
        typingElement.innerText = '';
        
        // Create cursor if it doesn't exist
        let cursor = document.querySelector('.typing-cursor');
        if (!cursor) {
            cursor = document.createElement('span');
            cursor.className = 'typing-cursor';
            typingElement.parentNode.insertBefore(cursor, typingElement.nextSibling);
        }

        function typeWriter() {
            if (charIndex < textToType.length) {
                typingElement.innerText += textToType.charAt(charIndex);
                charIndex++;
                setTimeout(typeWriter, 200); // Slower typing speed (was 150)
            } else {
                cursor.classList.add('is-dot');
                isTyping = false;
            }
        }

        function resetTyping() {
            typingElement.innerText = '';
            charIndex = 0;
            cursor.classList.remove('is-dot');
            isTyping = false;
        }

        const heroObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    if (!isTyping) {
                        resetTyping();
                        isTyping = true;
                        setTimeout(typeWriter, 500);
                    }
                } else {
                    // Reset when off-screen so tokens are clear for next entry
                    resetTyping();
                }
            });
        }, { threshold: 0.1 });

        heroObserver.observe(heroSection);
    }
});
