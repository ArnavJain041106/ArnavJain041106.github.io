// Three.js WebGL Background with Orange Mouse Glow and Floating Graphics
let scene, camera, renderer, mouseGlow;
let mouseX = 0, mouseY = 0;
let floatingParticles = [];
let geometricShapes = [];
let clock;

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
    
    // Initialize clock for animations
    clock = new THREE.Clock();
    
    // Create effects
    createMouseGlow();
    createFloatingParticles();
    createGeometricShapes();
    createFloatingOrbs();
    
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

// Create floating particles
function createFloatingParticles() {
    const particleCount = 50;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    
    // Orange color variations
    const orangeColors = [
        new THREE.Color(0xff8c00), // Main orange
        new THREE.Color(0xff6600), // Red orange
        new THREE.Color(0xffaa00), // Yellow orange
        new THREE.Color(0xff4400), // Deep orange
        new THREE.Color(0xffcc00)  // Light orange
    ];
    
    for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        
        // Random positions
        positions[i3] = (Math.random() - 0.5) * 200;
        positions[i3 + 1] = (Math.random() - 0.5) * 200;
        positions[i3 + 2] = (Math.random() - 0.5) * 100;
        
        // Random orange colors
        const color = orangeColors[Math.floor(Math.random() * orangeColors.length)];
        colors[i3] = color.r;
        colors[i3 + 1] = color.g;
        colors[i3 + 2] = color.b;
        
        // Random sizes
        sizes[i] = Math.random() * 3 + 1;
        
        // Store additional properties for animation
        floatingParticles.push({
            originalY: positions[i3 + 1],
            speed: Math.random() * 0.02 + 0.005,
            amplitude: Math.random() * 20 + 10,
            phase: Math.random() * Math.PI * 2
        });
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    const material = new THREE.ShaderMaterial({
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        vertexColors: true,
        uniforms: {
            time: { value: 0 }
        },
        vertexShader: `
            attribute float size;
            varying vec3 vColor;
            uniform float time;
            
            void main() {
                vColor = color;
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                gl_PointSize = size * (300.0 / -mvPosition.z);
                gl_Position = projectionMatrix * mvPosition;
            }
        `,
        fragmentShader: `
            varying vec3 vColor;
            
            void main() {
                float distanceToCenter = distance(gl_PointCoord, vec2(0.5));
                float alpha = 1.0 - smoothstep(0.0, 0.5, distanceToCenter);
                alpha *= 0.7;
                gl_FragColor = vec4(vColor, alpha);
            }
        `
    });
    
    const particles = new THREE.Points(geometry, material);
    scene.add(particles);
    
    // Store reference for animation
    particles.userData = { type: 'particles', geometry: geometry, material: material };
}

// Create geometric shapes
function createGeometricShapes() {
    const shapeTypes = [
        { geometry: new THREE.TetrahedronGeometry(2), count: 8 },
        { geometry: new THREE.OctahedronGeometry(1.5), count: 6 },
        { geometry: new THREE.IcosahedronGeometry(1), count: 10 }
    ];
    
    shapeTypes.forEach(shapeType => {
        for (let i = 0; i < shapeType.count; i++) {
            const material = new THREE.MeshBasicMaterial({
                color: new THREE.Color().setHSL(0.08 + Math.random() * 0.05, 0.8, 0.5), // Orange variations
                transparent: true,
                opacity: 0.3,
                wireframe: true
            });
            
            const mesh = new THREE.Mesh(shapeType.geometry, material);
            
            // Random position
            mesh.position.set(
                (Math.random() - 0.5) * 150,
                (Math.random() - 0.5) * 150,
                (Math.random() - 0.5) * 80
            );
            
            // Random rotation
            mesh.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );
            
            scene.add(mesh);
            
            // Store for animation
            geometricShapes.push({
                mesh: mesh,
                rotationSpeed: {
                    x: (Math.random() - 0.5) * 0.02,
                    y: (Math.random() - 0.5) * 0.02,
                    z: (Math.random() - 0.5) * 0.02
                },
                floatSpeed: Math.random() * 0.01 + 0.005,
                floatAmplitude: Math.random() * 5 + 2,
                originalY: mesh.position.y,
                phase: Math.random() * Math.PI * 2
            });
        }
    });
}

