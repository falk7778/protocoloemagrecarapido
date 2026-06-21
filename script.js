document.addEventListener('DOMContentLoaded', () => {
    // 1. Scroll Animations (Fade-in)
    const fadeElements = document.querySelectorAll('.fade-in');

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const fadeObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    fadeElements.forEach(el => {
        fadeObserver.observe(el);
    });

    // 2. Carousel Swipe Logic
    const track = document.querySelector('.carousel-track');
    const slides = Array.from(document.querySelectorAll('.carousel-slide'));
    const dots = Array.from(document.querySelectorAll('.dot'));
    
    if (track && slides.length > 0) {
        let currentIndex = 0;
        let startX = 0;
        let currentTranslate = 0;
        let prevTranslate = 0;
        let isDragging = false;
        let animationID;

        // Set initial positions
        function updateCarousel() {
            slides.forEach((slide, index) => {
                if (index === currentIndex) {
                    dots[index].classList.add('active');
                } else {
                    dots[index].classList.remove('active');
                }
            });
            const offset = currentIndex * -100;
            track.style.transform = `translateX(${offset}%)`;
        }

        // Touch events
        track.addEventListener('touchstart', touchStart);
        track.addEventListener('touchend', touchEnd);
        track.addEventListener('touchmove', touchMove);

        // Mouse events for testing on desktop
        track.addEventListener('mousedown', touchStart);
        track.addEventListener('mouseup', touchEnd);
        track.addEventListener('mouseleave', () => {
            if (isDragging) touchEnd();
        });
        track.addEventListener('mousemove', touchMove);

        // Prevent default image drag
        track.querySelectorAll('img').forEach(img => {
            img.addEventListener('dragstart', e => e.preventDefault());
        });

        function touchStart(event) {
            isDragging = true;
            startX = getPositionX(event);
            track.style.transition = 'none'; // remove transition while dragging
            animationID = requestAnimationFrame(animation);
        }

        function touchMove(event) {
            if (isDragging) {
                const currentPosition = getPositionX(event);
                currentTranslate = prevTranslate + currentPosition - startX;
            }
        }

        function touchEnd() {
            isDragging = false;
            cancelAnimationFrame(animationID);
            
            const movedBy = currentTranslate - prevTranslate;
            
            // threshold to register a swipe
            if (movedBy < -50 && currentIndex < slides.length - 1) {
                currentIndex += 1;
            }
            if (movedBy > 50 && currentIndex > 0) {
                currentIndex -= 1;
            }
            
            track.style.transition = 'transform 0.3s ease-out';
            prevTranslate = currentIndex * -window.innerWidth; // rough approx for desktop
            updateCarousel();
        }

        function getPositionX(event) {
            return event.type.includes('mouse') ? event.pageX : event.touches[0].clientX;
        }

        function animation() {
            // we could animate dragging here by setting transform
            if(isDragging) requestAnimationFrame(animation);
        }

        // Initialize dots click
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                currentIndex = index;
                track.style.transition = 'transform 0.3s ease-out';
                updateCarousel();
            });
        });
    }
});
