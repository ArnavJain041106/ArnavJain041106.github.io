// Three.js 3D Background with Orange Mouse Glow
let scene, camera, renderer, mouseGlow;
let mouseX = 0, mouseY = 0;

// Initialize Three.js
function initThree() {
    // Scene setup
    scene = new THREE.Scene();
    // Set black background
    scene.background = new THREE.Color(0x000000);
    
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({
        canvas: document.getElementById('bg-canvas'),
        alpha: false, // Changed to false since we want solid black background
        antialias: true
    });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    
    // Create mouse glow effect instead of particles
    createMouseGlow();
    
    // Position camera
    camera.position.z = 50;
    
    // Animation loop
    animate();
}

// Create mouse glow effect
function createMouseGlow() {
    // Create a plane geometry for the glow effect
    const glowGeometry = new THREE.PlaneGeometry(20, 20);
    
    // Create a radial gradient texture for the glow
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const context = canvas.getContext('2d');
    
    // Create radial gradient
    const gradient = context.createRadialGradient(128, 128, 0, 128, 128, 128);
    gradient.addColorStop(0, 'rgba(255, 140, 0, 0.3)'); // Orange center with transparency
    gradient.addColorStop(0.5, 'rgba(255, 140, 0, 0.1)'); // Fade out
    gradient.addColorStop(1, 'rgba(255, 140, 0, 0)'); // Fully transparent at edges
    
    context.fillStyle = gradient;
    context.fillRect(0, 0, 256, 256);
    
    const texture = new THREE.CanvasTexture(canvas);
    
    const glowMaterial = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });
    
    mouseGlow = new THREE.Mesh(glowGeometry, glowMaterial);
    mouseGlow.position.z = -10; // Position behind other elements
    scene.add(mouseGlow);
}

// Convert screen coordinates to world coordinates
function screenToWorld(screenX, screenY) {
    const vector = new THREE.Vector3();
    vector.set(
        (screenX / window.innerWidth) * 2 - 1,
        -(screenY / window.innerHeight) * 2 + 1,
        0
    );
    vector.unproject(camera);
    
    const dir = vector.sub(camera.position).normalize();
    const distance = -camera.position.z / dir.z;
    const pos = camera.position.clone().add(dir.multiplyScalar(distance));
    
    return pos;
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    // Update mouse glow position to follow mouse
    if (mouseGlow) {
        const worldPos = screenToWorld(mouseX, mouseY);
        mouseGlow.position.x = worldPos.x;
        mouseGlow.position.y = worldPos.y;
        
        // Add subtle pulsing effect
        const pulse = Math.sin(Date.now() * 0.003) * 0.2 + 1;
        mouseGlow.scale.set(pulse, pulse, 1);
    }
    
    renderer.render(scene, camera);
}

// Handle mouse movement
document.addEventListener('mousemove', (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;
});

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// GSAP Animations (rest of your existing code remains the same)
function initAnimations() {
    // Hero section animation
    gsap.timeline()
        .from('.hero-title', { duration: 1, y: 100, opacity: 0, ease: 'power3.out' })
        .from('.hero-subtitle', { duration: 1, y: 50, opacity: 0, ease: 'power3.out' }, '-=0.5')
        .from('.hero-description', { duration: 1, y: 30, opacity: 0, ease: 'power3.out' }, '-=0.3')
        .from('.hero-buttons', { duration: 1, y: 30, opacity: 0, ease: 'power3.out' }, '-=0.2')
        .from('.profile-card', { duration: 1.5, scale: 0.8, opacity: 0, ease: 'back.out(1.7)' }, '-=1');
    
    // Skill bars animation
    const skillBars = document.querySelectorAll('.skill-progress');
    skillBars.forEach(bar => {
        const progress = bar.getAttribute('data-progress');
        gsap.to(bar, {
            width: progress + '%',
            duration: 2,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: bar,
                start: 'top 80%'
            }
        });
    });
    
    // Cards animation on scroll
    gsap.registerPlugin(ScrollTrigger);
    
    gsap.utils.toArray('.glass-card').forEach(card => {
        gsap.fromTo(card, 
            { y: 100, opacity: 0 },
            {
                y: 0,
                opacity: 1,
                duration: 1,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: card,
                    start: 'top 85%',
                    end: 'bottom 15%'
                }
            }
        );
    });
}

