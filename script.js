// Fixed Three.js WebGL Background with Proper Error Handling
let scene, camera, renderer, mouseGlow;
let mouseX = 0, mouseY = 0;
let floatingParticles = [];
let geometricShapes = [];
let clock;
let isMobile = false;
let deviceCapabilities = {};
let particleSystem = null;

// Device detection and capability assessment
function detectDevice() {
    const userAgent = navigator.userAgent;
    const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const isTablet = /iPad|Tablet|(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(userAgent);
    
    isMobile = isMobileDevice;
    
    // Assess device capabilities
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
        maxParticles: isMobileDevice ? (isTablet ? 200 : 100) : 400,
        maxShapes: isMobileDevice ? (isTablet ? 15 : 8) : 24,
        enableComplexShaders: !isMobileDevice || (isMobileDevice && window.devicePixelRatio >= 2),
        pixelRatio: Math.min(window.devicePixelRatio, isMobileDevice ? 1.5 : 2)
    };
    
    console.log('Device capabilities:', deviceCapabilities);
    return deviceCapabilities;
}

// Fallback for non-WebGL browsers
function initFallbackBackground() {
    console.log('Initializing CSS fallback background');
    const canvas = document.getElementById('bg-canvas');
    if (canvas) {
        canvas.style.display = 'none';
    }
    
    // Create simple CSS animation fallback
    const fallbackDiv = document.createElement('div');
    fallbackDiv.style.position = 'fixed';
    fallbackDiv.style.top = '0';
    fallbackDiv.style.left = '0';
    fallbackDiv.style.width = '100%';
    fallbackDiv.style.height = '100%';
    fallbackDiv.style.background = 'radial-gradient(circle, rgba(255,140,0,0.1) 0%, rgba(0,0,0,1) 70%)';
    fallbackDiv.style.zIndex = '-1';
    fallbackDiv.style.pointerEvents = 'none';
    document.body.appendChild(fallbackDiv);
}

// Initialize Three.js with proper error handling
function initThree() {
    try {
        detectDevice();
        
        if (!deviceCapabilities.supportsWebGL) {
            console.warn('WebGL not supported, falling back to CSS animations');
            initFallbackBackground();
            return;
        }

        // Check if canvas exists
        const canvas = document.getElementById('bg-canvas');
        if (!canvas) {
            console.error('Canvas element with id "bg-canvas" not found');
            return;
        }

        // Check if THREE is loaded
        if (typeof THREE === 'undefined') {
            console.error('Three.js library not loaded');
            return;
        }
        
        // Scene setup
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x000000);
        
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        
        // Optimized renderer settings
        renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            alpha: false,
            antialias: !deviceCapabilities.isMobile,
            powerPreference: deviceCapabilities.isMobile ? 'low-power' : 'high-performance',
            stencil: false,
            depth: true
        });
        
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(deviceCapabilities.pixelRatio);
        
        // Mobile-specific optimizations
        if (deviceCapabilities.isMobile) {
            renderer.shadowMap.enabled = false;
            if (THREE.SRGBColorSpace) {
                renderer.outputColorSpace = THREE.SRGBColorSpace;
            }
        }
        
        // Initialize clock for animations
        clock = new THREE.Clock();
        
        // Create effects based on device capabilities
        createReducedMouseGlow();
        createEnhancedParticleSystem();
        createAdaptiveGeometricShapes();
        createFloatingOrbs();
        
        // Position camera
        camera.position.z = 50;
        
        // Add mouse move listener
        document.addEventListener('mousemove', (event) => {
            mouseX = event.clientX;
            mouseY = event.clientY;
        });
        
        // Start render loop
        animate();
        
        // Add performance monitoring
        if (deviceCapabilities.isMobile) {
            monitorPerformance();
        }

        // Handle window resize
        window.addEventListener('resize', onWindowResize, false);
        
        console.log('Three.js initialized successfully');
        
    } catch (error) {
        console.error('Error initializing Three.js:', error);
        initFallbackBackground();
    }
}

