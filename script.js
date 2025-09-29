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

// Enhanced WebGL Background with Three.js
function initThree() {
    try {
        detectDevice();
        
        // Get canvas element
        const canvas = document.getElementById('bg-canvas');
        if (!canvas) {
            console.warn('Canvas element not found, using fallback');
            initFallbackBackground();
            return;
        }

        // Check WebGL support
        if (!deviceCapabilities.supportsWebGL) {
            console.warn('WebGL not supported, using fallback');
            initFallbackBackground();
            return;
        }

        // Initialize Three.js scene
        scene = new THREE.Scene();
        scene.background = null; // Transparent background
        
        // Setup camera
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 50;
        
        // Create WebGL renderer
        renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            alpha: true,
            antialias: !isMobile, // Disable antialiasing on mobile for performance
            powerPreference: isMobile ? 'low-power' : 'high-performance'
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        
        // Initialize clock for animations
        clock = new THREE.Clock();
        
        // Create animated background elements
        createAnimatedBackground();
        createFloatingParticles();
        createMouseGlow();
        
        // Start animation loop
        animate();
        
        // Show canvas
        canvas.style.display = 'block';
        canvas.style.opacity = '1';
        
        // Setup resize handler
        window.addEventListener('resize', onWindowResize);
        
        // Setup mouse tracking
        setupMouseTracking();
        
        console.log('WebGL background initialized successfully');
        
    } catch (error) {
        console.error('Error initializing WebGL:', error);
        initFallbackBackground();
    }
}

// Create animated background with geometric shapes and gradients
function createAnimatedBackground() {
    // Create floating geometric shapes
    const shapes = [];
    const shapeCount = isMobile ? 8 : 15;
    
    for (let i = 0; i < shapeCount; i++) {
        // Create different geometric shapes
        let geometry;
        const shapeType = Math.random();
        
        if (shapeType < 0.33) {
            geometry = new THREE.RingGeometry(1, 2, 6);
        } else if (shapeType < 0.66) {
            geometry = new THREE.CircleGeometry(1.5, 8);
        } else {
            geometry = new THREE.PlaneGeometry(2, 2);
        }
        
        const material = new THREE.MeshBasicMaterial({
            color: new THREE.Color().setHSL(0.1 + Math.random() * 0.1, 0.5, 0.5),
            transparent: true,
            opacity: 0.1,
            wireframe: Math.random() > 0.5
        });
        
        const shape = new THREE.Mesh(geometry, material);
        
        // Random positioning
        shape.position.x = (Math.random() - 0.5) * 100;
        shape.position.y = (Math.random() - 0.5) * 100;
        shape.position.z = (Math.random() - 0.5) * 50;
        
        // Random rotation
        shape.rotation.x = Math.random() * Math.PI;
        shape.rotation.y = Math.random() * Math.PI;
        shape.rotation.z = Math.random() * Math.PI;
        
        // Store animation properties
        shape.userData = {
            rotationSpeed: (Math.random() - 0.5) * 0.01,
            floatSpeed: (Math.random() - 0.5) * 0.02,
            originalY: shape.position.y
        };
        
        shapes.push(shape);
        scene.add(shape);
    }
    
    geometricShapes = shapes;
}

// Create floating particle system
function createFloatingParticles() {
    const particleCount = isMobile ? 50 : 100;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    
    const color = new THREE.Color();
    
    for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        
        // Positions
        positions[i3] = (Math.random() - 0.5) * 200;
        positions[i3 + 1] = (Math.random() - 0.5) * 200;
        positions[i3 + 2] = (Math.random() - 0.5) * 100;
        
        // Colors - orange/amber theme
        color.setHSL(0.1 + Math.random() * 0.1, 0.8, 0.6);
        colors[i3] = color.r;
        colors[i3 + 1] = color.g;
        colors[i3 + 2] = color.b;
        
        // Sizes
        sizes[i] = Math.random() * 2 + 1;
        
        // Store particle data for animation
        floatingParticles.push({
            velocity: {
                x: (Math.random() - 0.5) * 0.02,
                y: (Math.random() - 0.5) * 0.02,
                z: (Math.random() - 0.5) * 0.02
            },
            originalPos: {
                x: positions[i3],
                y: positions[i3 + 1],
                z: positions[i3 + 2]
            },
            phase: Math.random() * Math.PI * 2,
            amplitude: Math.random() * 0.5 + 0.2
        });
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    const material = new THREE.PointsMaterial({
        size: 2,
        sizeAttenuation: true,
        vertexColors: true,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
    });
    
    particleSystem = new THREE.Points(geometry, material);
    scene.add(particleSystem);
}

