// Three.js WebGL Background with Orange Mouse Glow
let scene, camera, renderer, mouseGlow;
let mouseX = 0, mouseY = 0;

// Initialize Three.js
function initThree() {
    // Scene setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({
        canvas: document.getElementById('bg-canvas'),
        alpha: false,
        antialias: true
    });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    
    // Create mouse glow effect
    createMouseGlow();
    
    // Position camera
    camera.position.z = 50;
    
    // Animation loop
    animate();
}

// Create mouse glow effect
function createMouseGlow() {
    const glowGeometry = new THREE.PlaneGeometry(20, 20);
    
    // Create a radial gradient texture for the glow
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const context = canvas.getContext('2d');
    
    // Create radial gradient
    const gradient = context.createRadialGradient(128, 128, 0, 128, 128, 128);
    gradient.addColorStop(0, 'rgba(255, 140, 0, 0.3)');
    gradient.addColorStop(0.5, 'rgba(255, 140, 0, 0.1)');
    gradient.addColorStop(1, 'rgba(255, 140, 0, 0)');
    
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
    mouseGlow.position.z = -10;
    scene.add(mouseGlow);
}

// Convert screen coordinates to world coordinates
function screenToWorld(screenX, screenY) {
    const distance = Math.abs(camera.position.z - mouseGlow.position.z);
    const vFOV = camera.fov * Math.PI / 180;
    const height = 2 * Math.tan(vFOV / 2) * distance;
    const width = height * camera.aspect;
    
    const x = ((screenX / window.innerWidth) - 0.5) * width;
    const y = -((screenY / window.innerHeight) - 0.5) * height;
    
    return { x, y };
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    // Update mouse glow position
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

// GSAP Animations
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

// Navigation functionality
function initNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Toggle mobile menu
    if (hamburger) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }
    
    // Close menu when clicking on links
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (hamburger) hamburger.classList.remove('active');
            if (navMenu) navMenu.classList.remove('active');
        });
    });
    
    // Smooth scrolling for navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Navbar visibility and background on scroll
    window.addEventListener('scroll', () => {
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            if (window.scrollY > 100) {
                navbar.classList.add('scrolled');
                navbar.style.background = 'rgba(0, 0, 0, 0.95)';
            } else {
                navbar.classList.remove('scrolled');
                navbar.style.background = 'rgba(0, 0, 0, 0.8)';
            }
        }
    });
}

// Contact form functionality
function initContactForm() {
    const contactForm = document.querySelector('.contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const formData = new FormData(contactForm);
            const data = {
                name: formData.get('name'),
                email: formData.get('email'),
                subject: formData.get('subject'),
                message: formData.get('message')
            };
            
            if (!data.name || !data.email || !data.message) {
                alert('Please fill in all required fields.');
                return;
            }
            
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
}

// Cursor animation - Orange glow that follows mouse
function initCursor() {
    const cursor = document.createElement('div');
    cursor.className = 'cursor';
    document.body.appendChild(cursor);
    
    const cursorStyle = document.createElement('style');
    cursorStyle.textContent = `
        .cursor {
            width: 20px;
            height: 20px;
            border: 2px solid #ff8c00;
            border-radius: 50%;
            position: fixed;
            pointer-events: none;
            z-index: 9999;
            mix-blend-mode: difference;
            transition: all 0.1s ease;
            background: rgba(255, 140, 0, 0.2);
            box-shadow: 0 0 20px rgba(255, 140, 0, 0.5);
        }
        
        .cursor.hover {
            transform: scale(1.5);
            background: rgba(255, 140, 0, 0.4);
            box-shadow: 0 0 30px rgba(255, 140, 0, 0.8);
        }
    `;
    document.head.appendChild(cursorStyle);
    
    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX - 10 + 'px';
        cursor.style.top = e.clientY - 10 + 'px';
    });
    
    const hoverElements = document.querySelectorAll('a, button, .glass-card');
    hoverElements.forEach(el => {
        el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
        el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
    });
}

// Parallax effect for sections
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

// Loading animation
function initLoader() {
    const loader = document.createElement('div');
    loader.className = 'loader';
    loader.innerHTML = `
        <div class="loader-content">
            <div class="loader-spinner"></div>
            <p>WELCOME</p>
        </div>
    `;
    document.body.appendChild(loader);
    
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
            border: 3px solid rgba(255, 140, 0, 0.3);
            border-top: 3px solid #ff8c00;
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
    
    window.addEventListener('load', () => {
        setTimeout(() => {
            loader.classList.add('fade-out');
            setTimeout(() => {
                loader.remove();
            }, 500);
        }, 1000);
    });
}

// Check if Three.js is loaded
function checkThreeJS() {
    if (typeof THREE === 'undefined') {
        console.error('Three.js is not loaded! Please include Three.js library.');
        return false;
    }
    return true;
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing...');
    
    initLoader();
    
    // Check if Three.js is available before initializing WebGL
    if (checkThreeJS()) {
        console.log('Three.js found, initializing WebGL...');
        initThree();
    } else {
        console.warn('Three.js not found, skipping WebGL initialization');
    }
    
    // Initialize other components
    if (typeof gsap !== 'undefined') {
        initAnimations();
    } else {
        console.warn('GSAP not found, skipping animations');
    }
    
    initNavigation();
    initContactForm();
    initCursor();
    initParallax();
    
    // Add scroll-triggered animations for stats
    const statNumbers = document.querySelectorAll('.stat-number');
    if (statNumbers.length > 0 && typeof gsap !== 'undefined') {
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
    }
    
    // Additional interactive effects
    function addInteractiveEffects() {
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
    
    addInteractiveEffects();
});