// Window resize handler
function onWindowResize() {
    if (!camera || !renderer) return;
    
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Reduced mouse glow with minimal orange effect
function createReducedMouseGlow() {
    try {
        const glowSize = deviceCapabilities.isMobile ? 8 : 12;
        const glowGeometry = new THREE.PlaneGeometry(glowSize, glowSize);
        
        // Create a more subtle gradient texture
        const canvas = document.createElement('canvas');
        const size = deviceCapabilities.isMobile ? 64 : 128;
        canvas.width = size;
        canvas.height = size;
        const context = canvas.getContext('2d');
        
        // Single, more subtle gradient layer
        const gradient1 = context.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
        gradient1.addColorStop(0, 'rgba(255, 140, 0, 0.08)');
        gradient1.addColorStop(0.4, 'rgba(255, 100, 0, 0.04)');
        gradient1.addColorStop(0.8, 'rgba(255, 60, 0, 0.02)');
        gradient1.addColorStop(1, 'rgba(255, 140, 0, 0)');
        
        context.fillStyle = gradient1;
        context.fillRect(0, 0, size, size);
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.generateMipmaps = false;
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        
        const glowMaterial = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        
        mouseGlow = new THREE.Mesh(glowGeometry, glowMaterial);
        mouseGlow.position.z = -10;
        scene.add(mouseGlow);
        
        // Add touch support for mobile
        if (deviceCapabilities.isMobile) {
            document.addEventListener('touchmove', (event) => {
                if (event.touches.length > 0) {
                    mouseX = event.touches[0].clientX;
                    mouseY = event.touches[0].clientY;
                }
            }, { passive: true });
            
            document.addEventListener('touchstart', (event) => {
                if (event.touches[0]) {
                    mouseX = event.touches[0].clientX;
                    mouseY = event.touches[0].clientY;
                    createTouchRipple(mouseX, mouseY);
                }
            }, { passive: true });
        }
        
        console.log('Mouse glow created successfully');
    } catch (error) {
        console.error('Error creating mouse glow:', error);
    }
}

// Enhanced particle system with better performance and visual effects
function createEnhancedParticleSystem() {
    try {
        const particleCount = deviceCapabilities.maxParticles;
        
        // Use BufferGeometry for better performance
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);
        
        // Enhanced orange color palette
        const colorPalette = [
            new THREE.Color(0xff8c00), // Main orange
            new THREE.Color(0xff6600), // Red orange  
            new THREE.Color(0xffaa00), // Yellow orange
            new THREE.Color(0xff4400), // Deep orange
            new THREE.Color(0xffcc00), // Light orange
            new THREE.Color(0xff9944), // Warm orange
            new THREE.Color(0xffbb33), // Golden orange
            new THREE.Color(0xff7722)  // Burnt orange
        ];
        
        // Initialize particles with enhanced properties
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            
            // Distributed positioning for better coverage
            const angle = (i / particleCount) * Math.PI * 2;
            const radius = Math.random() * 100 + 20;
            const height = (Math.random() - 0.5) * 120;
            
            positions[i3] = Math.cos(angle) * radius + (Math.random() - 0.5) * 50;
            positions[i3 + 1] = height;
            positions[i3 + 2] = Math.sin(angle) * radius + (Math.random() - 0.5) * 60;
            
            // Enhanced color variation
            const colorIndex = Math.floor(Math.random() * colorPalette.length);
            const baseColor = colorPalette[colorIndex];
            const variation = 0.2;
            colors[i3] = Math.min(1, baseColor.r + (Math.random() - 0.5) * variation);
            colors[i3 + 1] = Math.min(1, baseColor.g + (Math.random() - 0.5) * variation);
            colors[i3 + 2] = Math.min(1, baseColor.b + (Math.random() - 0.5) * variation);
            
            // Variable sizes
            sizes[i] = Math.random() * (deviceCapabilities.isMobile ? 2 : 4) + 1;
            
            // Store additional properties
            floatingParticles.push({
                originalPos: {
                    x: positions[i3],
                    y: positions[i3 + 1],
                    z: positions[i3 + 2]
                },
                velocity: {
                    x: (Math.random() - 0.5) * 0.02,
                    y: Math.random() * 0.01 + 0.005,
                    z: (Math.random() - 0.5) * 0.02
                },
                phase: Math.random() * Math.PI * 2,
                amplitude: Math.random() * 15 + 5,
                twinkleSpeed: Math.random() * 0.02 + 0.01
            });
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        // Simple material that works across all devices
        const material = new THREE.PointsMaterial({
            size: 2,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true
        });
        
        particleSystem = new THREE.Points(geometry, material);
        scene.add(particleSystem);
        
        console.log('Particle system created successfully');
    } catch (error) {
        console.error('Error creating particle system:', error);
    }
}

