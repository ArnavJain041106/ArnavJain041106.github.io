// Enhanced Portfolio Script with Theme Toggle - No Navbar

let scene, camera, renderer, mouseGlow;
let mouseX = 0, mouseY = 0;
let floatingParticles = [];
let geometricShapes = [];
let clock;
let isMobile = false;
let deviceCapabilities = {};
let particleSystem = null;

// Theme management
let currentTheme = 'dark';

// Theme Toggle Functionality
function initThemeToggle() {
    // Get saved theme from localStorage or default to dark
    const savedTheme = localStorage.getItem('portfolio-theme') || 'dark';
    currentTheme = savedTheme;
    
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', currentTheme);
    
    // Create theme toggle button
    createThemeToggleButton();
    
    // Update fallback background
    updateFallbackBackground();
}

function createThemeToggleButton() {
    const themeToggle = document.createElement('button');
    themeToggle.className = 'theme-toggle';
    themeToggle.setAttribute('aria-label', 'Toggle theme');
    themeToggle.innerHTML = `
        <svg class="theme-icon sun" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="5"></circle>
            <line x1="12" y1="1" x2="12" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="23"></line>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
            <line x1="1" y1="12" x2="3" y2="12"></line>
            <line x1="21" y1="12" x2="23" y2="12"></line>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        </svg>
        <svg class="theme-icon moon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"></path>
        </svg>
    `;
    
    themeToggle.addEventListener('click', toggleTheme);
    document.body.appendChild(themeToggle);
}

function toggleTheme() {
    // Create transition overlay
    const transition = document.createElement('div');
    transition.className = 'theme-transition';
    document.body.appendChild(transition);
    
    // Trigger transition
    requestAnimationFrame(() => {
        transition.classList.add('active');
    });
    
    // Switch theme after short delay
    setTimeout(() => {
        currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', currentTheme);
        localStorage.setItem('portfolio-theme', currentTheme);
        updateFallbackBackground();
        
        // Remove transition overlay
        setTimeout(() => {
            transition.classList.remove('active');
            setTimeout(() => {
                document.body.removeChild(transition);
            }, 300);
        }, 150);
    }, 150);
}

function updateFallbackBackground() {
    const fallbackBackground = document.getElementById('fallback-background');
    if (fallbackBackground) {
        const bgColor = currentTheme === 'dark' ? '#000000' : '#f7f9fc';
        fallbackBackground.style.background = bgColor;
    }
}

// Device detection and capability assessment
function detectDevice() {
    const userAgent = navigator.userAgent;
    const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const isTablet = /iPad|Tablet|(android|bb\d+|meego).+mobile/i.test(userAgent);

    isMobile = isMobileDevice;

    deviceCapabilities = {
        isMobile: isMobileDevice,
        isTablet: isTablet,
        isLowEnd: isMobileDevice && (window.devicePixelRatio < 2 || navigator.hardwareConcurrency <= 4),
        supportsWebGL: (() => {
            try {
                const canvas = document.createElement('canvas');
                return !!(window.WebGLRenderingContext && canvas.getContext('webgl'));
            } catch (e) {
                return false;
            }
        })(),
        maxParticles: isMobileDevice ? (isTablet ? 50 : 25) : 100,
        maxShapes: isMobileDevice ? (isTablet ? 15 : 8) : 24,
        pixelRatio: Math.min(window.devicePixelRatio, isMobileDevice ? 1.5 : 2)
    };

    return deviceCapabilities;
}

// Mobile menu toggle (REMOVED - no navbar)

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Animate skill progress bars when in view
const observerOptions = {
    threshold: 0.5,
    rootMargin: '0px 0px -50px 0px'
};

const progressObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const progressBars = entry.target.querySelectorAll('.skill-progress');
            progressBars.forEach(bar => {
                const progress = bar.getAttribute('data-progress');
                bar.style.width = progress + '%';
            });
        }
    });
}, observerOptions);

const skillsSection = document.querySelector('.skills');
if (skillsSection) {
    progressObserver.observe(skillsSection);
}

// Contact form handling
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(contactForm);
        const data = Object.fromEntries(formData);

        // Simulate form submission
        try {
            console.log('Form submitted:', data);
            alert('Message sent successfully!');
            contactForm.reset();
        } catch (error) {
            console.error('Error sending message:', error);
            alert('Error sending message. Please try again.');
        }
    });
}

