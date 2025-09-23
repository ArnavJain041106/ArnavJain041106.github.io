// Simplified Three.js WebGL Background with Reduced Glow and No Background Textures
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

// Initialize Three.js with mobile optimizations
function initThree() {
    detectDevice();
    
    if (!deviceCapabilities.supportsWebGL) {
        console.warn('WebGL not supported, falling back to CSS animations');
        initFallbackBackground();
        return;
    }
    
    // Scene setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    
    // Optimized renderer settings
    renderer = new THREE.WebGLRenderer({
        canvas: document.getElementById('bg-canvas'),
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
        renderer.outputColorSpace = THREE.SRGBColorSpace;
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
    
    // Start render loop
    animate();
    
    // Add performance monitoring
    if (deviceCapabilities.isMobile) {
        monitorPerformance();
    }
}

// Reduced mouse glow with minimal orange effect
function createReducedMouseGlow() {
    const glowSize = deviceCapabilities.isMobile ? 8 : 12; // Reduced from 15/20
    const glowGeometry = new THREE.PlaneGeometry(glowSize, glowSize);
    
    // Create a more subtle gradient texture
    const canvas = document.createElement('canvas');
    const size = deviceCapabilities.isMobile ? 64 : 128; // Reduced texture size
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext('2d');
    
    // Single, more subtle gradient layer
    const gradient1 = context.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
    gradient1.addColorStop(0, 'rgba(255, 140, 0, 0.08)'); // Reduced from 0.2
    gradient1.addColorStop(0.4, 'rgba(255, 100, 0, 0.04)'); // Reduced from 0.1
    gradient1.addColorStop(0.8, 'rgba(255, 60, 0, 0.02)'); // Reduced from 0.05
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
            if (event.touches.length > 0) {
                mouseX = event.touches[0].clientX;
                mouseY = event.touches[0].clientY;
                // Add subtle touch ripple effect
                createTouchRipple(mouseX, mouseY);
            }
        }, { passive: true });
    }
}

// Enhanced particle system with better performance and visual effects
function createEnhancedParticleSystem() {
    const particleCount = deviceCapabilities.maxParticles;
    
    // Use BufferGeometry for better performance
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const velocities = new Float32Array(particleCount * 3);
    const phases = new Float32Array(particleCount);
    
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
        
        // Individual velocities and phases
        velocities[i3] = (Math.random() - 0.5) * 0.02;
        velocities[i3 + 1] = Math.random() * 0.01 + 0.005;
        velocities[i3 + 2] = (Math.random() - 0.5) * 0.02;
        phases[i] = Math.random() * Math.PI * 2;
        
        // Store additional properties
        floatingParticles.push({
            originalPos: {
                x: positions[i3],
                y: positions[i3 + 1],
                z: positions[i3 + 2]
            },
            velocity: {
                x: velocities[i3],
                y: velocities[i3 + 1],
                z: velocities[i3 + 2]
            },
            phase: phases[i],
            amplitude: Math.random() * 15 + 5,
            life: Math.random(),
            maxLife: Math.random() * 100 + 50,
            twinkleSpeed: Math.random() * 0.02 + 0.01
        });
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    // Enhanced shader material
    const vertexShader = `
        attribute float size;
        varying vec3 vColor;
        varying float vAlpha;
        uniform float time;
        
        void main() {
            vColor = color;
            
            vec3 pos = position;
            
            // Add wave motion
            pos.y += sin(time * 0.5 + position.x * 0.01) * 2.0;
            pos.x += cos(time * 0.3 + position.z * 0.01) * 1.0;
            
            vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
            
            // Distance-based size adjustment
            float distanceSize = size * (300.0 / -mvPosition.z);
            gl_PointSize = distanceSize;
            
            // Calculate alpha based on distance and time for twinkling
            vAlpha = sin(time * 2.0 + position.x + position.y) * 0.3 + 0.7;
            
            gl_Position = projectionMatrix * mvPosition;
        }
    `;
    
    const fragmentShader = `
        varying vec3 vColor;
        varying float vAlpha;
        
        void main() {
            // Create circular particles with soft edges
            vec2 center = gl_PointCoord - vec2(0.5);
            float distance = length(center);
            
            // Smooth circular shape
            float alpha = 1.0 - smoothstep(0.0, 0.5, distance);
            
            // Add core glow
            float coreGlow = 1.0 - smoothstep(0.0, 0.2, distance);
            alpha = mix(alpha * 0.6, alpha, coreGlow);
            
            // Apply twinkling effect
            alpha *= vAlpha;
            
            gl_FragColor = vec4(vColor, alpha * 0.8);
        }
    `;
    
    const material = new THREE.ShaderMaterial({
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        vertexColors: true,
        uniforms: {
            time: { value: 0 }
        },
        vertexShader: deviceCapabilities.enableComplexShaders ? vertexShader : `
            attribute float size;
            varying vec3 vColor;
            void main() {
                vColor = color;
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                gl_PointSize = size * (300.0 / -mvPosition.z);
                gl_Position = projectionMatrix * mvPosition;
            }
        `,
        fragmentShader: deviceCapabilities.enableComplexShaders ? fragmentShader : `
            varying vec3 vColor;
            void main() {
                float distanceToCenter = distance(gl_PointCoord, vec2(0.5));
                float alpha = 1.0 - smoothstep(0.0, 0.5, distanceToCenter);
                gl_FragColor = vec4(vColor, alpha * 0.7);
            }
        `
    });
    
    particleSystem = new THREE.Points(geometry, material);
    scene.add(particleSystem);
}

