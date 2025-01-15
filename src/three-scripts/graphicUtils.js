import * as THREE from 'three';

import { CONFIG, getScene, getRenderer } from './main.js';


export function setAlpha(colorString, alpha) {
    const updatedColor = colorString.replace(/rgba\(([\d\s,]+),\s*\d*\.?\d*\)/, `rgba($1, ${alpha})`); 
    return updatedColor;
}

export function makePlane() {
    let plane = new THREE.Mesh(
        new THREE.PlaneGeometry(CONFIG.LAYER_WIDTH, CONFIG.LAYER_HEIGHT),
        new THREE.MeshBasicMaterial({ color: 'white', side: THREE.DoubleSide, alphaTest: 0.01, depthWrite: false })
    );
    plane.rotateX(Math.PI / 2);
    getScene().add(plane);
    return plane;
}

export function makeTexture(nodes, edges) {
    const canvas = document.createElement('canvas');
    canvas.width = CONFIG.LAYER_WIDTH * CONFIG.TEXTURE_RES;
    canvas.height = CONFIG.LAYER_HEIGHT * CONFIG.TEXTURE_RES;

    const context = canvas.getContext('2d');
    context.fillStyle = CONFIG.TEXTURE_FILL;
    context.fillRect(0, 0, canvas.width, canvas.height);

    for (const e of edges) {
        let p1 = nodes.find(x => x.id === e.src);
        let x1 = p1['x'] * canvas.width;
        let y1 = p1['y'] * canvas.height;
        let p2 = nodes.find(x => x.id === e.dst);
        let x2 = p2['x'] * canvas.width;
        let y2 = p2['y'] * canvas.height;
        drawGradientEdge(context, x1, y1, x2, y2, e['type'], 8);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearMipMapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.anisotropy = getRenderer().capabilities.getMaxAnisotropy();

    return texture;
}

function drawGradientEdge(context, x1, y1, x2, y2, edgeType, lineWidth) {
    const gradient = context.createLinearGradient(x1, y1, x2, y2);
    gradient.addColorStop(0, CONFIG.COLORS['m']);
    gradient.addColorStop(1, CONFIG.COLORS[edgeType]);
    context.strokeStyle = gradient;
    context.lineWidth = lineWidth;
    context.lineCap = 'round';
    context.beginPath();
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.stroke();
}

export function makeLabelText(text, pos) {
    return makeText(48, 'center', 'center', text, pos.x, pos.y, pos.z);
}

export function makeReferenceText(text) {
    return makeText(64, 'left', 'center', text, 0, 0, 0);
}

function makeText(fontSize, textAlign, textBaseline, text, x, y, z) {
    // Create a canvas to draw the text
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    // Set canvas size and background
    canvas.width = 1024;
    canvas.height = 128;
    context.fillStyle = 'rgba(255, 255, 255, 0)';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.font = `${fontSize}px Tahoma`;
    context.fillStyle = 'black';
    context.textAlign = textAlign;
    context.textBaseline = textBaseline;
    context.fillText(text, canvas.width / 2, canvas.height / 2);

    // Create a texture from the canvas
    const texture = new THREE.CanvasTexture(canvas);
    texture.magFilter = THREE.LinearFilter;
    
    // Create a flat plane geometry
    const geometry = new THREE.PlaneGeometry(0.4, 0.05);
    const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, side: THREE.DoubleSide, alphaTest: 0.5 });
    const textMesh = new THREE.Mesh(geometry, material);

    // Render always on top
    textMesh.renderOrder = 999;
    textMesh.material.depthTest = false;
    textMesh.material.depthWrite = false;
    textMesh.onBeforeRender = function (renderer) { renderer.clearDepth(); };
    
    // Rotate the text 90 degrees around the Z-axis
    // textMesh.rotation.z = Math.PI / 2;

    // Position the text mesh
    textMesh.position.set(x, y, z);

    return textMesh;
}