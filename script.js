// -----------------------------------------------------------
// Enhanced Portfolio Script – WebGL disabled, 0.3‑inch glow
// -----------------------------------------------------------

let scene, camera, renderer, mouseGlow;
let mouseX = 0, mouseY = 0;
let floatingParticles = [];
let geometricShapes = [];
let clock;
let isMobile = false;
let deviceCapabilities = {};
let particleSystem = null;

// -----------------------------------------------------------
// Device detection and capability assessment (unchanged)
// -----------------------------------------------------------
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

// -----------------------------------------------------------
// Navigation scroll effect
// -----------------------------------------------------------
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }
});

// -----------------------------------------------------------
// Mobile menu toggle
// -----------------------------------------------------------
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });
}

// -----------------------------------------------------------
// Close mobile menu when link is clicked
// -----------------------------------------------------------
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        if (navMenu) {
            navMenu.classList.remove('active');
        }
    });
});

// -----------------------------------------------------------
// Smooth scrolling for navigation links
// -----------------------------------------------------------
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

// -----------------------------------------------------------
// Animate skill progress bars when in view
// -----------------------------------------------------------
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

// -----------------------------------------------------------
// Contact form handling
// -----------------------------------------------------------
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

// -----------------------------------------------------------
// Fallback for non‑WebGL browsers (used for every device now)
// -----------------------------------------------------------
function initFallbackBackground() {
    const canvas = document.getElementById('bg-canvas');
    if (canvas) {
        canvas.style.display = 'none';
    }

    const fallbackDiv = document.createElement('div');
    fallbackDiv.style.position = 'fixed';
    fallbackDiv.style.top = '0';
    fallbackDiv.style.left = '0';
    fallbackDiv.style.width = '100%';
    fallbackDiv.style.height = '100%';
    fallbackDiv.style.background = '#000000';
    fallbackDiv.style.zIndex = '-1';
    fallbackDiv.style.pointerEvents = 'none';
    document.body.appendChild(fallbackDiv);
}

// -----------------------------------------------------------
// Screen‑to‑world conversion (kept for completeness – not used)
// -----------------------------------------------------------
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

// -----------------------------------------------------------
// Enhanced mouse glow – now exactly 0.3 inches
// -----------------------------------------------------------
function createEnhancedMouseGlow() {
    try {
        // Skip on mobile – original behaviour
        if (deviceCapabilities.isMobile) {
            return null;
        }

        // ---------- 0.3 in → pixels (respecting device pixel‑ratio) ----------
        const DPI = 96;                    // CSS reference DPI
        const INCHES = 0.3;
        const glowSizePixels = Math.round(INCHES * DPI * window.devicePixelRatio); // ≈29 px for 1× screens

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

// -----------------------------------------------------------
// createEnhancedParticleSystem (kept – never called now)
// -----------------------------------------------------------
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

// -----------------------------------------------------------
// initThree – WebGL disabled, always use fallback background
// -----------------------------------------------------------
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

// -----------------------------------------------------------
// Window resize handler (safe – exits early if no camera/renderer)
// -----------------------------------------------------------
function onWindowResize() {
    if (!camera || !renderer) return;

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// -----------------------------------------------------------
// Animation loop (will simply not run because renderer is null)
// -----------------------------------------------------------
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

// -----------------------------------------------------------
// DOMContentLoaded – start everything
// -----------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    // Initialise background (WebGL disabled)
    initThree();

    // GSAP Animations (if GSAP is loaded)
    if (typeof gsap !== 'undefined' && gsap.registerPlugin) {
        gsap.registerPlugin(ScrollTrigger);

        // Hero section animation
        gsap.from('.merged-hero-card', {
            duration: 0.33,
            y: 100,
            opacity: 0,
            ease: 'power3.out'
        });

        // Section animations
        gsap.utils.toArray('.glass-card').forEach((card, index) => {
            gsap.from(card, {
                scrollTrigger: {
                    trigger: card,
                    start: 'top 80%',
                    end: 'bottom 20%',
                    toggleActions: 'play none none reverse'
                },
                duration: 0.27,
                y: 50,
                opacity: 0,
                delay: index * 0.033,
                ease: 'power2.out'
            });
        });
    }
});
