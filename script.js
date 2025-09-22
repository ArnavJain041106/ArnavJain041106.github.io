// Enhanced Three.js WebGL Background with Improved Particle System and Mobile Optimization
let scene, camera, renderer, mouseGlow;
let mouseX = 0, mouseY = 0;
let floatingParticles = [];
let geometricShapes = [];
let clock;
let isMobile = false;
let deviceCapabilities = {};
let particleSystem = null;
let backgroundEffects = [];

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
        enablePostProcessing: !isMobileDevice,
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
        antialias: !deviceCapabilities.isMobile, // Disable antialiasing on mobile for performance
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
    createMouseGlow();
    createEnhancedParticleSystem();
    createAdaptiveGeometricShapes();
    createFloatingOrbs();
    createBackgroundEffects();
    
    // Position camera
    camera.position.z = 50;
    
    // Start render loop
    animate();
    
    // Add performance monitoring
    if (deviceCapabilities.isMobile) {
        monitorPerformance();
    }
}

// Enhanced mouse glow with mobile touch support
function createMouseGlow() {
    const glowSize = deviceCapabilities.isMobile ? 15 : 20;
    const glowGeometry = new THREE.PlaneGeometry(glowSize, glowSize);
    
    // Create a more efficient gradient texture
    const canvas = document.createElement('canvas');
    const size = deviceCapabilities.isMobile ? 128 : 256;
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext('2d');
    
    // Create multiple gradient layers for depth
    const gradient1 = context.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
    gradient1.addColorStop(0, 'rgba(255, 140, 0, 0.4)');
    gradient1.addColorStop(0.3, 'rgba(255, 100, 0, 0.2)');
    gradient1.addColorStop(0.7, 'rgba(255, 60, 0, 0.1)');
    gradient1.addColorStop(1, 'rgba(255, 140, 0, 0)');
    
    context.fillStyle = gradient1;
    context.fillRect(0, 0, size, size);
    
    // Add inner glow
    const gradient2 = context.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/4);
    gradient2.addColorStop(0, 'rgba(255, 200, 100, 0.3)');
    gradient2.addColorStop(1, 'rgba(255, 200, 100, 0)');
    
    context.globalCompositeOperation = 'screen';
    context.fillStyle = gradient2;
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
                // Add touch ripple effect
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