// Adaptive geometric shapes based on device capabilities
function createAdaptiveGeometricShapes() {
    try {
        const shapeCount = deviceCapabilities.maxShapes;
        
        const shapeTypes = [
            { geometry: new THREE.BoxGeometry(2, 2, 2), count: Math.floor(shapeCount * 0.4) },
            { geometry: new THREE.TetrahedronGeometry(2, 0), count: Math.floor(shapeCount * 0.3) },
            { geometry: new THREE.OctahedronGeometry(1.5, 0), count: Math.floor(shapeCount * 0.3) }
        ];
        
        shapeTypes.forEach(shapeType => {
            for (let i = 0; i < shapeType.count; i++) {
                // Create material with enhanced orange variations
                const hue = 0.08 + Math.random() * 0.06; // Orange range
                const saturation = 0.7 + Math.random() * 0.3;
                const lightness = 0.4 + Math.random() * 0.3;
                
                const material = new THREE.MeshBasicMaterial({
                    color: new THREE.Color().setHSL(hue, saturation, lightness),
                    transparent: true,
                    opacity: deviceCapabilities.isMobile ? 0.4 : 0.3,
                    wireframe: true
                });
                
                const mesh = new THREE.Mesh(shapeType.geometry, material);
                
                // Distributed positioning
                const angle = (i / shapeType.count) * Math.PI * 2 + Math.random();
                const radius = Math.random() * 80 + 40;
                const height = (Math.random() - 0.5) * 100;
                
                mesh.position.set(
                    Math.cos(angle) * radius,
                    height,
                    Math.sin(angle) * radius * 0.6
                );
                
                // Random initial rotation
                mesh.rotation.set(
                    Math.random() * Math.PI,
                    Math.random() * Math.PI,
                    Math.random() * Math.PI
                );
                
                scene.add(mesh);
                
                // Store for animation with enhanced properties
                geometricShapes.push({
                    mesh: mesh,
                    rotationSpeed: {
                        x: (Math.random() - 0.5) * (deviceCapabilities.isMobile ? 0.01 : 0.02),
                        y: (Math.random() - 0.5) * (deviceCapabilities.isMobile ? 0.01 : 0.02),
                        z: (Math.random() - 0.5) * (deviceCapabilities.isMobile ? 0.01 : 0.02)
                    },
                    floatSpeed: Math.random() * 0.008 + 0.003,
                    floatAmplitude: Math.random() * 4 + 2,
                    originalY: mesh.position.y,
                    phase: Math.random() * Math.PI * 2,
                    mouseRepelRadius: 25,
                    mouseRepelStrength: 0.3
                });
            }
        });
        
        console.log('Geometric shapes created successfully');
    } catch (error) {
        console.error('Error creating geometric shapes:', error);
    }
}

// Enhanced floating orbs
function createFloatingOrbs() {
    try {
        const orbCount = deviceCapabilities.isMobile ? 6 : 12;
        
        for (let i = 0; i < orbCount; i++) {
            const radius = Math.random() * 1.5 + 0.5;
            const segments = deviceCapabilities.isLowEnd ? 8 : 16;
            
            const geometry = new THREE.SphereGeometry(radius, segments, segments);
            
            const material = new THREE.MeshBasicMaterial({
                color: new THREE.Color().setHSL(0.08 + Math.random() * 0.04, 0.9, 0.4 + Math.random() * 0.3),
                transparent: true,
                opacity: 0.15,
                blending: THREE.AdditiveBlending
            });
            
            const orb = new THREE.Mesh(geometry, material);
            
            // Position orbs in a more organized pattern
            const angle = (i / orbCount) * Math.PI * 2;
            const radius_pos = Math.random() * 60 + 80;
            const height = (Math.random() - 0.5) * 80;
            
            orb.position.set(
                Math.cos(angle) * radius_pos,
                height,
                Math.sin(angle) * radius_pos * 0.7
            );
            
            scene.add(orb);
            
            // Enhanced animation properties
            geometricShapes.push({
                mesh: orb,
                rotationSpeed: {
                    x: 0,
                    y: (Math.random() - 0.5) * 0.005,
                    z: 0
                },
                floatSpeed: Math.random() * 0.006 + 0.002,
                floatAmplitude: Math.random() * 10 + 5,
                originalY: orb.position.y,
                phase: Math.random() * Math.PI * 2,
                pulseSpeed: Math.random() * 0.015 + 0.005,
                pulseAmplitude: 0.3,
                mouseRepelRadius: 30,
                mouseRepelStrength: 0.2
            });
        }
        
        console.log('Floating orbs created successfully');
    } catch (error) {
        console.error('Error creating floating orbs:', error);
    }
}