// Fallback for non-WebGL browsers (used for every device now)
function initFallbackBackground() {
    const canvas = document.getElementById('bg-canvas');
    if (canvas) {
        canvas.style.display = 'none';
    }

    // Create fallback background with theme support
    let fallbackDiv = document.getElementById('fallback-background');
    if (!fallbackDiv) {
        fallbackDiv = document.createElement('div');
        fallbackDiv.id = 'fallback-background';
        fallbackDiv.style.position = 'fixed';
        fallbackDiv.style.top = '0';
        fallbackDiv.style.left = '0';
        fallbackDiv.style.width = '100%';
        fallbackDiv.style.height = '100%';
        fallbackDiv.style.zIndex = '-1';
        fallbackDiv.style.pointerEvents = 'none';
        fallbackDiv.style.transition = 'background 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        document.body.appendChild(fallbackDiv);
    }
    
    updateFallbackBackground();
}

// Screen-to-world conversion (kept for completeness - not used)
function screenToWorld(screenX, screenY) {
    const vector = new THREE.Vector3();
    vector.set(
        (screenX / window.innerWidth) * 2 - 1,
        -(screenY / window.innerHeight) * 2 + 1,
        0.5
    );
    vector.unproject(camera);
    const dir = vector.sub(camera.position).normalize();
    const distance = -camera.position.z / dir.z;
    const pos = camera.position.clone().add(dir.multiplyScalar(distance));
    return pos;
}

// Enhanced mouse glow - now exactly 0.3 inches
function createEnhancedMouseGlow() {
    try {
        // Skip on mobile – original behaviour
        if (deviceCapabilities.isMobile) {
            return null;
        }

        // ---------- 0.3 in → pixels (respecting device pixel‑ratio) ----------
        const DPI = 96;                    // CSS reference DPI
        const INCHES = 0.3;
        const glowSizePixels = Math.round(INCHES * DPI * window.devicePixelRatio); // ≈29 px for 1× screens

        // Plane geometry uses world units; we feed the pixel size directly.
        const glowGeometry = new THREE.PlaneGeometry(glowSizePixels, glowSizePixels);

        // ---------- texture generation ----------
        const canvas = document.createElement('canvas');
        const size = 128;                  // texture resolution – unchanged
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            console.error('Could not get 2D context for mouse glow');
            return null;
        }

        const gradient = ctx.createRadialGradient(
            size / 2, size / 2, 0,
            size / 2, size / 2, size / 2
        );
        gradient.addColorStop(0,   'rgba(255,140,0,0.8)');
        gradient.addColorStop(0.3, 'rgba(255,100,0,0.5)');
        gradient.addColorStop(0.6, 'rgba(255,60,0,0.2)');
        gradient.addColorStop(1,   'rgba(255,140,0,0)');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, size, size);

        const texture = new THREE.CanvasTexture(canvas);
        texture.generateMipmaps = false;
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;

        const glowMaterial = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            opacity: 1.0
        });

        mouseGlow = new THREE.Mesh(glowGeometry, glowMaterial);
        mouseGlow.position.z = -5;
        scene.add(mouseGlow);

        // Initialise at screen centre
        const centre = screenToWorld(window.innerWidth / 2, window.innerHeight / 2);
        mouseGlow.position.set(centre.x, centre.y, -5);

        return mouseGlow;
    } catch (error) {
        console.error('Error creating mouse glow:', error);
        return null;
    }
}

// createEnhancedParticleSystem (kept - never called now)
function createEnhancedParticleSystem() {
    try {
        const particleCount = deviceCapabilities.maxParticles;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);

        const colorPalette = [
            new THREE.Color(0xff8c00),
            new THREE.Color(0xff6600),
            new THREE.Color(0xffaa00),
            new THREE.Color(0xff4400),
            new THREE.Color(0xffcc00)
        ];

        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            const angle = (i / particleCount) * Math.PI * 2;
            const radius = Math.random() * 100 + 20;
            const height = (Math.random() - 0.5) * 120;

            positions[i3] = Math.cos(angle) * radius + (Math.random() - 0.5) * 50;
            positions[i3 + 1] = height;
            positions[i3 + 2] = Math.sin(angle) * radius + (Math.random() - 0.5) * 60;

            const colorIndex = Math.floor(Math.random() * colorPalette.length);
            const baseColor = colorPalette[colorIndex];
            colors[i3] = baseColor.r;
            colors[i3 + 1] = baseColor.g;
            colors[i3 + 2] = baseColor.b;

            sizes[i] = Math.random() * (deviceCapabilities.isMobile ? 2 : 4) + 1;

            floatingParticles.push({
                originalPos: {
                    x: positions[i3],
                    y: positions[i3 + 1],
                    z: positions[i3 + 2]
                },
                velocity: {
                    x: (Math.random() - 0.5) * 0.01,
                    y: Math.random() * 0.005 + 0.002,
                    z: (Math.random() - 0.5) * 0.01
                },
                phase: Math.random() * Math.PI * 2,
                amplitude: Math.random() * 10 + 5
            });
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        const material = new THREE.PointsMaterial({
            size: 3,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true
        });

        particleSystem = new THREE.Points(geometry, material);
        scene.add(particleSystem);
    } catch (error) {
        console.error('Error creating particle system:', error);
    }
}

