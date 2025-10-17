import { Vector3D } from './Vector3D.js';

/**
 * Boid class representing a single agent in the flocking simulation
 * Implements Reynolds' boids algorithm with cohesion, separation, and alignment
 */
export class Boid {
    constructor(x, y, z) {
        this.position = new Vector3D(x, y, z);
        this.velocity = Vector3D.random3D();
        this.velocity.setMag(Math.random() * 2 + 1);
        this.acceleration = new Vector3D();
        
        // Boid parameters
        this.maxSpeed = 3;
        this.maxForce = 0.1;
        
        // Perception radii
        this.perceptionRadius = 8;
        this.separationRadius = 3;
        this.avoidanceRadius = 10;
        
        // Behavior weights
        this.alignWeight = 1.0;
        this.cohesionWeight = 1.0;
        this.separationWeight = 1.5;
        
        this.isGuide = false;
    }

    /**
     * Main update method - applies forces and updates position
     */
    update(dt = 1) {
        this.velocity.add(this.acceleration);
        this.velocity.limit(this.maxSpeed);
        this.position.add(Vector3D.add(this.velocity, new Vector3D()).mult(dt));
        this.acceleration.mult(0);
    }

    /**
     * Apply a force to the boid's acceleration
     */
    applyForce(force) {
        this.acceleration.add(force);
    }

    /**
     * Main flocking behavior - combines alignment, cohesion, and separation
     */
    flock(boids, camera = null, guide = null) {
        let alignment = this.align(boids);
        let cohesion = this.cohesion(boids);
        let separation = this.separate(boids);

        alignment.mult(this.alignWeight);
        cohesion.mult(this.cohesionWeight);
        separation.mult(this.separationWeight);

        this.applyForce(alignment);
        this.applyForce(cohesion);
        this.applyForce(separation);

        // Avoid camera if it's too close
        if (camera) {
            let avoidance = this.avoidPoint(camera);
            avoidance.mult(2.0); // Stronger avoidance for camera
            this.applyForce(avoidance);
        }

        // Follow guide if present and this boid is not the guide
        if (guide && !this.isGuide) {
            let follow = this.followTarget(guide);
            follow.mult(0.5);
            this.applyForce(follow);
        }
    }

    /**
     * Alignment - steer towards the average heading of nearby boids
     */
    align(boids) {
        let steering = new Vector3D();
        let total = 0;

        for (let other of boids) {
            let d = this.position.dist(other.position);
            if (other !== this && d < this.perceptionRadius) {
                steering.add(other.velocity);
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
     * Cohesion - steer towards the average position of nearby boids
     */
    cohesion(boids) {
        let steering = new Vector3D();
        let total = 0;

        for (let other of boids) {
            let d = this.position.dist(other.position);
            if (other !== this && d < this.perceptionRadius) {
                steering.add(other.position);
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
     * Separation - steer away from nearby boids to avoid crowding
     */
    separate(boids) {
        let steering = new Vector3D();
        let total = 0;

        for (let other of boids) {
            let d = this.position.dist(other.position);
            if (other !== this && d < this.separationRadius && d > 0.01) {
                let diff = Vector3D.sub(this.position, other.position);
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
     * Avoidance - steer away from a specific point (e.g., camera)
     */
    avoidPoint(point) {
        let d = this.position.dist(point);
        
        if (d < this.avoidanceRadius && d > 0.01) {
            let diff = Vector3D.sub(this.position, point);
            diff.div(Math.max(d * d, 0.01)); // Stronger force when closer with minimum threshold
            diff.setMag(this.maxSpeed);
            diff.sub(this.velocity);
            diff.limit(this.maxForce);
            return diff;
        }

        return new Vector3D();
    }

    /**
     * Follow a target boid (used for following the guide)
     */
    followTarget(target) {
        let desired = Vector3D.sub(target.position, this.position);
        let d = desired.mag();
        
        // Keep a comfortable distance from the guide
        const followDistance = 5;
        if (d < followDistance) {
            return new Vector3D();
        }

        desired.setMag(this.maxSpeed);
        let steer = Vector3D.sub(desired, this.velocity);
        steer.limit(this.maxForce);
        return steer;
    }

    /**
     * Wrap boid position around boundaries (toroidal space)
     */
    wrapBounds(bounds) {
        const margin = 5;
        if (this.position.x > bounds.x + margin) this.position.x = -bounds.x - margin;
        if (this.position.x < -bounds.x - margin) this.position.x = bounds.x + margin;
        if (this.position.y > bounds.y + margin) this.position.y = -bounds.y - margin;
        if (this.position.y < -bounds.y - margin) this.position.y = bounds.y + margin;
        if (this.position.z > bounds.z + margin) this.position.z = -bounds.z - margin;
        if (this.position.z < -bounds.z - margin) this.position.z = bounds.z + margin;
    }
}