// Create mouse-following glow effect
function createMouseGlow() {
    const geometry = new THREE.CircleGeometry(8, 32);
    const material = new THREE.MeshBasicMaterial({
        color: 0xff6b35,
        transparent: true,
        opacity: 0.3,
        blending: THREE.AdditiveBlending
    });
    
    mouseGlow = new THREE.Mesh(geometry, material);
    mouseGlow.position.z = 5;
    scene.add(mouseGlow);
}

// Setup mouse tracking for interactive effects
function setupMouseTracking() {
    let mouseTargetX = 0;
    let mouseTargetY = 0;
    
    document.addEventListener('mousemove', (event) => {
        mouseX = event.clientX;
        mouseY = event.clientY;
        
        // Convert to normalized device coordinates
        mouseTargetX = (event.clientX / window.innerWidth) * 2 - 1;
        mouseTargetY = -(event.clientY / window.innerHeight) * 2 + 1;
        
        // Update mouse glow position with smooth interpolation
        if (mouseGlow) {
            const targetPos = screenToWorld(mouseX, mouseY);
            mouseGlow.userData.targetX = targetPos.x;
            mouseGlow.userData.targetY = targetPos.y;
        }
    });
}

// Window resize handler (safe - exits early if no camera/renderer)
function onWindowResize() {
    if (!camera || !renderer) return;

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Enhanced animation loop for WebGL background
function animate() {
    requestAnimationFrame(animate);

    if (!clock || !scene || !camera || !renderer) return;

    const elapsedTime = clock.getElapsedTime();

    // Animate geometric shapes
    if (geometricShapes && geometricShapes.length > 0) {
        geometricShapes.forEach(shape => {
            if (shape.userData) {
                // Rotation animation
                shape.rotation.x += shape.userData.rotationSpeed;
                shape.rotation.y += shape.userData.rotationSpeed * 0.7;
                shape.rotation.z += shape.userData.rotationSpeed * 0.5;
                
                // Floating animation
                shape.position.y = shape.userData.originalY + Math.sin(elapsedTime * 0.5 + shape.position.x * 0.01) * 5;
                
                // Subtle pulsing opacity
                shape.material.opacity = 0.05 + Math.sin(elapsedTime * 0.3 + shape.position.x * 0.02) * 0.05;
            }
        });
    }

    // Mouse glow smooth following
    if (mouseGlow && mouseGlow.userData) {
        if (mouseGlow.userData.targetX !== undefined) {
            mouseGlow.position.x += (mouseGlow.userData.targetX - mouseGlow.position.x) * 0.1;
            mouseGlow.position.y += (mouseGlow.userData.targetY - mouseGlow.position.y) * 0.1;
        }
        
        // Subtle pulsing effect
        const pulseScale = 1 + Math.sin(elapsedTime * 2) * 0.1;
        mouseGlow.scale.set(pulseScale, pulseScale, 1);
    }

    // Enhanced particle system animation
    if (particleSystem && floatingParticles.length > 0) {
        const positions = particleSystem.geometry.attributes.position.array;

        for (let i = 0; i < floatingParticles.length; i++) {
            const particle = floatingParticles[i];
            const i3 = i * 3;

            // Update base position
            particle.originalPos.x += particle.velocity.x;
            particle.originalPos.y += particle.velocity.y;
            particle.originalPos.z += particle.velocity.z;

            // Add wave motion for organic movement
            const wave = Math.sin(elapsedTime * 0.5 + particle.phase) * particle.amplitude;
            const waveY = Math.cos(elapsedTime * 0.3 + particle.phase) * particle.amplitude * 0.5;

            positions[i3] = particle.originalPos.x + wave * 2;
            positions[i3 + 1] = particle.originalPos.y + waveY * 3;
            positions[i3 + 2] = particle.originalPos.z + wave * 1;

            // Boundary wrapping for continuous animation
            if (positions[i3] > 100) particle.originalPos.x = -100;
            if (positions[i3] < -100) particle.originalPos.x = 100;
            if (positions[i3 + 1] > 100) particle.originalPos.y = -100;
            if (positions[i3 + 1] < -100) particle.originalPos.y = 100;
            if (positions[i3 + 2] > 50) particle.originalPos.z = -50;
            if (positions[i3 + 2] < -50) particle.originalPos.z = 50;
        }

        particleSystem.geometry.attributes.position.needsUpdate = true;
    }

    // Gentle camera movement for depth
    camera.position.x = Math.sin(elapsedTime * 0.1) * 2;
    camera.position.y = Math.cos(elapsedTime * 0.15) * 1;
    camera.lookAt(0, 0, 0);

    // Render the scene
    renderer.render(scene, camera);
}

// DOMContentLoaded - start everything with OPTIMIZED animations + THEME TOGGLE
document.addEventListener('DOMContentLoaded', () => {
    // Initialize theme toggle FIRST
    initThemeToggle();
    
    // Initialise background (WebGL disabled)
    initThree();

    // Enhanced GSAP Animations with ScrollTrigger
    if (typeof gsap !== 'undefined' && gsap.registerPlugin) {
        gsap.registerPlugin(ScrollTrigger);
        
        // Add class to indicate GSAP is loaded
        document.body.classList.add('gsap-loaded');

        // Enhanced hero section entrance animation
        const heroTl = gsap.timeline();
        
        // Animate hero card with more sophistication
        heroTl.from('.merged-hero-card', {
            duration: 1.2,
            y: 100,
            opacity: 0,
            scale: 0.95,
            ease: 'power3.out'
        })
        .from('.hero-title span', {
            duration: 0.8,
            y: 50,
            opacity: 0,
            stagger: 0.2,
            ease: 'power2.out'
        }, '-=0.8')
        .from('.hero-subtitle', {
            duration: 0.6,
            y: 30,
            opacity: 0,
            ease: 'power2.out'
        }, '-=0.4')
        .from('.hero-description', {
            duration: 0.6,
            y: 30,
            opacity: 0,
            ease: 'power2.out'
        }, '-=0.3')
        .from('.hero-buttons .btn', {
            duration: 0.5,
            y: 20,
            opacity: 0,
            stagger: 0.1,
            ease: 'back.out(1.7)'
        }, '-=0.2')
        .from('.merged-hero-image', {
            duration: 1,
            scale: 0.8,
            opacity: 0,
            rotation: 5,
            ease: 'power3.out'
        }, '-=1');

        // Section animations with ScrollTrigger
        gsap.utils.toArray('.glass-card:not(.merged-hero-card)').forEach((card, index) => {
            gsap.from(card, {
                scrollTrigger: {
                    trigger: card,
                    start: 'top 80%',
                    end: 'bottom 20%',
                    toggleActions: 'play none none reverse'
                },
                duration: 0.8,
                y: 60,
                opacity: 0,
                scale: 0.95,
                ease: 'power3.out',
                delay: index * 0.1
            });
        });

        // Skill items staggered animation
        gsap.from('.skill-item', {
            scrollTrigger: {
                trigger: '.skills',
                start: 'top 70%',
                toggleActions: 'play none none reverse'
            },
            duration: 0.6,
            y: 40,
            opacity: 0,
            stagger: 0.1,
            ease: 'power2.out'
        });

        // Stats counter animation with enhanced effects
        gsap.from('.stat-item', {
            scrollTrigger: {
                trigger: '.stats',
                start: 'top 70%',
                toggleActions: 'play none none reverse'
            },
            duration: 0.8,
            scale: 0.8,
            opacity: 0,
            stagger: 0.2,
            ease: 'back.out(1.7)'
        });

        // What I do cards animation
        gsap.from('.service-item', {
            scrollTrigger: {
                trigger: '.services',
                start: 'top 70%',
                toggleActions: 'play none none reverse'
            },
            duration: 0.7,
            y: 50,
            opacity: 0,
            stagger: 0.15,
            ease: 'power3.out'
        });

        // Enhanced hover animations for buttons
        document.querySelectorAll('.btn').forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                gsap.to(btn, {
                    duration: 0.3,
                    scale: 1.05,
                    y: -2,
                    ease: 'power2.out'
                });
            });
            
            btn.addEventListener('mouseleave', () => {
                gsap.to(btn, {
                    duration: 0.3,
                    scale: 1,
                    y: 0,
                    ease: 'power2.out'
                });
            });
        });

        // Enhanced hover animations for cards
        document.querySelectorAll('.glass-card').forEach(card => {
            card.addEventListener('mouseenter', () => {
                gsap.to(card, {
                    duration: 0.4,
                    y: -8,
                    scale: 1.02,
                    ease: 'power2.out'
                });
            });
            
            card.addEventListener('mouseleave', () => {
                gsap.to(card, {
                    duration: 0.4,
                    y: 0,
                    scale: 1,
                    ease: 'power2.out'
                });
            });
        });

        // Scroll-based text animations
        gsap.utils.toArray('h2, h3').forEach(heading => {
            gsap.from(heading, {
                scrollTrigger: {
                    trigger: heading,
                    start: 'top 85%',
                    toggleActions: 'play none none reverse'
                },
                duration: 0.8,
                y: 30,
                opacity: 0,
                ease: 'power2.out'
            });
        });
        
        // Page load complete animation
        gsap.to('.loading-overlay', {
            duration: 1,
            y: '-100%',
            ease: 'power3.inOut',
            delay: 1,
            onComplete: () => {
                document.querySelector('.loading-overlay').style.display = 'none';
                document.body.classList.remove('loading');
            }
        });
    }

    // Fallback for non-GSAP browsers or if GSAP fails
    if (typeof gsap === 'undefined') {
        // Simple CSS-based animations as fallback
        document.querySelectorAll('.glass-card:not(.merged-hero-card)').forEach((card, index) => {
            card.style.animation = `fadeInUp 0.8s ease forwards ${index * 0.1}s`;
        });
    }

    // Respect user's motion preferences
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        // Disable all animations for users who prefer reduced motion
        if (typeof gsap !== 'undefined') {
            gsap.globalTimeline.clear();
            ScrollTrigger.getAll().forEach(trigger => trigger.kill());
        }
        document.querySelectorAll('.glass-card, .btn').forEach(element => {
            element.style.transform = 'none';
            element.style.opacity = '1';
            element.style.transition = 'none';
            element.style.animation = 'none';
        });
    }

    // Initialize enhanced animations
    initEnhancedAnimations();
});