// Navigation functionality (rest of your existing code remains the same)
function initNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Toggle mobile menu
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
    
    // Close menu when clicking on links
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });
    
    // Smooth scrolling for navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 80; // Account for fixed navbar
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Navbar background on scroll
    window.addEventListener('scroll', () => {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 100) {
            navbar.style.background = 'rgba(15, 15, 26, 0.95)';
        } else {
            navbar.style.background = 'rgba(15, 15, 26, 0.8)';
        }
    });
}

// Contact form functionality (rest of your existing code remains the same)
function initContactForm() {
    const contactForm = document.querySelector('.contact-form');
    
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(contactForm);
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            subject: formData.get('subject'),
            message: formData.get('message')
        };
        
        // Simple validation
        if (!data.name || !data.email || !data.message) {
            alert('Please fill in all required fields.');
            return;
        }
        
        // Simulate form submission
        const submitButton = contactForm.querySelector('button[type="submit"]');
        const originalText = submitButton.innerHTML;
        
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        submitButton.disabled = true;
        
        setTimeout(() => {
            alert('Thank you for your message! I will get back to you soon.');
            contactForm.reset();
            submitButton.innerHTML = originalText;
            submitButton.disabled = false;
        }, 2000);
    });
}

// Cursor animation (rest of your existing code remains the same)
function initCursor() {
    const cursor = document.createElement('div');
    cursor.className = 'cursor';
    document.body.appendChild(cursor);
    
    // Add cursor styles
    const cursorStyle = document.createElement('style');
    cursorStyle.textContent = `
        .cursor {
            width: 20px;
            height: 20px;
            border: 2px solid #667eea;
            border-radius: 50%;
            position: fixed;
            pointer-events: none;
            z-index: 9999;
            mix-blend-mode: difference;
            transition: all 0.1s ease;
        }
        
        .cursor.hover {
            transform: scale(1.5);
            background: rgba(102, 126, 234, 0.2);
        }
    `;
    document.head.appendChild(cursorStyle);
    
    // Update cursor position
    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX - 10 + 'px';
        cursor.style.top = e.clientY - 10 + 'px';
    });
    
    // Cursor hover effects
    const hoverElements = document.querySelectorAll('a, button, .glass-card');
    hoverElements.forEach(el => {
        el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
        el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
    });
}

// Parallax effect for sections (rest of your existing code remains the same)
function initParallax() {
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const parallaxElements = document.querySelectorAll('.parallax');
        
        parallaxElements.forEach(el => {
            const speed = el.dataset.speed || 0.5;
            const yPos = -(scrolled * speed);
            el.style.transform = `translateY(${yPos}px)`;
        });
    });
}

// Loading animation (rest of your existing code remains the same)
function initLoader() {
    // Create loader
    const loader = document.createElement('div');
    loader.className = 'loader';
    loader.innerHTML = `
        <div class="loader-content">
            <div class="loader-spinner"></div>
            <p>Loading Portfolio...</p>
        </div>
    `;
    document.body.appendChild(loader);
    
    // Add loader styles
    const loaderStyle = document.createElement('style');
    loaderStyle.textContent = `
        .loader {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: var(--background-dark);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            opacity: 1;
            transition: opacity 0.5s ease;
        }
        
        .loader-content {
            text-align: center;
            color: var(--text-primary);
        }
        
        .loader-spinner {
            width: 50px;
            height: 50px;
            border: 3px solid rgba(102, 126, 234, 0.3);
            border-top: 3px solid #667eea;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 20px;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        .loader.fade-out {
            opacity: 0;
            pointer-events: none;
        }
    `;
    document.head.appendChild(loaderStyle);
    
    // Hide loader after everything is loaded
    window.addEventListener('load', () => {
        setTimeout(() => {
            loader.classList.add('fade-out');
            setTimeout(() => {
                loader.remove();
            }, 500);
        }, 1000);
    });
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initLoader();
    initThree();
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
});
