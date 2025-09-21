);
}
// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initLoader();
    // initThree(); // commented out by Comet Assistant per request
    initAnimations();
    initNavigation();
    initContactForm();
    initCursor();
    initParallax();
    
    // Add scroll-triggered animations for stats
    const statNumbers = document.querySelectorAll('.stat-number');
    statNumbers.forEach(stat => {
        const target = stat.textContent;
        stat.textContent = '0';
        
        gsap.to(stat, {
            textContent: target,
            duration: 2,
            ease: 'power2.out',
            snap: { textContent: 1 },
            scrollTrigger: {
                trigger: stat,
                start: 'top 80%'
            }
        });
    });
});
// Additional interactive effects
function addInteractiveEffects() {
    // Card tilt effect on mouse move
    const cards = document.querySelectorAll('.glass-card');
    
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
        });
    });
}
// Initialize interactive effects after DOM load
document.addEventListener('DOMContentLoaded', addInteractiveEffects);
