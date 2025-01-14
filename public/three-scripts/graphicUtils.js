import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.136.0/build/three.module.js';

import { CONFIG, getScene, getRenderer } from './main.js';


export function makePlane() {
    let plane = new THREE.Mesh(
        new THREE.PlaneGeometry(CONFIG.LAYER_WIDTH, CONFIG.LAYER_HEIGHT),
        new THREE.MeshBasicMaterial({ color: 'white', side: THREE.DoubleSide, alphaTest: 0.01, depthWrite: false })
    );
    plane.rotateX(Math.PI / 2);
    getScene().add(plane);
    return plane;
}

export function makeTexture(edges) {
    const canvas = document.createElement('canvas');
    canvas.width = CONFIG.LAYER_WIDTH * CONFIG.TEXTURE_RES;
    canvas.height = CONFIG.LAYER_HEIGHT * CONFIG.TEXTURE_RES;

    const context = canvas.getContext('2d');
    context.fillStyle = CONFIG.TEXTURE_FILL;
    context.fillRect(0, 0, canvas.width, canvas.height);

    for (const e of edges) {
        let p1 = {'x': Math.random(), 'y': Math.random()}; // multigraph.nodes.find(x => x.id === e.src); // TODO Insert correct point
        let x1 = p1['x'] * canvas.width;
        let y1 = p1['y'] * canvas.height;
        let p2 = {'x': Math.random(), 'y': Math.random()}; // multigraph.nodes.find(x => x.id === e.dst); // TODO Insert correct point
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

export function setAlpha(colorString, alpha) {
    const updatedColor = colorString.replace(/rgba\(([\d\s,]+),\s*\d*\.?\d*\)/, `rgba($1, ${alpha})`); 
    return updatedColor;
}
