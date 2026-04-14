document.addEventListener('DOMContentLoaded', () => {
    // Basic interaction for star rating
    const ratingSections = document.querySelectorAll('.rating-stars');
    
    ratingSections.forEach(section => {
        const stars = section.querySelectorAll('i');
        const meal = section.getAttribute('data-meal');
        const savedRating = localStorage.getItem(`mess_rating_${meal}`);

        // Initialize state
        if (savedRating) {
            fillStars(stars, parseInt(savedRating));
        }

        stars.forEach(star => {
            star.addEventListener('click', (e) => {
                const val = parseInt(e.target.getAttribute('data-val'));
                fillStars(stars, val);
                localStorage.setItem(`mess_rating_${meal}`, val);
            });

            star.addEventListener('mouseenter', (e) => {
                const val = parseInt(e.target.getAttribute('data-val'));
                fillStars(stars, val, true);
            });
        });

        section.addEventListener('mouseleave', () => {
            const currentVal = parseInt(localStorage.getItem(`mess_rating_${meal}`)) || 0;
            fillStars(stars, currentVal);
        });
    });

    function fillStars(stars, limit, isHover = false) {
        stars.forEach(star => {
            const val = parseInt(star.getAttribute('data-val'));
            if (val <= limit) {
                star.classList.add('active');
                if (isHover) star.style.color = '#fbbf24'; // hover color
            } else {
                star.classList.remove('active');
                if (isHover) star.style.color = '';
            }
        });
    }

    // Feedback submission mock
    const submitBtn = document.querySelector('.feedback-box button');
    const textarea = document.querySelector('.feedback-box textarea');
    
    submitBtn.addEventListener('click', () => {
        if (!textarea.value.trim()) return;
        submitBtn.innerText = 'Submitted!';
        submitBtn.style.background = 'var(--success)';
        setTimeout(() => {
            textarea.value = '';
            submitBtn.innerText = 'Submit';
            submitBtn.style.background = 'var(--accent-primary)';
        }, 2000);
    });
});
