import * as THREE from 'three';
import { makeText } from './graphicUtils';
import { getCamera } from './main';

export class Label {
    constructor(text) {
        this.text = text;
        this.textMesh = makeText(16, 'center', 'center', this.text, 0, 0, 0);
    }

    setPos(x, y, z) {
        this.textMesh.position.set(x, y, z);
    }

    faceCamera() {
		this.textMesh.quaternion.copy(getCamera().quaternion);
    }

    setScale() {
        const zoom = getCamera().zoom > 2 ? getCamera().zoom : 2;
        const scale = 1 / zoom;
        this.textMesh.scale.set(scale, scale, scale);
    }

    toggleVisibility() {
        if (this.textMesh.material.opacity === 1) {
            this.textMesh.material.opacity = 0;
        } else {
            this.textMesh.material.opacity = 1;
        }
        this.textMesh.material.needsUpdate = true;
    }

    isOverlapping(other) {
        // Dynamically calculate world-space bounding boxes
        const box1 = new THREE.Box3().setFromObject(this.textMesh);
        const box2 = new THREE.Box3().setFromObject(other.textMesh);
    
        // Convert the bounding boxes to screen space
        const screenBox1 = projectBoxToScreen(box1, getCamera());
        const screenBox2 = projectBoxToScreen(box2, getCamera());
    
        // Check for overlap in screen space
        const overlap = !(
            screenBox1.max.x < screenBox2.min.x ||
            screenBox1.min.x > screenBox2.max.x ||
            screenBox1.max.y < screenBox2.min.y ||
            screenBox1.min.y > screenBox2.max.y
        );
    
        if (overlap) {
            console.log(`Overlap detected: ${this.text} overlaps with ${other.text}`);
        }
    
        return overlap;
    }

    getTextMesh() {
        return this.textMesh;
    }
}

// Helper function to project a Box3 to 2D screen space
function projectBoxToScreen(box, camera) {
    // Orthographic camera specifics: transform directly to screen coordinates
    const points = [
        new THREE.Vector3(box.min.x, box.min.y, box.min.z),
        new THREE.Vector3(box.min.x, box.max.y, box.min.z),
        new THREE.Vector3(box.max.x, box.min.y, box.min.z),
        new THREE.Vector3(box.max.x, box.max.y, box.min.z),
    ];

    const screenPoints = points.map(point => {
        const ndc = point.project(camera); // Normalized Device Coordinates
        return {
            x: (ndc.x + 1) / 2 * window.innerWidth,
            y: (1 - ndc.y) / 2 * window.innerHeight,
        };
    });

    // Compute 2D screen-space bounding box
    const screenBox = {
        min: { x: Infinity, y: Infinity },
        max: { x: -Infinity, y: -Infinity },
    };

    screenPoints.forEach(p => {
        screenBox.min.x = Math.min(screenBox.min.x, p.x);
        screenBox.min.y = Math.min(screenBox.min.y, p.y);
        screenBox.max.x = Math.max(screenBox.max.x, p.x);
        screenBox.max.y = Math.max(screenBox.max.y, p.y);
    });

    return screenBox;
}
