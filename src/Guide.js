import { Boid } from './Boid.js';
import { Vector3D } from './Vector3D.js';

/**
 * Guide class - a special boid that follows a preset trajectory
 * Other boids can follow the guide through the museum
 */
export class Guide extends Boid {
    constructor(x, y, z, trajectory = null) {
        super(x, y, z);
        this.isGuide = true;
        this.trajectory = trajectory || this.createDefaultTrajectory();
        this.currentWaypointIndex = 0;
        this.waypointReachedDistance = 2.0;
        
        // Guide moves a bit faster than regular boids
        this.maxSpeed = 4;
    }

    /**
     * Create a default circular trajectory through the museum
     */
    createDefaultTrajectory() {
        const points = [];
        const radius = 15;
        const numPoints = 12;
        const height = 1;

        for (let i = 0; i < numPoints; i++) {
            const angle = (i / numPoints) * Math.PI * 2;
            points.push(new Vector3D(
                Math.cos(angle) * radius,
                height,
                Math.sin(angle) * radius
            ));
        }

        return points;
    }

    /**
     * Update guide position along the trajectory
     */
    update(dt = 1) {
        if (this.trajectory.length === 0) {
            super.update(dt);
            return;
        }

        // Get current target waypoint
        const target = this.trajectory[this.currentWaypointIndex];
        
        // Calculate steering force towards waypoint
        const desired = Vector3D.sub(target, this.position);
        const distance = desired.mag();

        // Check if we've reached the waypoint
        if (distance < this.waypointReachedDistance) {
            // Move to next waypoint
            this.currentWaypointIndex = (this.currentWaypointIndex + 1) % this.trajectory.length;
        }

        // Steer towards the current waypoint
        if (distance > 0) {
            desired.setMag(this.maxSpeed);
            const steer = Vector3D.sub(desired, this.velocity);
            steer.limit(this.maxForce * 2); // Guide can turn faster
            this.applyForce(steer);
        }

        super.update(dt);
    }

    /**
     * Get the trajectory points for rendering
     */
    getTrajectory() {
        return this.trajectory;
    }

    /**
     * Override flock to prevent guide from flocking with others
     */
    flock(boids, camera = null) {
        // Guide doesn't flock, only follows trajectory
        // But still avoids the camera
        if (camera) {
            let avoidance = this.avoidPoint(camera);
            avoidance.mult(1.5);
            this.applyForce(avoidance);
        }
    }
}