// Subtle touch ripple effect for mobile
function createTouchRipple(x, y) {
    if (!deviceCapabilities.isMobile || !clock) return;
    
    try {
        const rippleGeometry = new THREE.RingGeometry(0, 1, 16);
        const rippleMaterial = new THREE.MeshBasicMaterial({
            color: 0xff8c00,
            transparent: true,
            opacity: 0.2,
            side: THREE.DoubleSide
        });
        
        const ripple = new THREE.Mesh(rippleGeometry, rippleMaterial);
        
        const worldPos = screenToWorld(x, y);
        ripple.position.set(worldPos.x, worldPos.y, -5);
        
        scene.add(ripple);
        
        // Animate ripple
        const startTime = clock.getElapsedTime();
        const animateRipple = () => {
            const elapsed = clock.getElapsedTime() - startTime;
            const progress = elapsed / 0.8;
            
            if (progress >= 1) {
                scene.remove(ripple);
                rippleGeometry.dispose();
                rippleMaterial.dispose();
                return;
            }
            
            const scale = 1 + progress * 15;
            const opacity = (1 - progress) * 0.2;
            
            ripple.scale.set(scale, scale, 1);
            rippleMaterial.opacity = opacity;
            
            requestAnimationFrame(animateRipple);
        };
        
        animateRipple();
    } catch (error) {
        console.error('Error creating touch ripple:', error);
    }
}

// Performance monitoring for mobile devices
function monitorPerformance() {
    let frameCount = 0;
    let lastTime = performance.now();
    let fpsHistory = [];
    
    const checkPerformance = () => {
        frameCount++;
        const currentTime = performance.now();
        
        if (currentTime - lastTime >= 1000) {
            const fps = frameCount;
            fpsHistory.push(fps);
            
            if (fpsHistory.length > 10) {
                fpsHistory.shift();
            }
            
            const avgFps = fpsHistory.reduce((a, b) => a + b, 0) / fpsHistory.length;
            
            if (avgFps < 30 && fpsHistory.length >= 5) {
                adaptQualityForPerformance();
            }
            
            frameCount = 0;
            lastTime = currentTime;
        }
        
        requestAnimationFrame(checkPerformance);
    };
    
    checkPerformance();
}

// Adapt rendering quality based on performance
function adaptQualityForPerformance() {
    console.log('Adapting quality for better performance...');
    
    if (particleSystem && floatingParticles.length > 50) {
        const newCount = Math.floor(floatingParticles.length * 0.7);
        floatingParticles = floatingParticles.slice(0, newCount);
    }
    
    geometricShapes.forEach(shape => {
        if (shape.mesh.geometry.type !== 'BoxGeometry') {
            const box = new THREE.BoxGeometry(2, 2, 2);
            shape.mesh.geometry.dispose();
            shape.mesh.geometry = box;
        }
    });
}

// Enhanced screen to world coordinate conversion
function screenToWorld(screenX, screenY) {
    if (!camera || !mouseGlow) return { x: 0, y: 0 };
    
    const distance = Math.abs(camera.position.z - mouseGlow.position.z);
    const vFOV = camera.fov * Math.PI / 180;
    const height = 2 * Math.tan(vFOV / 2) * distance;
    const width = height * camera.aspect;
    
    const x = ((screenX / window.innerWidth) - 0.5) * width;
    const y = -((screenY / window.innerHeight) - 0.5) * height;
    
    return { x, y };
}

