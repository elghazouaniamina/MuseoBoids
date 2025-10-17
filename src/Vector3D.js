/**
 * Vector3D utility class for 3D vector operations
 * Provides common vector math operations for the boids simulation
 */
export class Vector3D {
    constructor(x = 0, y = 0, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    add(v) {
        this.x += v.x;
        this.y += v.y;
        this.z += v.z;
        return this;
    }

    sub(v) {
        this.x -= v.x;
        this.y -= v.y;
        this.z -= v.z;
        return this;
    }

    mult(n) {
        this.x *= n;
        this.y *= n;
        this.z *= n;
        return this;
    }

    div(n) {
        if (n !== 0) {
            this.x /= n;
            this.y /= n;
            this.z /= n;
        }
        return this;
    }

    mag() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }

    magSq() {
        return this.x * this.x + this.y * this.y + this.z * this.z;
    }

    normalize() {
        const m = this.mag();
        if (m !== 0) {
            this.div(m);
        }
        return this;
    }

    limit(max) {
        const mSq = this.magSq();
        if (mSq > max * max) {
            this.normalize().mult(max);
        }
        return this;
    }

    setMag(n) {
        return this.normalize().mult(n);
    }

    dist(v) {
        const dx = this.x - v.x;
        const dy = this.y - v.y;
        const dz = this.z - v.z;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }

    copy() {
        return new Vector3D(this.x, this.y, this.z);
    }

    static sub(v1, v2) {
        return new Vector3D(v1.x - v2.x, v1.y - v2.y, v1.z - v2.z);
    }

    static add(v1, v2) {
        return new Vector3D(v1.x + v2.x, v1.y + v2.y, v1.z + v2.z);
    }

    static random3D() {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        const x = Math.sin(phi) * Math.cos(theta);
        const y = Math.sin(phi) * Math.sin(theta);
        const z = Math.cos(phi);
        return new Vector3D(x, y, z);
    }
}
