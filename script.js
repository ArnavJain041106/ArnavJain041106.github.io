// Enhanced WebGL Effects with Three.js
let scene, camera, renderer, mouseGlow;
let particles = [];
let geometricShapes = [];
let mouseX = 0, mouseY = 0;
let clock = new THREE.Clock();

// Initialize Three.js with enhanced WebGL features
function initThree() {
    // Scene setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    
    // Camera with better positioning
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 50;
    
    // Enhanced WebGL renderer
    renderer = new THREE.WebGLRenderer({
        canvas: document.getElementById('bg-canvas'),
        alpha: false,
        antialias: true,
        powerPreference: "high-performance"
    });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    // Enable shadow mapping for better lighting effects
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // Add lighting for better WebGL effects
    addLighting();
    
    // Create various WebGL effects
    createMouseGlow();
    createFloatingParticles();
    createGeometricShapes();
    createShaderMaterials();
    
    // Start animation loop
    animate();
}

// Add sophisticated lighting
function addLighting() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 0.2);
    scene.add(ambientLight);
    
    // Point light following mouse
    const pointLight = new THREE.PointLight(0xff8c00, 1, 100);
    pointLight.position.set(0, 0, 10);
    pointLight.castShadow = true;
    scene.add(pointLight);
    
    // Directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
}

// Enhanced mouse glow with better WebGL effects
function createMouseGlow() {
    const glowGeometry = new THREE.PlaneGeometry(25, 25);
    
    // Create custom shader material for better glow effect
    const glowMaterial = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0.0 },
            opacity: { value: 0.3 }
        },
        vertexShader: `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform float time;
            uniform float opacity;
            varying vec2 vUv;
            
            void main() {
                vec2 center = vec2(0.5, 0.5);
                float dist = distance(vUv, center);
                
                // Animated pulsing effect
                float pulse = sin(time * 3.0) * 0.1 + 0.9;
                
                // Radial gradient with animation
                float alpha = (1.0 - smoothstep(0.0, 0.5, dist)) * opacity * pulse;
                
                // Orange color with dynamic intensity
                vec3 color = vec3(1.0, 0.55, 0.0) * (2.0 - dist);
                
                gl_FragColor = vec4(color, alpha);
            }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending
    });
    
    mouseGlow = new THREE.Mesh(glowGeometry, glowMaterial);
    mouseGlow.position.z = -10;
    scene.add(mouseGlow);
}

// Floating particles with WebGL instancing for performance
function createFloatingParticles() {
    const particleCount = 100;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    
    for (let i = 0; i < particleCount; i++) {
        // Random positions
        positions[i * 3] = (Math.random() - 0.5) * 200;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 200;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 100;
        
        // Orange color variations
        colors[i * 3] = 1.0; // R
        colors[i * 3 + 1] = Math.random() * 0.5 + 0.5; // G
        colors[i * 3 + 2] = Math.random() * 0.2; // B
        
        // Random sizes
        sizes[i] = Math.random() * 3 + 1;
    }
    
    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    const particleMaterial = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0.0 }
        },
        vertexShader: `
            attribute float size;
            attribute vec3 color;
            varying vec3 vColor;
            uniform float time;
            
            void main() {
                vColor = color;
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                
                // Floating animation
                mvPosition.y += sin(time * 2.0 + position.x * 0.01) * 10.0;
                mvPosition.x += cos(time * 1.5 + position.z * 0.01) * 5.0;
                
                gl_PointSize = size * (300.0 / -mvPosition.z);
                gl_Position = projectionMatrix * mvPosition;
            }
        `,
        fragmentShader: `
            varying vec3 vColor;
            
            void main() {
                float dist = length(gl_PointCoord - vec2(0.5, 0.5));
                if (dist > 0.5) discard;
                
                float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
                gl_FragColor = vec4(vColor, alpha * 0.8);
            }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending
    });
    
    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particleSystem);
    particles.push(particleSystem);
}

