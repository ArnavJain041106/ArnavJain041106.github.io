// Three.js 3D Background
let scene, camera, renderer, particles;
let mouseX = 0, mouseY = 0;

// Initialize Three.js
function initThree() {
    // Scene setup
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({
        canvas: document.getElementById('bg-canvas'),
        alpha: true,
        antialias: true
    });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    
    // Create particles
    createParticles();
    
    // Position camera
    camera.position.z = 50;
    
    // Animation loop
    animate();
}

// Create particle system
function createParticles() {
    const particleCount = 1500;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    
    // Color palette for particles
    const colorPalette = [
        new THREE.Color(0x667eea), // Primary blue
        new THREE.Color(0x764ba2), // Secondary purple
        new THREE.Color(0xf093fb), // Accent pink
        new THREE.Color(0x4facfe), // Light blue
        new THREE.Color(0x00f2fe)  // Cyan
    ];
    
    for (let i = 0; i < particleCount; i++) {
        // Position
        positions[i * 3] = (Math.random() - 0.5) * 100;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 100;
        
        // Color
        const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;
    }
    
    // Geometry and material
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const material = new THREE.PointsMaterial({
        size: 1,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });
    
    particles = new THREE.Points(geometry, material);
    scene.add(particles);
    
    // Add some geometric shapes
    createFloatingShapes();
}

// Create floating geometric shapes
function createFloatingShapes() {
    const shapes = [];
    const shapeCount = 20;
    
    for (let i = 0; i < shapeCount; i++) {
        let geometry, material, mesh;
        
        const shapeType = Math.floor(Math.random() * 3);
        
        switch (shapeType) {
            case 0:
                geometry = new THREE.BoxGeometry(2, 2, 2);
                break;
            case 1:
                geometry = new THREE.SphereGeometry(1, 8, 6);
                break;
            case 2:
                geometry = new THREE.OctahedronGeometry(1.5);
                break;
        }
        
        material = new THREE.MeshBasicMaterial({
            color: Math.random() * 0xffffff,
            transparent: true,
            opacity: 0.1,
            wireframe: true
        });
        
        mesh = new THREE.Mesh(geometry, material);
        
        // Random position
        mesh.position.set(
            (Math.random() - 0.5) * 80,
            (Math.random() - 0.5) * 80,
            (Math.random() - 0.5) * 80
        );
        
        // Random rotation speed
        mesh.rotationSpeed = {
            x: (Math.random() - 0.5) * 0.02,
            y: (Math.random() - 0.5) * 0.02,
            z: (Math.random() - 0.5) * 0.02
        };
        
        shapes.push(mesh);
        scene.add(mesh);
    }
    
    // Store shapes for animation
    scene.userData.shapes = shapes;
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    // Rotate particles
    particles.rotation.x += 0.0005;
    particles.rotation.y += 0.001;
    
    // Mouse interaction
    particles.rotation.x += (mouseY * 0.00005);
    particles.rotation.y += (mouseX * 0.00005);
    
    // Animate floating shapes
    if (scene.userData.shapes) {
        scene.userData.shapes.forEach(shape => {
            shape.rotation.x += shape.rotationSpeed.x;
            shape.rotation.y += shape.rotationSpeed.y;
            shape.rotation.z += shape.rotationSpeed.z;
            
            // Floating animation
            shape.position.y += Math.sin(Date.now() * 0.001 + shape.position.x) * 0.01;
        });
    }
    
    renderer.render(scene, camera);
}

// Handle mouse movement
document.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX - window.innerWidth / 2) / 100;
    mouseY = (event.clientY - window.innerHeight / 2) / 100;
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

// Contact form functionality
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

// Cursor animation
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