// Background ambient effects
function createBackgroundEffects() {
    if (deviceCapabilities.isLowEnd) return;
    
    // Create subtle background gradient mesh
    const bgGeometry = new THREE.PlaneGeometry(200, 200);
    const bgMaterial = new THREE.ShaderMaterial({
        transparent: true,
        uniforms: {
            time: { value: 0 },
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
                vec2 uv = vUv - 0.5;
                float dist = length(uv);
                
                // Create subtle animated background
                float wave1 = sin(dist * 10.0 - time * 2.0) * 0.1;
                float wave2 = cos(dist * 8.0 + time * 1.5) * 0.1;
                
                vec3 color = vec3(0.02, 0.01, 0.0) * (wave1 + wave2 + 0.8);
                
                gl_FragColor = vec4(color, 0.3);
            }
        `
    });
    
    const bgMesh = new THREE.Mesh(bgGeometry, bgMaterial);
    bgMesh.position.z = -50;
    scene.add(bgMesh);
    
    backgroundEffects.push({
        mesh: bgMesh,
        material: bgMaterial
    });
}

// Touch ripple effect for mobile
function createTouchRipple(x, y) {
    if (!deviceCapabilities.isMobile) return;
    
    const rippleGeometry = new THREE.RingGeometry(0, 1, 16);
    const rippleMaterial = new THREE.MeshBasicMaterial({
        color: 0xff8c00,
        transparent: true,
        opacity: 0.5,
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
        
        const scale = 1 + progress * 20;
        const opacity = (1 - progress) * 0.5;
        
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
    
    // Update mouse glow with smooth interpolation
    if (mouseGlow) {
        const worldPos = screenToWorld(mouseX, mouseY);
        
        // Smooth movement interpolation
        mouseGlow.position.x += (worldPos.x - mouseGlow.position.x) * 0.1;
        mouseGlow.position.y += (worldPos.y - mouseGlow.position.y) * 0.1;
        
        // Enhanced pulsing effect
        const pulse = Math.sin(elapsedTime * 2.5) * 0.15 + Math.cos(elapsedTime * 4) * 0.05 + 1;
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
                const direction = new THREE.Vector3().subVectors(mesh.position, mouseGlow.position).normalize();
                
                // Apply smooth repulsion
                const targetPosition = mesh.position.clone().add(direction.multiplyScalar(repelForce));
                mesh.position.lerp(targetPosition, 0.1);
                
                // Add rotation when repelled
                mesh.rotation.y += repelForce * 0.02;
            }
        }
        
        // Boundary constraints - wrap around screen edges
        const boundarySize = 120;
        if (Math.abs(mesh.position.x) > boundarySize) {
            mesh.position.x *= -0.9;
        }
        if (Math.abs(mesh.position.z) > boundarySize * 0.8) {
            mesh.position.z *= -0.9;
        }
    });
    
    // Update background effects
    backgroundEffects.forEach(effect => {
        if (effect.material.uniforms) {
            effect.material.uniforms.time.value = elapsedTime;
        }
    });
    
    // Render the scene
    renderer.render(scene, camera);
}

// Fallback CSS-based background for unsupported devices
function initFallbackBackground() {
    console.log('Initializing CSS fallback background');
    
    const canvas = document.getElementById('bg-canvas');
    if (canvas) {
        canvas.style.display = 'none';
    }
    
    // Create CSS-based animated background
    const fallbackBg = document.createElement('div');
    fallbackBg.id = 'fallback-background';
    fallbackBg.innerHTML = `
        <div class="css-particles"></div>
        <div class="css-gradient"></div>
    `;
    
    document.body.prepend(fallbackBg);
    
    // Add CSS styles for fallback
    const fallbackStyles = document.createElement('style');
    fallbackStyles.textContent = `
        #fallback-background {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: -1;
            background: linear-gradient(45deg, #000000 0%, #1a0a00 50%, #000000 100%);
            overflow: hidden;
        }
        
        .css-gradient {
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle at center, rgba(255, 140, 0, 0.1) 0%, transparent 50%);
            animation: rotateGradient 20s linear infinite;
        }
        
        .css-particles {
            position: absolute;
            width: 100%;
            height: 100%;
        }
        
        .css-particles::before {
            content: '';
            position: absolute;
            width: 2px;
            height: 2px;
            background: #ff8c00;
            border-radius: 50%;
            box-shadow: 
                10px 20px 0 #ff8c00,
                -20px 30px 0 #ffaa00,
                30px -10px 0 #ff6600,
                -40px 50px 0 #ff4400,
                50px 40px 0 #ffcc00,
                -10px -30px 0 #ff8c00,
                70px 10px 0 #ffaa00,
                -30px -50px 0 #ff6600;
            animation: sparkle 3s ease-in-out infinite alternate;
        }
        
        @keyframes rotateGradient {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        
        @keyframes sparkle {
            0%, 100% { opacity: 0.3; transform: scale(0.8); }
            50% { opacity: 1; transform: scale(1.2); }
        }
    `;
    
    document.head.appendChild(fallbackStyles);
}

// Enhanced GSAP animations with mobile considerations
function initAnimations() {
    if (typeof gsap === 'undefined') {
        console.warn('GSAP not loaded, skipping advanced animations');
        return;
    }
    
    // Reduced motion for mobile devices
    const animationDuration = deviceCapabilities.isMobile ? 0.8 : 1;
    const staggerDelay = deviceCapabilities.isMobile ? 0.1 : 0.2;
    
    // Hero section animation with mobile optimization
    const heroTimeline = gsap.timeline();
    heroTimeline
        .from('.hero-title', { 
            duration: animationDuration, 
            y: deviceCapabilities.isMobile ? 50 : 100, 
            opacity: 0, 
            ease: 'power3.out' 
        })
        .from('.hero-subtitle', { 
            duration: animationDuration, 
            y: deviceCapabilities.isMobile ? 30 : 50, 
            opacity: 0, 
            ease: 'power3.out' 
        }, `-=${animationDuration * 0.5}`)
        .from('.hero-description', { 
            duration: animationDuration, 
            y: deviceCapabilities.isMobile ? 20 : 30, 
            opacity: 0, 
            ease: 'power3.out' 
        }, `-=${animationDuration * 0.3}`)
        .from('.hero-buttons', { 
            duration: animationDuration, 
            y: deviceCapabilities.isMobile ? 20 : 30, 
            opacity: 0, 
            ease: 'power3.out' 
        }, `-=${animationDuration * 0.2}`)
        .from('.profile-card', { 
            duration: animationDuration * 1.5, 
            scale: deviceCapabilities.isMobile ? 0.9 : 0.8, 
            opacity: 0, 
            ease: 'back.out(1.7)' 
        }, `-=${animationDuration}`);
    
    // Enhanced skill bars animation
    const skillBars = document.querySelectorAll('.skill-progress');
    skillBars.forEach(bar => {
        const progress = bar.getAttribute('data-progress');
        gsap.to(bar, {
            width: progress + '%',
            duration: deviceCapabilities.isMobile ? 1.5 : 2,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: bar,
                start: 'top 80%',
                toggleActions: 'play none none reverse'
            }
        });
    });
    
    // Cards animation with mobile optimization
    if (typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
        
        gsap.utils.toArray('.glass-card').forEach((card, index) => {
            gsap.fromTo(card, 
                { 
                    y: deviceCapabilities.isMobile ? 50 : 100, 
                    opacity: 0 
                },
                {
                    y: 0,
                    opacity: 1,
                    duration: animationDuration,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: card,
                        start: 'top 85%',
                        end: 'bottom 15%',
                        toggleActions: 'play none none reverse'
                    }
                }
            );
        });
        
        // Refresh ScrollTrigger on mobile orientation change
        if (deviceCapabilities.isMobile) {
            window.addEventListener('orientationchange', () => {
                setTimeout(() => {
                    ScrollTrigger.refresh();
                }, 500);
            });
        }
    }
}

// Enhanced navigation with mobile improvements
function initNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Enhanced mobile menu toggle
    if (hamburger && deviceCapabilities.isMobile) {
        hamburger.addEventListener('click', (e) => {
            e.stopPropagation();
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
            
            // Prevent body scroll when menu is open
            if (navMenu.classList.contains('active')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!navMenu.contains(e.target) && !hamburger.contains(e.target)) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }
    
    // Enhanced smooth scrolling with mobile considerations
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                // Close mobile menu
                if (hamburger && deviceCapabilities.isMobile) {
                    hamburger.classList.remove('active');
                    navMenu.classList.remove('active');
                    document.body.style.overflow = '';
                }
                
                const offsetTop = targetSection.offsetTop - (deviceCapabilities.isMobile ? 60 : 80);
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Enhanced navbar behavior with performance optimization
    let ticking = false;
    let lastScrollY = 0;
    
    const updateNavbar = () => {
        const navbar = document.querySelector('.navbar');
        if (!navbar) return;
        
        const scrollY = window.scrollY;
        const scrollingDown = scrollY > lastScrollY;
        
        if (scrollY > 100) {
            navbar.classList.add('scrolled');
            navbar.style.background = 'rgba(0, 0, 0, 0.95)';
            navbar.style.backdropFilter = deviceCapabilities.isMobile ? 'none' : 'blur(10px)';
            
            // Auto-hide navbar on mobile when scrolling down
            if (deviceCapabilities.isMobile && scrollingDown && scrollY > 200) {
                navbar.style.transform = 'translateY(-100%)';
            } else {
                navbar.style.transform = 'translateY(0)';
            }
        } else {
            navbar.classList.remove('scrolled');
            navbar.style.background = 'rgba(0, 0, 0, 0.8)';
            navbar.style.backdropFilter = 'none';
            navbar.style.transform = 'translateY(0)';
        }
        
        lastScrollY = scrollY;
        ticking = false;
    };
    
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(updateNavbar);
            ticking = true;
        }
    }, { passive: true });
}

// Enhanced contact form with mobile improvements
function initContactForm() {
    const contactForm = document.querySelector('.contact-form');
    
    if (contactForm) {
        // Add mobile-friendly input enhancements
        const inputs = contactForm.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            // Add mobile-specific attributes
            if (deviceCapabilities.isMobile) {
                if (input.type === 'email') {
                    input.setAttribute('autocomplete', 'email');
                    input.setAttribute('inputmode', 'email');
                }
                if (input.name === 'name') {
                    input.setAttribute('autocomplete', 'name');
                }
            }
            
            // Enhanced focus/blur effects
            input.addEventListener('focus', () => {
                input.parentElement.classList.add('focused');
            });
            
            input.addEventListener('blur', () => {
                if (!input.value) {
                    input.parentElement.classList.remove('focused');
                }
            });
        });
        
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(contactForm);
            const data = {
                name: formData.get('name'),
                email: formData.get('email'),
                subject: formData.get('subject'),
                message: formData.get('message')
            };
            
            // Enhanced validation
            if (!data.name || !data.email || !data.message) {
                showNotification('Please fill in all required fields.', 'error');
                return;
            }
            
            if (!isValidEmail(data.email)) {
                showNotification('Please enter a valid email address.', 'error');
                return;
            }
            
            const submitButton = contactForm.querySelector('button[type="submit"]');
            const originalText = submitButton.innerHTML;
            
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            submitButton.disabled = true;
            
            // Simulate form submission
            try {
                await new Promise(resolve => setTimeout(resolve, 2000));
                showNotification('Thank you for your message! I will get back to you soon.', 'success');
                contactForm.reset();
            } catch (error) {
                showNotification('Sorry, there was an error sending your message. Please try again.', 'error');
            } finally {
                submitButton.innerHTML = originalText;
                submitButton.disabled = false;
            }
        });
    }
}

// Utility functions
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Add styles
    const styles = {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '15px 20px',
        borderRadius: '5px',
        color: 'white',
        zIndex: '10000',
        fontSize: deviceCapabilities.isMobile ? '14px' : '16px',
        maxWidth: deviceCapabilities.isMobile ? '280px' : '400px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
    };
    
    Object.assign(notification.style, styles);
    
    if (type === 'success') {
        notification.style.background = 'linear-gradient(135deg, #4CAF50, #45a049)';
    } else if (type === 'error') {
        notification.style.background = 'linear-gradient(135deg, #f44336, #da190b)';
    } else {
        notification.style.background = 'linear-gradient(135deg, #2196F3, #1976D2)';
    }
    
    document.body.appendChild(notification);
    
    // Animate in
    notification.style.opacity = '0';
    notification.style.transform = 'translateX(100%)';
    
    setTimeout(() => {
        notification.style.transition = 'all 0.3s ease';
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after delay
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

// Enhanced parallax with mobile optimization
function initParallax() {
    if (deviceCapabilities.isMobile && deviceCapabilities.isLowEnd) {
        console.log('Skipping parallax on low-end mobile device');
        return;
    }
    
    let ticking = false;
    
    const updateParallax = () => {
        const scrolled = window.pageYOffset;
        const parallaxElements = document.querySelectorAll('.parallax');
        
        parallaxElements.forEach(el => {
            // Skip parallax for contact and form sections
            const isContactSection = el.closest('#contact') || el.closest('.contact-section');
            const isFormSection = el.closest('.contact-form') || el.closest('.form-section');
            
            if (isContactSection || isFormSection) {
                el.style.transform = 'translateY(0px)';
                return;
            }
            
            // Further reduced parallax intensity for mobile
            const originalSpeed = parseFloat(el.dataset.speed) || 0.5;
            const mobileReduction = deviceCapabilities.isMobile ? 0.15 : 0.3;
            const reducedSpeed = originalSpeed * mobileReduction;
            const yPos = -(scrolled * reducedSpeed);
            el.style.transform = `translateY(${yPos}px)`;
        });
        
        ticking = false;
    };
    
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(updateParallax);
            ticking = true;
        }
    }, { passive: true });
}

// Enhanced window resize handler
function handleResize() {
    if (!camera || !renderer) return;
    
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    // Update background effects uniforms
    backgroundEffects.forEach(effect => {
        if (effect.material.uniforms && effect.material.uniforms.resolution) {
            effect.material.uniforms.resolution.value.set(window.innerWidth, window.innerHeight);
        }
    });
    
    // Refresh ScrollTrigger if available
    if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.refresh();
    }
}

// Enhanced loader with mobile optimization
function initLoader() {
    const loader = document.createElement('div');
    loader.className = 'loader';
    loader.innerHTML = `
        <div class="loader-content">
            <div class="loader-spinner"></div>
            <p>LOADING</p>
            <div class="loader-progress">
                <div class="loader-progress-bar"></div>
            </div>
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
            background: linear-gradient(135deg, #000000, #1a0a00);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            opacity: 1;
            transition: opacity 0.5s ease;
        }
        
        .loader-content {
            text-align: center;
            color: #ff8c00;
        }
        
        .loader-spinner {
            width: ${deviceCapabilities.isMobile ? '40px' : '50px'};
            height: ${deviceCapabilities.isMobile ? '40px' : '50px'};
            border: 3px solid rgba(255, 140, 0, 0.3);
            border-top: 3px solid #ff8c00;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 20px;
        }
        
        .loader-progress {
            width: ${deviceCapabilities.isMobile ? '200px' : '250px'};
            height: 4px;
            background: rgba(255, 140, 0, 0.2);
            border-radius: 2px;
            margin: 20px auto 0;
            overflow: hidden;
        }
        
        .loader-progress-bar {
            height: 100%;
            background: linear-gradient(90deg, #ff8c00, #ffaa00);
            border-radius: 2px;
            width: 0%;
            animation: loadProgress 2s ease-in-out;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        @keyframes loadProgress {
            0% { width: 0%; }
            50% { width: 60%; }
            100% { width: 100%; }
        }
        
        .loader.fade-out {
            opacity: 0;
            pointer-events: none;
        }
        
        .loader p {
            font-size: ${deviceCapabilities.isMobile ? '14px' : '16px'};
            font-weight: 600;
            letter-spacing: 2px;
            margin: 0;
        }
    `;
    document.head.appendChild(loaderStyle);
    
    // Enhanced loading completion
    const handleLoad = () => {
        setTimeout(() => {
            loader.classList.add('fade-out');
            setTimeout(() => {
                loader.remove();
                loaderStyle.remove();
                
                // Trigger initial animations
                if (typeof gsap !== 'undefined') {
                    gsap.from('body', { opacity: 0, duration: 0.5 });
                }
            }, 500);
        }, deviceCapabilities.isMobile ? 800 : 1000);
    };
    
    // Wait for critical resources
    if (document.readyState === 'complete') {
        handleLoad();
    } else {
        window.addEventListener('load', handleLoad);
    }
}

// Enhanced initialization with comprehensive error handling
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing enhanced background system...');
    console.log('Device capabilities:', deviceCapabilities);
    
    try {
        initLoader();
        
        // Initialize Three.js background
        if (typeof THREE !== 'undefined' && deviceCapabilities.supportsWebGL) {
            console.log('Initializing WebGL background...');
            initThree();
        } else {
            console.log('Falling back to CSS background...');
            initFallbackBackground();
        }
        
        // Initialize animations
        if (typeof gsap !== 'undefined') {
            initAnimations();
        }
        
        // Initialize other components
        initNavigation();
        initContactForm();
        initParallax();
        
        // Enhanced window resize handling
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(handleResize, 100);
        }, { passive: true });
        
        // Initialize interactive effects
        setTimeout(() => {
            addInteractiveEffects();
        }, 1000);
        
    } catch (error) {
        console.error('Error during initialization:', error);
        initFallbackBackground();
    }
});

// Enhanced interactive effects with mobile optimization
function addInteractiveEffects() {
    const cards = document.querySelectorAll('.glass-card');
    
    cards.forEach(card => {
        // Skip interactive effects for contact/form cards or on low-end devices
        const isContactCard = card.closest('#contact') || card.closest('.contact-section');
        const isFormCard = card.closest('.contact-form') || card.closest('.form-section');
        
        if (isContactCard || isFormCard || deviceCapabilities.isLowEnd) {
            return;
        }
        
        // Mouse/touch move handler
        const handleMove = (clientX, clientY) => {
            const rect = card.getBoundingClientRect();
            const x = clientX - rect.left;
            const y = clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            // Further reduced tilt effect
            const intensity = deviceCapabilities.isMobile ? 20 : 15;
            const rotateX = (y - centerY) / intensity;
            const rotateY = (centerX - x) / intensity;
            const scale = deviceCapabilities.isMobile ? 1.005 : 1.01;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${scale}, ${scale}, ${scale})`;
        };
        
        // Mouse events for desktop
        if (!deviceCapabilities.isMobile) {
            card.addEventListener('mousemove', (e) => {
                handleMove(e.clientX, e.clientY);
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
            });
        }
        
        // Touch events for mobile (optional, reduced intensity)
        if (deviceCapabilities.isMobile && !deviceCapabilities.isLowEnd) {
            card.addEventListener('touchmove', (e) => {
                if (e.touches.length === 1) {
                    e.preventDefault();
                    handleMove(e.touches[0].clientX, e.touches[0].clientY);
                }
            }, { passive: false });
            
            card.addEventListener('touchend', () => {
                card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
            });
        }
    });
    
    // Add stats counter animation
    const statNumbers = document.querySelectorAll('.stat-number');
    if (statNumbers.length > 0) {
        const observerOptions = {
            threshold: 0.5,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const statsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const stat = entry.target;
                    const target = parseInt(stat.textContent);
                    animateCounter(stat, 0, target, 2000);
                    statsObserver.unobserve(stat);
                }
            });
        }, observerOptions);
        
        statNumbers.forEach(stat => statsObserver.observe(stat));
    }
}

// Counter animation utility
function animateCounter(element, start, end, duration) {
    const startTime = performance.now();
    
    const updateCounter = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(start + (end - start) * easeOut);
        
        element.textContent = current;
        
        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = end;
        }
    };
    
    requestAnimationFrame(updateCounter);
}
