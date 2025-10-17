import * as THREE from 'three';
import { Boid } from './Boid.js';
import { Guide } from './Guide.js';
import { CameraController } from './CameraController.js';
import { Vector3D } from './Vector3D.js';

/**
 * MuseoBoids - Main simulation class
 * Manages the 3D scene, boids, guide, and rendering
 */
export class MuseoBoids {
    constructor(container) {
        this.container = container;
        this.boids = [];
        this.guide = null;
        this.showGuide = true;
        this.showTrajectory = true;
        
        // Simulation bounds
        this.bounds = new Vector3D(30, 15, 30);
        
        // Performance tracking
        this.lastTime = performance.now();
        this.frameCount = 0;
        this.fps = 0;
        
        this.initScene();
        this.initBoids(20);
        this.initGuide();
        this.setupEventListeners();
    }

    /**
     * Initialize Three.js scene
     */
    initScene() {
        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x1a1a2e);
        this.scene.fog = new THREE.Fog(0x1a1a2e, 20, 60);

        // Camera
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 10, 30);
        
        // Camera controller
        this.cameraController = new CameraController(this.camera);

        // Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.container.appendChild(this.renderer.domElement);

        // Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 20, 10);
        this.scene.add(directionalLight);

        const pointLight = new THREE.PointLight(0x4da6ff, 1, 50);
        pointLight.position.set(0, 10, 0);
        this.scene.add(pointLight);

        // Museum environment
        this.createMuseumEnvironment();

        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());
    }

    /**
     * Create museum environment (floor, walls, exhibits)
     */
    createMuseumEnvironment() {
        // Floor
        const floorGeometry = new THREE.PlaneGeometry(100, 100);
        const floorMaterial = new THREE.MeshStandardMaterial({
            color: 0x2c3e50,
            roughness: 0.8,
            metalness: 0.2
        });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = 0;
        this.scene.add(floor);

        // Grid helper
        const gridHelper = new THREE.GridHelper(60, 30, 0x3498db, 0x2c3e50);
        gridHelper.position.y = 0.01;
        this.scene.add(gridHelper);

        // Add some "exhibits" (simple geometric shapes)
        this.createExhibits();
    }

    /**
     * Create museum exhibits (decorative objects)
     */
    createExhibits() {
        const exhibits = [
            { geometry: new THREE.BoxGeometry(2, 3, 2), position: [10, 1.5, 10], color: 0xe74c3c },
            { geometry: new THREE.BoxGeometry(2, 3, 2), position: [-10, 1.5, 10], color: 0x3498db },
            { geometry: new THREE.BoxGeometry(2, 3, 2), position: [10, 1.5, -10], color: 0x2ecc71 },
            { geometry: new THREE.BoxGeometry(2, 3, 2), position: [-10, 1.5, -10], color: 0xf39c12 },
            { geometry: new THREE.CylinderGeometry(1, 1, 4, 16), position: [0, 2, 15], color: 0x9b59b6 },
            { geometry: new THREE.CylinderGeometry(1, 1, 4, 16), position: [0, 2, -15], color: 0x1abc9c }
        ];

        exhibits.forEach(exhibit => {
            const material = new THREE.MeshStandardMaterial({
                color: exhibit.color,
                roughness: 0.5,
                metalness: 0.3
            });
            const mesh = new THREE.Mesh(exhibit.geometry, material);
            mesh.position.set(...exhibit.position);
            this.scene.add(mesh);

            // Add pedestal
            const pedestalGeometry = new THREE.CylinderGeometry(1.5, 1.5, 0.5, 16);
            const pedestalMaterial = new THREE.MeshStandardMaterial({ color: 0x34495e });
            const pedestal = new THREE.Mesh(pedestalGeometry, pedestalMaterial);
            pedestal.position.set(exhibit.position[0], 0.25, exhibit.position[2]);
            this.scene.add(pedestal);
        });
    }

    /**
     * Initialize boids (visitors)
     */
    initBoids(count) {
        // Clear existing boids
        this.boids.forEach(boid => {
            if (boid.mesh) {
                this.scene.remove(boid.mesh);
            }
        });
        this.boids = [];

        // Create new boids
        for (let i = 0; i < count; i++) {
            const x = (Math.random() - 0.5) * this.bounds.x * 2;
            const y = Math.random() * 3 + 2;
            const z = (Math.random() - 0.5) * this.bounds.z * 2;
            
            const boid = new Boid(x, y, z);
            
            // Create penguin-like mesh (cone body + sphere head)
            const group = new THREE.Group();
            
            // Body (cone)
            const bodyGeometry = new THREE.ConeGeometry(0.3, 0.8, 8);
            const bodyMaterial = new THREE.MeshStandardMaterial({
                color: 0x2c3e50,
                roughness: 0.7
            });
            const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
            body.position.y = 0.4;
            group.add(body);
            
            // Head (sphere)
            const headGeometry = new THREE.SphereGeometry(0.25, 16, 16);
            const headMaterial = new THREE.MeshStandardMaterial({
                color: 0x34495e,
                roughness: 0.6
            });
            const head = new THREE.Mesh(headGeometry, headMaterial);
            head.position.y = 0.9;
            group.add(head);
            
            // Beak (small cone)
            const beakGeometry = new THREE.ConeGeometry(0.08, 0.2, 6);
            const beakMaterial = new THREE.MeshStandardMaterial({ color: 0xf39c12 });
            const beak = new THREE.Mesh(beakGeometry, beakMaterial);
            beak.rotation.x = Math.PI / 2;
            beak.position.set(0, 0.9, 0.25);
            group.add(beak);
            
            group.position.set(x, y, z);
            boid.mesh = group;
            this.scene.add(group);
            this.boids.push(boid);
        }
    }

    /**
     * Initialize guide boid
     */
    initGuide() {
        // Remove existing guide
        if (this.guide && this.guide.mesh) {
            this.scene.remove(this.guide.mesh);
        }
        if (this.trajectoryLine) {
            this.scene.remove(this.trajectoryLine);
        }

        // Create guide
        this.guide = new Guide(0, 2, 15);
        
        // Create guide mesh (larger and different color)
        const group = new THREE.Group();
        
        const bodyGeometry = new THREE.ConeGeometry(0.4, 1.0, 8);
        const bodyMaterial = new THREE.MeshStandardMaterial({
            color: 0xe74c3c,
            roughness: 0.7,
            emissive: 0xe74c3c,
            emissiveIntensity: 0.3
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.5;
        group.add(body);
        
        const headGeometry = new THREE.SphereGeometry(0.3, 16, 16);
        const headMaterial = new THREE.MeshStandardMaterial({
            color: 0xc0392b,
            roughness: 0.6
        });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 1.1;
        group.add(head);
        
        const beakGeometry = new THREE.ConeGeometry(0.1, 0.25, 6);
        const beakMaterial = new THREE.MeshStandardMaterial({ color: 0xf39c12 });
        const beak = new THREE.Mesh(beakGeometry, beakMaterial);
        beak.rotation.x = Math.PI / 2;
        beak.position.set(0, 1.1, 0.3);
        group.add(beak);
        
        // Add a small light to guide
        const guideLight = new THREE.PointLight(0xe74c3c, 0.5, 5);
        guideLight.position.y = 1.5;
        group.add(guideLight);
        
        group.position.set(this.guide.position.x, this.guide.position.y, this.guide.position.z);
        this.guide.mesh = group;
        
        if (this.showGuide) {
            this.scene.add(group);
        }

        // Create trajectory line
        this.createTrajectoryLine();
    }

    /**
     * Create visual representation of guide trajectory
     */
    createTrajectoryLine() {
        const points = this.guide.getTrajectory().map(p => 
            new THREE.Vector3(p.x, p.y, p.z)
        );
        // Close the loop
        points.push(points[0].clone());

        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({
            color: 0xe74c3c,
            linewidth: 2,
            opacity: 0.6,
            transparent: true
        });
        
        this.trajectoryLine = new THREE.Line(geometry, material);
        
        if (this.showTrajectory && this.showGuide) {
            this.scene.add(this.trajectoryLine);
        }
    }

    /**
     * Toggle guide visibility
     */
    toggleGuide() {
        this.showGuide = !this.showGuide;
        
        if (this.showGuide) {
            this.scene.add(this.guide.mesh);
            if (this.showTrajectory) {
                this.scene.add(this.trajectoryLine);
            }
        } else {
            this.scene.remove(this.guide.mesh);
            this.scene.remove(this.trajectoryLine);
        }
        
        return this.showGuide;
    }

    /**
     * Toggle trajectory line visibility
     */
    toggleTrajectory() {
        this.showTrajectory = !this.showTrajectory;
        
        if (this.showTrajectory && this.showGuide) {
            this.scene.add(this.trajectoryLine);
        } else {
            this.scene.remove(this.trajectoryLine);
        }
        
        return this.showTrajectory;
    }

    /**
     * Update visitor count
     */
    setVisitorCount(count) {
        this.initBoids(count);
    }

    /**
     * Setup UI event listeners
     */
    setupEventListeners() {
        // Toggle guide button
        const toggleGuideBtn = document.getElementById('toggleGuide');
        if (toggleGuideBtn) {
            toggleGuideBtn.addEventListener('click', () => {
                const enabled = this.toggleGuide();
                toggleGuideBtn.textContent = enabled ? 'Hide Guide' : 'Show Guide';
            });
        }

        // Toggle camera-as-boid button
        const toggleCameraBtn = document.getElementById('toggleCameraAsBoid');
        if (toggleCameraBtn) {
            toggleCameraBtn.addEventListener('click', () => {
                const enabled = this.cameraController.toggleBoidMode();
                toggleCameraBtn.textContent = enabled ? 'Disable Camera-as-Boid' : 'Enable Camera-as-Boid';
            });
        }

        // Visitor count slider
        const slider = document.getElementById('visitorCountSlider');
        const countDisplay = document.getElementById('visitorCount');
        const countDisplayInfo = document.getElementById('visitorCountDisplay');
        
        if (slider) {
            slider.addEventListener('input', (e) => {
                const count = parseInt(e.target.value);
                if (countDisplay) countDisplay.textContent = count;
                if (countDisplayInfo) countDisplayInfo.textContent = count;
                this.setVisitorCount(count);
            });
        }

        // Show trajectory checkbox
        const showTrajectoryCheckbox = document.getElementById('showTrajectory');
        if (showTrajectoryCheckbox) {
            showTrajectoryCheckbox.addEventListener('change', (e) => {
                this.toggleTrajectory();
            });
        }
    }

    /**
     * Handle window resize
     */
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    /**
     * Main animation loop
     */
    animate() {
        requestAnimationFrame(() => this.animate());

        const currentTime = performance.now();
        const deltaTime = (currentTime - this.lastTime) / 1000; // Convert to seconds
        this.lastTime = currentTime;

        // Update FPS counter
        this.frameCount++;
        if (this.frameCount % 60 === 0) {
            this.fps = Math.round(1 / deltaTime);
            const fpsElement = document.getElementById('fps');
            if (fpsElement) fpsElement.textContent = this.fps;
        }

        this.update(deltaTime);
        this.renderer.render(this.scene, this.camera);
    }

    /**
     * Update simulation
     */
    update(dt) {
        // Clamp dt to prevent large jumps
        dt = Math.min(dt, 0.1);

        // Update camera
        const cameraPosition = this.cameraController.getPosition();
        this.cameraController.update(this.boids, dt);

        // Update guide
        if (this.showGuide && this.guide) {
            this.guide.update(dt);
            this.guide.wrapBounds(this.bounds);
            
            if (this.guide.mesh) {
                this.guide.mesh.position.set(
                    this.guide.position.x,
                    this.guide.position.y,
                    this.guide.position.z
                );
                
                // Orient guide in direction of movement
                if (this.guide.velocity.mag() > 0.1) {
                    const angle = Math.atan2(this.guide.velocity.x, this.guide.velocity.z);
                    this.guide.mesh.rotation.y = angle;
                }
            }
        }

        // Update boids
        for (let boid of this.boids) {
            boid.flock(
                this.boids,
                cameraPosition,
                this.showGuide ? this.guide : null
            );
            boid.update(dt);
            boid.wrapBounds(this.bounds);

            // Update mesh position and rotation
            if (boid.mesh) {
                boid.mesh.position.set(
                    boid.position.x,
                    boid.position.y,
                    boid.position.z
                );

                // Orient boid in direction of movement
                if (boid.velocity.mag() > 0.1) {
                    const angle = Math.atan2(boid.velocity.x, boid.velocity.z);
                    boid.mesh.rotation.y = angle;
                }
            }
        }
    }

    /**
     * Start the simulation
     */
    start() {
        this.animate();
    }
}