// Create floating orbs
function createFloatingOrbs() {
    const orbCount = 12;
    
    for (let i = 0; i < orbCount; i++) {
        const geometry = new THREE.SphereGeometry(
            Math.random() * 2 + 0.5, // Random size
            16, 
            16
        );
        
        const material = new THREE.MeshBasicMaterial({
            color: new THREE.Color().setHSL(0.08, 0.9, 0.4 + Math.random() * 0.3),
            transparent: true,
            opacity: 0.15,
            blending: THREE.AdditiveBlending
        });
        
        const orb = new THREE.Mesh(geometry, material);
        
        // Random position
        orb.position.set(
            (Math.random() - 0.5) * 180,
            (Math.random() - 0.5) * 180,
            (Math.random() - 0.5) * 60
        );
        
        scene.add(orb);
        
        // Store for animation
        geometricShapes.push({
            mesh: orb,
            rotationSpeed: {
                x: 0,
                y: (Math.random() - 0.5) * 0.01,
                z: 0
            },
            floatSpeed: Math.random() * 0.008 + 0.003,
            floatAmplitude: Math.random() * 15 + 5,
            originalY: orb.position.y,
            phase: Math.random() * Math.PI * 2,
            pulseSpeed: Math.random() * 0.02 + 0.01
        });
    }
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
    
    const elapsedTime = clock.getElapsedTime();
    
    // Update mouse glow position
    if (mouseGlow) {
        const worldPos = screenToWorld(mouseX, mouseY);
        mouseGlow.position.x = worldPos.x;
        mouseGlow.position.y = worldPos.y;
        
        // Add subtle pulsing effect
        const pulse = Math.sin(elapsedTime * 3) * 0.2 + 1;
        mouseGlow.scale.set(pulse, pulse, 1);
    }
    
    // Animate floating particles
    const particlesObject = scene.children.find(child => child.userData.type === 'particles');
    if (particlesObject) {
        const positions = particlesObject.geometry.attributes.position.array;
        
        for (let i = 0; i < floatingParticles.length; i++) {
            const particle = floatingParticles[i];
            const i3 = i * 3;
            
            // Floating animation
            positions[i3 + 1] = particle.originalY + Math.sin(elapsedTime * particle.speed + particle.phase) * particle.amplitude;
            
            // Gentle horizontal drift
            positions[i3] += Math.sin(elapsedTime * particle.speed * 0.5) * 0.1;
        }
        
        particlesObject.geometry.attributes.position.needsUpdate = true;
        particlesObject.material.uniforms.time.value = elapsedTime;
    }
    
    // Animate geometric shapes and orbs
    geometricShapes.forEach(shape => {
        const mesh = shape.mesh;
        
        // Rotation
        mesh.rotation.x += shape.rotationSpeed.x;
        mesh.rotation.y += shape.rotationSpeed.y;
        mesh.rotation.z += shape.rotationSpeed.z;
        
        // Floating
        mesh.position.y = shape.originalY + Math.sin(elapsedTime * shape.floatSpeed + shape.phase) * shape.floatAmplitude;
        
        // Pulse effect for orbs
        if (shape.pulseSpeed) {
            const scale = 1 + Math.sin(elapsedTime * shape.pulseSpeed) * 0.2;
            mesh.scale.set(scale, scale, scale);
            
            // Opacity pulsing
            mesh.material.opacity = 0.15 + Math.sin(elapsedTime * shape.pulseSpeed * 0.7) * 0.1;
        }
        
        // Mouse interaction - shapes move slightly away from mouse
        if (mouseGlow) {
            const distance = mesh.position.distanceTo(mouseGlow.position);
            if (distance < 30) {
                const repelForce = (30 - distance) / 30;
                const direction = new THREE.Vector3().subVectors(mesh.position, mouseGlow.position).normalize();
                mesh.position.add(direction.multiplyScalar(repelForce * 0.5));
            }
        }
    });
    
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

// Cursor animation removed - no longer creating custom cursor

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