// initThree - WebGL disabled, always use fallback background
function initThree() {
    try {
        // Device detection (kept for UI tweaks)
        detectDevice();

        // ALWAYS use the static fallback background – no WebGL at all
        initFallbackBackground();

        // Hide the canvas element if it exists
        const canvas = document.getElementById('bg-canvas');
        if (canvas) canvas.style.display = 'none';

        // Reset all Three.js related globals so later code does not accidentally use them
        scene = null;
        camera = null;
        renderer = null;
        mouseGlow = null;
        particleSystem = null;
        floatingParticles = [];

        // No animation loop, no resize handler needed – everything is static now
    } catch (error) {
        console.error('Unexpected error while disabling WebGL:', error);
        initFallbackBackground();
    }
}

// Window resize handler (safe - exits early if no camera/renderer)
function onWindowResize() {
    if (!camera || !renderer) return;

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Animation loop (will simply not run because renderer is null)
function animate() {
    requestAnimationFrame(animate);

    if (!clock || !scene || !camera || !renderer) return;

    const elapsedTime = clock.getElapsedTime();

    // Mouse glow update (only when it exists)
    if (mouseGlow) {
        const targetPos = screenToWorld(mouseX, mouseY);
        mouseGlow.position.x += (targetPos.x - mouseGlow.position.x) * 0.1;
        mouseGlow.position.y += (targetPos.y - mouseGlow.position.y) * 0.1;
    }

    // Particle system update
    if (particleSystem && floatingParticles.length > 0) {
        const positions = particleSystem.geometry.attributes.position.array;

        for (let i = 0; i < floatingParticles.length; i++) {
            const particle = floatingParticles[i];
            const i3 = i * 3;

            particle.originalPos.x += particle.velocity.x;
            particle.originalPos.y += particle.velocity.y;
            particle.originalPos.z += particle.velocity.z;

            const wave = Math.sin(elapsedTime * 0.5 + particle.phase) * particle.amplitude;

            positions[i3] = particle.originalPos.x + wave * 0.1;
            positions[i3 + 1] = particle.originalPos.y + wave * 0.2;
            positions[i3 + 2] = particle.originalPos.z + wave * 0.1;

            if (positions[i3] > 150) particle.originalPos.x = -150;
            if (positions[i3] < -150) particle.originalPos.x = 150;
            if (positions[i3 + 1] > 100) particle.originalPos.y = -100;
            if (positions[i3 + 1] < -100) particle.originalPos.y = 100;
        }

        particleSystem.geometry.attributes.position.needsUpdate = true;
    }

    renderer.render(scene, camera);
}

// DOMContentLoaded - start everything with OPTIMIZED animations + THEME TOGGLE
document.addEventListener('DOMContentLoaded', () => {
    // Initialize theme toggle FIRST
    initThemeToggle();
    
    // Initialise background (WebGL disabled)
    initThree();

    // GSAP Animations (if GSAP is loaded) - OPTIMIZED VERSION
    if (typeof gsap !== 'undefined' && gsap.registerPlugin) {
        gsap.registerPlugin(ScrollTrigger);

        // Hero section animation (keep this - it's good)
        gsap.from('.merged-hero-card', {
            duration: 1,
            y: 100,
            opacity: 0,
            ease: 'power3.out'
        });

        // REMOVED: Heavy ScrollTrigger animations replaced with efficient Intersection Observer below
    }

    // OPTIMIZED: Efficient scroll animations with Intersection Observer
    const animateOnScrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.transform = 'translateY(0)';
                entry.target.style.opacity = '1';
            }
        });
    }, { 
        threshold: 0.1, 
        rootMargin: '50px' 
    });

    // Apply to all glass cards except hero card
    document.querySelectorAll('.glass-card:not(.merged-hero-card)').forEach(card => {
        // Set initial state
        card.style.transform = 'translateY(17px)';
        card.style.opacity = '0';
        card.style.transition = 'transform 0.6s ease, opacity 0.6s ease';
        
        // Observe for intersection
        animateOnScrollObserver.observe(card);
    });

    // Respect user's motion preferences
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        // Disable animations for users who prefer reduced motion
        document.querySelectorAll('.glass-card').forEach(card => {
            card.style.transform = 'none';
            card.style.opacity = '1';
            card.style.transition = 'none';
        });
    }

    // Initialize enhanced animations
    initEnhancedAnimations();
});