// Enhanced Animations and Interactive Features
function initEnhancedAnimations() {
    // Initialize loading animation
    initLoadingAnimation();

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
    
    // Parallax effects
    initParallaxEffects();
}

// Loading Animation with Progress Counter
function initLoadingAnimation() {
    const loadingOverlay = document.getElementById('loading-overlay');
    const loadingProgress = document.getElementById('loading-progress');
    
    if (!loadingOverlay || !loadingProgress) return;
    
    // Check if this is the first visit to the website
    const hasVisitedBefore = sessionStorage.getItem('portfolio-visited');
    
    if (hasVisitedBefore) {
        // Skip loading animation on subsequent visits
        loadingOverlay.style.display = 'none';
        document.body.classList.remove('loading');
        return;
    }
    
    // Mark as visited for subsequent page loads in this session
    sessionStorage.setItem('portfolio-visited', 'true');
    
    // Add loading class to body to prevent scrolling
    document.body.classList.add('loading');
    
    let progress = 0;
    const duration = 1700; // 1.7 seconds (reduced from 3.5s)
    const interval = 50; // Update every 50ms
    const increment = 100 / (duration / interval);
    
    const progressTimer = setInterval(() => {
        progress += increment;
        
        if (progress >= 100) {
            progress = 100;
            clearInterval(progressTimer);
            
            // Update final progress
            loadingProgress.textContent = `[${progress.toString().padStart(2, '0')}]`;
            
            // Start slide-up animation after a brief pause
            setTimeout(() => {
                loadingOverlay.classList.add('slide-up');
                document.body.classList.remove('loading');
                
                // Remove the overlay after animation completes
                setTimeout(() => {
                    loadingOverlay.remove();
                }, 1000);
            }, 200);
        } else {
            // Update progress display
            const displayProgress = Math.floor(progress);
            loadingProgress.textContent = `[${displayProgress.toString().padStart(2, '0')}]`;
        }
    }, interval);
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

// Enhanced Word-by-Word Animation - Inspired by React BlurText component
function initTypingAnimation() {
    const heroSubtitle = document.querySelector('.hero-subtitle');
    if (!heroSubtitle) return;

    // Configuration inspired by BlurText component
    const config = {
        delay: 150, // Reduced delay for smoother flow like the React component
        direction: 'top', // Following their direction concept
        threshold: 0.1,
        stepDuration: 0.35,
        onAnimationComplete: () => console.log('Hero subtitle animation completed!')
    };

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Get the original text and split into words
    const originalText = heroSubtitle.textContent.trim();
    const words = originalText.split(' ');
    
    // Clear the original text and prepare container
    heroSubtitle.innerHTML = '';
    heroSubtitle.style.opacity = '1';
    heroSubtitle.style.display = 'flex';
    heroSubtitle.style.flexWrap = 'wrap';
    
    // Create spans for each word with improved structure
    const wordElements = [];
    words.forEach((word, index) => {
        const wordSpan = document.createElement('span');
        wordSpan.textContent = word;
        wordSpan.classList.add('word-animation');
        wordSpan.style.willChange = 'transform, filter, opacity';
        
        // Add space handling like in React component
        heroSubtitle.appendChild(wordSpan);
        if (index < words.length - 1) {
            const space = document.createElement('span');
            space.textContent = '\u00A0'; // Non-breaking space like in React component
            space.style.display = 'inline-block';
            heroSubtitle.appendChild(space);
        }
        
        wordElements.push(wordSpan);
    });

    // Intersection Observer inspired animation trigger (simplified for hero section)
    const triggerAnimation = () => {
        if (prefersReducedMotion) {
            // Respect reduced motion immediately
            wordElements.forEach((wordElement) => {
                wordElement.style.opacity = '1';
                wordElement.style.filter = 'blur(0px)';
                wordElement.style.transform = 'translateY(0) scale(1)';
            });
            config.onAnimationComplete();
        } else {
            // Enhanced staggered animation with completion tracking
            let completedAnimations = 0;
            
            wordElements.forEach((wordElement, index) => {
                setTimeout(() => {
                    wordElement.style.animationDelay = '0s';
                    wordElement.classList.add('animate-word');
                    
                    // Track animation completion
                    wordElement.addEventListener('animationend', () => {
                        completedAnimations++;
                        if (completedAnimations === wordElements.length) {
                            config.onAnimationComplete();
                        }
                    }, { once: true });
                    
                }, index * config.delay);
            });
        }
    };

    // Start animation after loading is complete (maintaining original timing)
    setTimeout(triggerAnimation, 2500);
}

// Parallax Effects
function initParallaxEffects() {
    let ticking = false;

    function updateParallax() {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;
        
        // Apply parallax to hero section
        const heroSection = document.querySelector('.hero');
        if (heroSection) {
            heroSection.style.transform = `translateY(${rate}px)`;
        }
        
        // Apply subtle parallax to profile image
        const profileImg = document.querySelector('.profile-img');
        if (profileImg) {
            profileImg.style.transform = `translateY(${scrolled * 0.1}px)`;
        }

        ticking = false;
    }

    function requestTick() {
        if (!ticking) {
            requestAnimationFrame(updateParallax);
            ticking = true;
        }
    }

    // Only enable parallax on larger screens and if motion is not reduced
    if (window.innerWidth > 768 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        window.addEventListener('scroll', requestTick);
    }
}
