# MuseoBoids

Flocking visitors in a virtual museum

## Overview

MuseoBoids is an interactive 3D simulation framework that models virtual museum visitors as autonomous agents using boids-style behaviors and steering. Visitors (represented by penguin models) move collectively, avoid the user's camera when it gets too close, and can follow a designated guide that traverses a preset trajectory. The system also supports controlling the virtual camera as an agent (camera-as-boid), enabling immersive, non‑traditional navigation modes.

## Features

### Core Boids Algorithm
- **Cohesion**: Visitors steer towards the average position of nearby visitors
- **Separation**: Visitors avoid crowding by steering away from very close neighbors
- **Alignment**: Visitors align their heading with nearby visitors

### Camera Avoidance
- Visitors detect and avoid the user's camera when it gets too close
- Dynamic avoidance behavior that scales with distance

### Guide System
- Designated guide (red penguin) that follows a preset circular trajectory through the museum
- Other visitors can follow the guide while maintaining their flocking behavior
- Visualized trajectory path (can be toggled on/off)

### Camera-as-Boid Mode
- Transform the camera into a boid agent that follows flocking behaviors
- Camera coheres with, aligns with, and separates from visitors
- Keyboard controls provide "thrust" to influence camera movement
- Toggle between traditional FPS controls and boid mode

### Museum Environment
- 3D museum space with floor, exhibits, and proper lighting
- Toroidal boundary wrapping for seamless infinite space
- Exhibit pedestals and decorative objects

## Controls

### Mouse & Keyboard
- **Mouse**: Look around (click to enable pointer lock)
- **W/S**: Move forward/backward
- **A/D**: Strafe left/right
- **Space**: Move up
- **Shift**: Move down

### UI Controls
- **Toggle Guide**: Show/hide the guide and its trajectory
- **Toggle Camera-as-Boid**: Switch between traditional camera and boid-controlled camera
- **Visitor Count Slider**: Adjust the number of visitors (5-50)
- **Show Guide Trajectory**: Toggle the visualization of the guide's path

## Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Architecture

### Core Components

#### `Vector3D.js`
Utility class for 3D vector mathematics with operations like add, subtract, multiply, normalize, and limit.

#### `Boid.js`
Core boid agent class implementing Reynolds' boids algorithm:
- Flocking behaviors (cohesion, separation, alignment)
- Camera avoidance
- Guide following
- Steering force calculations

#### `Guide.js`
Special boid subclass that follows a preset trajectory:
- Waypoint-based navigation
- Configurable path
- Does not flock with other boids

#### `CameraController.js`
Manages camera movement with two modes:
- **Standard Mode**: Traditional FPS-style controls
- **Boid Mode**: Camera follows boid steering behaviors

#### `MuseoBoids.js`
Main simulation manager:
- Scene setup and rendering
- Boid lifecycle management
- Environment creation
- UI event handling
- Animation loop

## Technical Details

### Simulation Parameters
- Boid max speed: 3 units/sec
- Boid max force: 0.1 units/sec²
- Perception radius: 8 units
- Separation radius: 3 units
- Camera avoidance radius: 10 units

### Performance
- Optimized for 5-50 boids
- ~60 FPS on modern hardware
- Real-time FPS counter in UI

## Usage Examples

### Basic Usage
```javascript
import { MuseoBoids } from './MuseoBoids.js';

const container = document.getElementById('canvas-container');
const simulation = new MuseoBoids(container);
simulation.start();
```

### Customizing Boid Count
```javascript
simulation.setVisitorCount(30); // Set to 30 visitors
```

### Toggle Features
```javascript
simulation.toggleGuide();      // Show/hide guide
simulation.toggleTrajectory(); // Show/hide path
```

## Browser Compatibility

Requires a modern browser with WebGL support:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License

MIT

## Credits

Based on Craig Reynolds' Boids algorithm (1986) for simulating flocking behavior.