// Adaptive geometric shapes based on device capabilities
function createAdaptiveGeometricShapes() {
    const shapeCount = deviceCapabilities.maxShapes;
    const complexShapes = !deviceCapabilities.isLowEnd;
    
    const shapeTypes = complexShapes ? [
        { geometry: new THREE.TetrahedronGeometry(2, 0), count: Math.floor(shapeCount * 0.3) },
        { geometry: new THREE.OctahedronGeometry(1.5, 0), count: Math.floor(shapeCount * 0.25) },
        { geometry: new THREE.IcosahedronGeometry(1, 0), count: Math.floor(shapeCount * 0.25) },
        { geometry: new THREE.DodecahedronGeometry(1.2, 0), count: Math.floor(shapeCount * 0.2) }
    ] : [
        { geometry: new THREE.BoxGeometry(2, 2, 2), count: Math.floor(shapeCount * 0.5) },
        { geometry: new THREE.TetrahedronGeometry(2, 0), count: Math.floor(shapeCount * 0.3) },
        { geometry: new THREE.OctahedronGeometry(1.5, 0), count: Math.floor(shapeCount * 0.2) }
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
                wireframe: true,
                wireframeLinewidth: deviceCapabilities.isMobile ? 1 : 2
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
}

// Enhanced floating orbs
function createFloatingOrbs() {
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
}

// Subtle touch ripple effect for mobile
function createTouchRipple(x, y) {
    if (!deviceCapabilities.isMobile) return;
    
    const rippleGeometry = new THREE.RingGeometry(0, 1, 16);
    const rippleMaterial = new THREE.MeshBasicMaterial({
        color: 0xff8c00,
        transparent: true,
        opacity: 0.2, // Reduced from 0.5
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
        const progress = elapsed / 0.8; // 0.8 second duration
        
        if (progress >= 1) {
            scene.remove(ripple);
            rippleGeometry.dispose();
            rippleMaterial.dispose();
            return;
        }
        
        const scale = 1 + progress * 15; // Reduced from 20
        const opacity = (1 - progress) * 0.2; // Reduced from 0.5
        
        ripple.scale.set(scale, scale, 1);
        rippleMaterial.opacity = opacity;
        
        requestAnimationFrame(animateRipple);
    };
    
    animateRipple();
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
            
            // Keep only last 10 FPS readings
            if (fpsHistory.length > 10) {
                fpsHistory.shift();
            }
            
            const avgFps = fpsHistory.reduce((a, b) => a + b, 0) / fpsHistory.length;
            
            // Adapt quality based on performance
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
    
    // Reduce particle count
    if (particleSystem && floatingParticles.length > 50) {
        const positions = particleSystem.geometry.attributes.position.array;
        const colors = particleSystem.geometry.attributes.color.array;
        const sizes = particleSystem.geometry.attributes.size.array;
        
        const newCount = Math.floor(floatingParticles.length * 0.7);
        const newPositions = new Float32Array(newCount * 3);
        const newColors = new Float32Array(newCount * 3);
        const newSizes = new Float32Array(newCount);
        
        for (let i = 0; i < newCount; i++) {
            const i3 = i * 3;
            newPositions[i3] = positions[i3];
            newPositions[i3 + 1] = positions[i3 + 1];
            newPositions[i3 + 2] = positions[i3 + 2];
            newColors[i3] = colors[i3];
            newColors[i3 + 1] = colors[i3 + 1];
            newColors[i3 + 2] = colors[i3 + 2];
            newSizes[i] = sizes[i];
        }
        
        particleSystem.geometry.setAttribute('position', new THREE.BufferAttribute(newPositions, 3));
        particleSystem.geometry.setAttribute('color', new THREE.BufferAttribute(newColors, 3));
        particleSystem.geometry.setAttribute('size', new THREE.BufferAttribute(newSizes, 1));
        
        floatingParticles = floatingParticles.slice(0, newCount);
    }
    
    // Reduce shape complexity
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
    requestAnimationFrame(animate);
    
    const elapsedTime = clock.getElapsedTime();
    const deltaTime = clock.getDelta();
    
    // Update mouse glow with smooth interpolation (reduced pulse effect)
    if (mouseGlow) {
        const worldPos = screenToWorld(mouseX, mouseY);
        
        // Smooth movement interpolation
        mouseGlow.position.x += (worldPos.x - mouseGlow.position.x) * 0.1;
        mouseGlow.position.y += (worldPos.y - mouseGlow.position.y) * 0.1;
        
        // Reduced pulsing effect
        const pulse = Math.sin(elapsedTime * 1.5) * 0.08 + Math.cos(elapsedTime * 2) * 0.03 + 1; // Reduced intensity
        mouseGlow.scale.set(pulse, pulse, 1);
        
        // Rotate glow slowly
        mouseGlow.rotation.z += 0.005;
    }
    
    // Enhanced particle animation
    if (particleSystem) {
        const positions = particleSystem.geometry.attributes.position.array;
        const colors = particleSystem.geometry.attributes.color.array;
        
        for (let i = 0; i < floatingParticles.length; i++) {
            const particle = floatingParticles[i];
            const i3 = i * 3;
            
            // Enhanced floating motion
            const timeOffset = elapsedTime + particle.phase;
            positions[i3] = particle.originalPos.x + 
                Math.sin(timeOffset * 0.5) * particle.amplitude * 0.3 +
                Math.cos(timeOffset * 0.3) * particle.amplitude * 0.2;
            
            positions[i3 + 1] = particle.originalPos.y + 
                Math.sin(timeOffset * particle.velocity.y * 100) * particle.amplitude;
            
            positions[i3 + 2] = particle.originalPos.z + 
                Math.cos(timeOffset * 0.4) * particle.amplitude * 0.2;
            
            // Color pulsing for visual interest
            if (!deviceCapabilities.isLowEnd) {
                const colorPulse = Math.sin(elapsedTime * particle.twinkleSpeed + particle.phase) * 0.2 + 0.8;
                colors[i3] *= colorPulse;
                colors[i3 + 1] *= colorPulse;
                colors[i3 + 2] *= colorPulse;
            }
            
            // Mouse interaction - particles move away from mouse
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
        if (!deviceCapabilities.isLowEnd) {
            particleSystem.geometry.attributes.color.needsUpdate = true;
        }
        
        // Update shader uniforms
        if (particleSystem.material.uniforms) {
            particleSystem.material.uniforms.time.value = elapsedTime;
        }
    }
    
    // Enhanced geometric shapes animation
    geometricShapes.forEach(shape => {
        const mesh = shape.mesh;
        
        // Smooth rotation
        mesh.rotation.x += shape.rotationSpeed.x;
        mesh.rotation.y += shape.rotationSpeed.y;
        mesh.rotation.z += shape.rotationSpeed.z;
        
        // Enhanced floating motion
        const timeOffset = elapsedTime + shape.phase;
        mesh.position.y = shape.originalY + 
            Math.sin(timeOffset * shape.floatSpeed) * shape.floatAmplitude +
            Math.cos(timeOffset * shape.floatSpeed * 0.7) * shape.floatAmplitude * 0.3;
        
        // Pulse effect for orbs with smoother transitions
        if (shape.pulseSpeed) {
            const scale = 1 + Math.sin(elapsedTime * shape.pulseSpeed) * shape.pulseAmplitude;
            mesh.scale.set(scale, scale, scale);
            
            // Enhanced opacity pulsing
            const opacityPulse = 0.15 + Math.sin(elapsedTime * shape.pulseSpeed * 0.8) * 0.1;
            mesh.material.opacity = opacityPulse;
        }
        
        // Enhanced mouse interaction with smooth repulsion
        if (mouseGlow && shape.mouseRepelRadius) {
            const distance = mesh.position.distanceTo(mouseGlow.position);
            if (distance < shape.mouseRepelRadius) {
                const repelForce = (shape.mouseRepelRadius - distance) / shape.mouseRepelRadius * shape.mouseRepelStrength;