// 3D geometric shapes with advanced materials
function createGeometricShapes() {
    const shapes = [
        new THREE.BoxGeometry(2, 2, 2),
        new THREE.SphereGeometry(1.5, 16, 16),
        new THREE.ConeGeometry(1, 2, 8),
        new THREE.TorusGeometry(1, 0.4, 8, 16)
    ];
    
    shapes.forEach((geometry, index) => {
        // Custom material with WebGL shaders
        const material = new THREE.MeshPhongMaterial({
            color: new THREE.Color().setHSL(0.1 + index * 0.1, 0.8, 0.5),
            shininess: 100,
            transparent: true,
            opacity: 0.7
        });
        
        const mesh = new THREE.Mesh(geometry, material);
        
        // Random positioning
        mesh.position.set(
            (Math.random() - 0.5) * 100,
            (Math.random() - 0.5) * 100,
            (Math.random() - 0.5) * 50
        );
        
        // Random rotation
        mesh.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
        );
        
        scene.add(mesh);
        geometricShapes.push(mesh);
    });
}

// Advanced shader materials for special effects
function createShaderMaterials() {
    // Add a background plane with animated shader
    const backgroundGeometry = new THREE.PlaneGeometry(200, 200);
    const backgroundMaterial = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0.0 },
            resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
        },
        vertexShader: `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform float time;
            uniform vec2 resolution;
            varying vec2 vUv;
            
            void main() {
                vec2 p = (vUv - 0.5) * 2.0;
                
                // Animated grid pattern
                float grid = abs(sin(p.x * 10.0 + time)) * abs(sin(p.y * 10.0 + time));
                grid = smoothstep(0.8, 1.0, grid);
                
                // Subtle animated background
                vec3 color = vec3(0.02, 0.02, 0.05) + grid * 0.02;
                
                gl_FragColor = vec4(color, 1.0);
            }
        `
    });
    
    const backgroundMesh = new THREE.Mesh(backgroundGeometry, backgroundMaterial);
    backgroundMesh.position.z = -50;
    scene.add(backgroundMesh);
}

// Enhanced animation loop
function animate() {
    requestAnimationFrame(animate);
    
    const elapsedTime = clock.getElapsedTime();
    
    // Update mouse glow
    if (mouseGlow) {
        const worldPos = screenToWorld(mouseX, mouseY);
        mouseGlow.position.x = worldPos.x;
        mouseGlow.position.y = worldPos.y;
        
        // Update shader uniforms
        mouseGlow.material.uniforms.time.value = elapsedTime;
    }
    
    // Animate particles
    particles.forEach(particle => {
        particle.material.uniforms.time.value = elapsedTime;
        particle.rotation.z += 0.001;
    });
    
    // Animate geometric shapes
    geometricShapes.forEach((shape, index) => {
        shape.rotation.x += 0.01;
        shape.rotation.y += 0.01;
        
        // Floating animation
        shape.position.y += Math.sin(elapsedTime + index) * 0.1;
    });
    
    // Update background shader
    scene.traverse((child) => {
        if (child.material && child.material.uniforms && child.material.uniforms.time) {
            child.material.uniforms.time.value = elapsedTime;
        }
    });
    
    renderer.render(scene, camera);
}

// WebGL performance monitoring
function checkWebGLSupport() {
    try {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('webgl2') || canvas.getContext('webgl');
        
        if (!context) {
            console.warn('WebGL not supported, falling back to basic effects');
            return false;
        }
        
        // Log WebGL capabilities
        console.log('WebGL Version:', context.getParameter(context.VERSION));
        console.log('WebGL Renderer:', context.getParameter(context.RENDERER));
        console.log('Max Texture Size:', context.getParameter(context.MAX_TEXTURE_SIZE));
        
        return true;
    } catch (e) {
        console.error('WebGL support check failed:', e);
        return false;
    }
}

// Convert screen coordinates to world coordinates (simplified for better mouse tracking)
function screenToWorld(screenX, screenY) {
    const distance = Math.abs(camera.position.z - mouseGlow.position.z);
    const vFOV = camera.fov * Math.PI / 180;
    const height = 2 * Math.tan(vFOV / 2) * distance;
    const width = height * camera.aspect;
    
    const x = ((screenX / window.innerWidth) - 0.5) * width;
    const y = -((screenY / window.innerHeight) - 0.5) * height;
    
    return { x, y };
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

// GSAP Animations (keeping your existing animations)
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
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
            navbar.style.background = 'rgba(0, 0, 0, 0.95)';
        } else {
            navbar.classList.remove('scrolled');
            navbar.style.background = 'rgba(0, 0, 0, 0.8)';
        }
    });
}

// Contact form functionality
function initContactForm() {
    const contactForm = document.querySelector('.contact-form');
    
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
            <p>Loading WebGL Experience...</p>
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

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check WebGL support first
    if (!checkWebGLSupport()) {
        console.warn('WebGL not supported, using fallback');
    }
    
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