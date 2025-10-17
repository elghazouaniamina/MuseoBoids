import { MuseoBoids } from './MuseoBoids.js';

/**
 * Main entry point for MuseoBoids application
 */

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('canvas-container');
    
    if (!container) {
        console.error('Canvas container not found!');
        return;
    }

    // Create and start the simulation
    const simulation = new MuseoBoids(container);
    simulation.start();

    // Add instructions
    console.log('=== MuseoBoids Started ===');
    console.log('Controls:');
    console.log('- WASD: Move camera');
    console.log('- Mouse: Look around');
    console.log('- Space: Move up');
    console.log('- Shift: Move down');
    console.log('- Click to enable pointer lock');
    console.log('');
    console.log('Features:');
    console.log('- Visitors (penguins) flock together using boids algorithm');
    console.log('- Visitors avoid the camera when it gets too close');
    console.log('- Red guide follows a preset trajectory');
    console.log('- Visitors follow the guide');
    console.log('- Toggle Camera-as-Boid to make camera move with flocking behaviors');
});
