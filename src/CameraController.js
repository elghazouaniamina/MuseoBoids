import { Vector3D } from './Vector3D.js';

/**
 * CameraController - handles camera movement with optional boid-like behavior
 * Can operate in two modes:
 * 1. Standard FPS controls (WASD + mouse)
 * 2. Camera-as-boid mode (camera follows boid steering behaviors)
 */
export class CameraController {
    constructor(camera) {
        this.camera = camera;
        this.position = new Vector3D(
            camera.position.x,
            camera.position.y,
            camera.position.z
        );
        
        // Camera movement parameters
        this.velocity = new Vector3D();
        this.acceleration = new Vector3D();
        this.maxSpeed = 5;
        this.maxForce = 0.2;
        this.moveSpeed = 0.3;
        
        // Mouse look parameters
        this.yaw = 0;
        this.pitch = 0;
        this.mouseSensitivity = 0.002;
        
        // Boid mode
        this.boidMode = false;
        this.perceptionRadius = 10;
        this.targetBoid = null;
        
        // Keyboard state
        this.keys = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            up: false,
            down: false
        };

        this.setupControls();
    }

    /**
     * Set up keyboard and mouse controls
     */
    setupControls() {
        document.addEventListener('keydown', (e) => {
            switch(e.key.toLowerCase()) {
                case 'w': this.keys.forward = true; break;
                case 's': this.keys.backward = true; break;
                case 'a': this.keys.left = true; break;
                case 'd': this.keys.right = true; break;
                case ' ': this.keys.up = true; break;
                case 'shift': this.keys.down = true; break;
            }
        });

        document.addEventListener('keyup', (e) => {
            switch(e.key.toLowerCase()) {
                case 'w': this.keys.forward = false; break;
                case 's': this.keys.backward = false; break;
                case 'a': this.keys.left = false; break;
                case 'd': this.keys.right = false; break;
                case ' ': this.keys.up = false; break;
                case 'shift': this.keys.down = false; break;
            }
        });

        document.addEventListener('mousemove', (e) => {
            if (document.pointerLockElement) {
                this.yaw -= e.movementX * this.mouseSensitivity;
                this.pitch -= e.movementY * this.mouseSensitivity;
                this.pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.pitch));
            }
        });

        document.addEventListener('click', () => {
            document.body.requestPointerLock();
        });
    }

    /**
     * Toggle between standard camera and camera-as-boid mode
     */
    toggleBoidMode() {
        this.boidMode = !this.boidMode;
        if (this.boidMode) {
            // When entering boid mode, give camera some initial velocity
            this.velocity = new Vector3D(
                Math.cos(this.yaw) * 2,
                0,
                Math.sin(this.yaw) * 2
            );
        } else {
            this.velocity.mult(0);
        }
        return this.boidMode;
    }

    /**
     * Update camera position based on mode
     */
    update(boids = [], dt = 1) {
        if (this.boidMode) {
            this.updateBoidMode(boids, dt);
        } else {
            this.updateStandardMode(dt);
        }

        // Update Three.js camera position
        this.camera.position.set(this.position.x, this.position.y, this.position.z);
        
        // Update camera rotation
        this.camera.rotation.order = 'YXZ';
        this.camera.rotation.y = this.yaw;
        this.camera.rotation.x = this.pitch;
    }

    /**
     * Standard FPS camera controls
     */
    updateStandardMode(dt) {
        const forward = new Vector3D(
            Math.cos(this.yaw),
            0,
            Math.sin(this.yaw)
        );
        const right = new Vector3D(
            Math.cos(this.yaw - Math.PI / 2),
            0,
            Math.sin(this.yaw - Math.PI / 2)
        );

        if (this.keys.forward) this.position.add(forward.copy().mult(this.moveSpeed * dt));
        if (this.keys.backward) this.position.add(forward.copy().mult(-this.moveSpeed * dt));
        if (this.keys.right) this.position.add(right.copy().mult(this.moveSpeed * dt));
        if (this.keys.left) this.position.add(right.copy().mult(-this.moveSpeed * dt));
        if (this.keys.up) this.position.y += this.moveSpeed * dt;
        if (this.keys.down) this.position.y -= this.moveSpeed * dt;
    }

    /**
     * Camera-as-boid mode - camera follows boid steering behaviors
     */
    updateBoidMode(boids, dt) {
        this.acceleration.mult(0);

        // Apply boid-like behaviors
        if (boids.length > 0) {
            const alignment = this.alignWithBoids(boids);
            const cohesion = this.cohereWithBoids(boids);
            const separation = this.separateFromBoids(boids);

            alignment.mult(0.5);
            cohesion.mult(0.3);
            separation.mult(1.0);

            this.acceleration.add(alignment);
            this.acceleration.add(cohesion);
            this.acceleration.add(separation);
        }

        // Apply keyboard forces in boid mode (like thrust)
        const forward = new Vector3D(Math.cos(this.yaw), 0, Math.sin(this.yaw));
        const right = new Vector3D(Math.cos(this.yaw - Math.PI / 2), 0, Math.sin(this.yaw - Math.PI / 2));

        if (this.keys.forward) this.acceleration.add(forward.copy().mult(0.1));
        if (this.keys.backward) this.acceleration.add(forward.copy().mult(-0.1));
        if (this.keys.right) this.acceleration.add(right.copy().mult(0.1));
        if (this.keys.left) this.acceleration.add(right.copy().mult(-0.1));
        if (this.keys.up) this.acceleration.y += 0.1;
        if (this.keys.down) this.acceleration.y -= 0.1;

        // Update velocity and position
        this.velocity.add(this.acceleration);
        this.velocity.limit(this.maxSpeed);
        this.position.add(Vector3D.add(this.velocity, new Vector3D()).mult(dt));
    }

    /**
     * Align with nearby boids
     */
    alignWithBoids(boids) {
        let steering = new Vector3D();
        let total = 0;

        for (let boid of boids) {
            let d = this.position.dist(boid.position);
            if (d < this.perceptionRadius) {
                steering.add(boid.velocity);
                total++;
            }
        }

        if (total > 0) {
            steering.div(total);
            steering.setMag(this.maxSpeed);
            steering.sub(this.velocity);
            steering.limit(this.maxForce);
        }

        return steering;
    }

    /**
     * Move towards center of nearby boids
     */
    cohereWithBoids(boids) {
        let steering = new Vector3D();
        let total = 0;

        for (let boid of boids) {
            let d = this.position.dist(boid.position);
            if (d < this.perceptionRadius) {
                steering.add(boid.position);
                total++;
            }
        }

        if (total > 0) {
            steering.div(total);
            steering.sub(this.position);
            steering.setMag(this.maxSpeed);
            steering.sub(this.velocity);
            steering.limit(this.maxForce);
        }

        return steering;
    }

    /**
     * Separate from nearby boids
     */
    separateFromBoids(boids) {
        let steering = new Vector3D();
        let total = 0;
        const separationRadius = 5;

        for (let boid of boids) {
            let d = this.position.dist(boid.position);
            if (d < separationRadius && d > 0.01) {
                let diff = Vector3D.sub(this.position, boid.position);
                diff.div(Math.max(d * d, 0.01)); // Weight by distance with minimum threshold
                steering.add(diff);
                total++;
            }
        }

        if (total > 0) {
            steering.div(total);
            steering.setMag(this.maxSpeed);
            steering.sub(this.velocity);
            steering.limit(this.maxForce);
        }

        return steering;
    }

    /**
     * Get camera position as Vector3D
     */
    getPosition() {
        return this.position.copy();
    }
}