// Enhanced Animations and Interactive Features
function initEnhancedAnimations() {
    // Back to top button
    initBackToTopButton();
    
    // Scroll progress bar
    initScrollProgress();
    
    // Animated counters
    initAnimatedCounters();
    
    // Skill progress bars animation
    initSkillProgressBars();
    
    // Staggered skill items animation
    initStaggeredSkillAnimation();
    
    // Typing animation for hero text
    initTypingAnimation();
}

// Back to Top Button
function initBackToTopButton() {
    const backToTopBtn = document.getElementById('back-to-top');
    if (!backToTopBtn) return;

    // Show/hide button based on scroll position
    function toggleBackToTop() {
        if (window.pageYOffset > 300) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    }

    // Smooth scroll to top
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    window.addEventListener('scroll', toggleBackToTop);
}

// Scroll Progress Bar
function initScrollProgress() {
    const progressBar = document.getElementById('scroll-progress');
    if (!progressBar) return;

    function updateScrollProgress() {
        const scrollTop = window.pageYOffset;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = (scrollTop / docHeight) * 100;
        progressBar.style.width = scrollPercent + '%';
    }

    window.addEventListener('scroll', updateScrollProgress);
}

// Animated Counters
function initAnimatedCounters() {
    const counters = document.querySelectorAll('.stat-number');
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                counterObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => counterObserver.observe(counter));
}

function animateCounter(element) {
    const target = element.textContent;
    const isInfinity = target.includes('∞');
    
    if (isInfinity) {
        element.classList.add('animated');
        return;
    }

    const finalNumber = parseInt(target);
    let currentNumber = 0;
    const increment = finalNumber / 50;
    const duration = 2000; // 2 seconds
    const stepTime = duration / 50;

    element.classList.add('animated');

    const counter = setInterval(() => {
        currentNumber += increment;
        if (currentNumber >= finalNumber) {
            currentNumber = finalNumber;
            clearInterval(counter);
        }
        element.textContent = Math.floor(currentNumber) + '+';
    }, stepTime);
}

// Skill Progress Bars Animation
function initSkillProgressBars() {
    const skillBars = document.querySelectorAll('.skill-progress');
    const skillObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const progressBar = entry.target;
                const progress = progressBar.getAttribute('data-progress');
                progressBar.style.setProperty('--progress-width', progress + '%');
                progressBar.classList.add('animated');
                skillObserver.unobserve(progressBar);
            }
        });
    }, { threshold: 0.3 });

    skillBars.forEach(bar => skillObserver.observe(bar));
}

// Staggered Skill Items Animation
function initStaggeredSkillAnimation() {
    const skillItems = document.querySelectorAll('.skill-item');
    const skillItemObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('animated');
                }, index * 100); // Stagger by 100ms
                skillItemObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });

    skillItems.forEach(item => skillItemObserver.observe(item));
}

// Typing Animation for Hero Text
function initTypingAnimation() {
    const heroSubtitle = document.querySelector('.hero-subtitle');
    if (!heroSubtitle) return;

    const text = heroSubtitle.textContent;
    heroSubtitle.textContent = '';
    heroSubtitle.classList.add('typing-animation');

    let i = 0;
    function typeWriter() {
        if (i < text.length) {
            heroSubtitle.textContent += text.charAt(i);
            i++;
            setTimeout(typeWriter, 100);
        } else {
            // Remove typing cursor after completion
            setTimeout(() => {
                heroSubtitle.style.borderRight = 'none';
            }, 1000);
        }
    }

    // Start typing animation after a short delay
    setTimeout(typeWriter, 1500);
}