// Enhanced animation loop with performance optimizations
function animate() {
    if (!renderer || !scene || !camera) return;
    
    requestAnimationFrame(animate);
    
    try {
        const elapsedTime = clock ? clock.getElapsedTime() : Date.now() * 0.001;
        
        // Update mouse glow with smooth interpolation
        if (mouseGlow) {
            const worldPos = screenToWorld(mouseX, mouseY);
            
            mouseGlow.position.x += (worldPos.x - mouseGlow.position.x) * 0.1;
            mouseGlow.position.y += (worldPos.y - mouseGlow.position.y) * 0.1;
            
            const pulse = Math.sin(elapsedTime * 1.5) * 0.08 + Math.cos(elapsedTime * 2) * 0.03 + 1;
            mouseGlow.scale.set(pulse, pulse, 1);
            mouseGlow.rotation.z += 0.005;
        }
        
        // Enhanced particle animation
        if (particleSystem && floatingParticles.length > 0) {
            const positions = particleSystem.geometry.attributes.position.array;
            
            for (let i = 0; i < floatingParticles.length; i++) {
                const particle = floatingParticles[i];
                const i3 = i * 3;
                
                const timeOffset = elapsedTime + particle.phase;
                positions[i3] = particle.originalPos.x + 
                    Math.sin(timeOffset * 0.5) * particle.amplitude * 0.3 +
                    Math.cos(timeOffset * 0.3) * particle.amplitude * 0.2;
                
                positions[i3 + 1] = particle.originalPos.y + 
                    Math.sin(timeOffset * particle.velocity.y * 100) * particle.amplitude;
                
                positions[i3 + 2] = particle.originalPos.z + 
                    Math.cos(timeOffset * 0.4) * particle.amplitude * 0.2;
                
                // Mouse interaction
                if (mouseGlow) {
                    const dx = positions[i3] - mouseGlow.position.x;
                    const dy = positions[i3 + 1] - mouseGlow.position.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < 30) {
                        const repelForce = (30 - distance) / 30 * 0.5;
                        positions[i3] += (dx / distance) * repelForce;
                        positions[i3 + 1] += (dy / distance) * repelForce;
                    }
                }
            }
            
            particleSystem.geometry.attributes.position.needsUpdate = true;
        }
        
        // Enhanced geometric shapes animation
        geometricShapes.forEach(shape => {
            const mesh = shape.mesh;
            
            mesh.rotation.x += shape.rotationSpeed.x;
            mesh.rotation.y += shape.rotationSpeed.y;
            mesh.rotation.z += shape.rotationSpeed.z;
            
            const timeOffset = elapsedTime + shape.phase;
            mesh.position.y = shape.originalY + 
                Math.sin(timeOffset * shape.floatSpeed) * shape.floatAmplitude +
                Math.cos(timeOffset * shape.floatSpeed * 0.7) * shape.floatAmplitude * 0.3;
            
            if (shape.pulseSpeed) {
                const scale = 1 + Math.sin(elapsedTime * shape.pulseSpeed) * shape.pulseAmplitude;
                mesh.scale.set(scale, scale, scale);
                
                const opacityPulse = 0.15 + Math.sin(elapsedTime * shape.pulseSpeed * 0.8) * 0.1;
                mesh.material.opacity = opacityPulse;
            }
            
            // Mouse interaction
            if (mouseGlow && shape.mouseRepelRadius) {
                const distance = mesh.position.distanceTo(mouseGlow.position);
                if (distance < shape.mouseRepelRadius) {
                    const repelForce = (shape.mouseRepelRadius - distance) / shape.mouseRepelRadius * shape.mouseRepelStrength;
                    const direction = mesh.position.clone().sub(mouseGlow.position).normalize();
                    mesh.position.add(direction.multiplyScalar(repelForce));
                }
            }
        });
        
        renderer.render(scene, camera);
        
    } catch (error) {
        console.error('Error in animation loop:', error);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing Three.js background...');
    initThree();
});

// Also initialize if DOM is already loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initThree);
} else {
    initThree();
}
