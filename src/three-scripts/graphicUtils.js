import * as THREE from 'three';
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

export function makeTexture(nodes, edges, checkedEdges=['sp', 'sn', 's', 'a', 'm']) {
    const canvas = document.createElement('canvas');
    canvas.width = CONFIG.LAYER_WIDTH * CONFIG.TEXTURE_RES;
    canvas.height = CONFIG.LAYER_HEIGHT * CONFIG.TEXTURE_RES;

    const context = canvas.getContext('2d');
    context.fillStyle = CONFIG.TEXTURE_FILL;
    context.fillRect(0, 0, canvas.width, canvas.height);

    for (const e of edges) {
        if (checkedEdges.includes(e.type)) {
            let p1 = nodes.find(x => x.id === e.src);
            let x1 = p1['x'] * canvas.width;
            let y1 = p1['y'] * canvas.height;
            let p2 = nodes.find(x => x.id === e.dst);
            let x2 = p2['x'] * canvas.width;
            let y2 = p2['y'] * canvas.height;
            drawGradientEdge(context, x1, y1, x2, y2, e['type'], CONFIG.EDGE_WIDTH);
        }
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

export function makeLabelText(text) {
    return makeText(8, 'center', 'center', text, 0, 0, 0);
}

export function makeReferenceText(text) {
    return makeText(16, 'left', 'center', text, 0, 0, 0);
}

export function makeText(fontSize, textAlign, textBaseline, text, x, y, z) {
    // Super-sampling factor (increase for higher resolution)
    const resolutionFactor = 12;

    // Create a canvas to draw the text
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    // Set the font for measuring text
    const scaledFontSize = fontSize * resolutionFactor;
    context.font = `bold ${scaledFontSize}px Montserrat`;

    // Measure the text dimensions
    const textWidth = context.measureText(text).width;
    const textHeight = scaledFontSize * 1.2;

    // Adjust canvas size for high resolution
    canvas.width = Math.ceil(textWidth);
    canvas.height = Math.ceil(textHeight);

    // Reapply font and styles after resizing the canvas
    context.font = `${scaledFontSize}px Montserrat`;
    context.textAlign = textAlign;
    context.textBaseline = textBaseline;

    // Optionally fill the background for debugging
    context.fillStyle = 'rgba(255, 0, 0, 0)';
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Draw the text
    context.shadowColor = 'rgba(0, 0, 0, 0.3)';
    context.shadowBlur = 4;
    context.fillStyle = 'black';
    const xOffset = textAlign === 'center' ? canvas.width / 2 : textAlign === 'right' ? canvas.width : 0;
    const yOffset = textBaseline === 'middle' ? canvas.height / 2 : textBaseline === 'bottom' ? canvas.height : scaledFontSize;
    context.fillText(text, xOffset, yOffset);

    // Create a texture from the high-resolution canvas
    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.NearestFilter;
    texture.generateMipmaps = false;
    texture.anisotropy = getRenderer().capabilities.getMaxAnisotropy();

    // Downscale the plane geometry to match the original font size
    const geometry = new THREE.PlaneGeometry(
        (canvas.width / resolutionFactor) / 500,
        (canvas.height / resolutionFactor) / 500
    );

    const material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        side: THREE.DoubleSide,
        alphaTest: 0.1
    });

    // Create the mesh
    const textMesh = new THREE.Mesh(geometry, material);

    // Ensure it renders always on top
    textMesh.renderOrder = 999;
    textMesh.material.depthTest = false;
    textMesh.material.depthWrite = false;
    textMesh.onBeforeRender = function (renderer) { renderer.clearDepth(); };

    // Rotate the text 90 degrees around the Z-axis
    // textMesh.rotation.z = Math.PI / 4;
    // textMesh.updateMatrix();
    // textMesh.geometry.applyMatrix4(textMesh.matrix);
    // textMesh.rotation.set(0, 0, 0);
    // textMesh.quaternion.identity();
    // textMesh.position.set(0, 0, 0);
    // textMesh.updateMatrix();

    // Position the text mesh
    textMesh.position.set(x, y, z);

    return textMesh;
}

export function createDot() {
    const points = [new THREE.Vector3(0, 0, 0)];
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.PointsMaterial({
        color: '#000000',
        size: 5,
        transparent: true,
        depthTest: false,
        depthWrite: false,
    });
    const dot = new THREE.Points(geometry, material);
    dot.renderOrder = Infinity;
    return dot;
}

export function createLine(x=0, y=0, z=0, height=0) {
    const points = [
        new THREE.Vector3(x, y, z),
        new THREE.Vector3(x, y + height, z)
    ];
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.PointsMaterial({
        color: '#000000',
        size: 5,
        transparent: true,
        depthTest: false,
        depthWrite: false,
    });
    const line = new THREE.Line(geometry, material);
    return line;
}

export function makeIntegratedGraphVisualization(layers, checkedEdges=['sp', 'sn', 's', 'a', 'm']) {

    // Analyzes significant edges
    let significantEdges = [];
    layers.forEach((layer, name) => {
        for (const e of layer.edges) {
            if (checkedEdges.includes(e.type)) {
                const idx = significantEdges.findIndex(x => x.src === e.src && x.dst === e.dst);
                if (idx >= 0) {
                    significantEdges[idx]['n'] += 1;
                    let col = rgbaToArray(CONFIG.COLORS[e.type]);
                    significantEdges[idx].col[0] += col[0];
                    significantEdges[idx].col[1] += col[1];
                    significantEdges[idx].col[2] += col[2];
                    significantEdges[idx].col[3] += col[3];
                } else {
                    let temp = {'src': e.src, 'dst': e.dst, 'n': 1, 'col': rgbaToArray(CONFIG.COLORS[e.type])};
                    significantEdges.push(temp);
                }
            }
        }
    });
    let nMax = 0;
    for (let e of significantEdges) {
        if (e['n'] > nMax) {
            nMax = e['n'];
        }
    }
    for (let i = 0; i < significantEdges.length; i++) {
        significantEdges[i]['col'][0] /= significantEdges[i]['n'];
        significantEdges[i]['col'][1] /= significantEdges[i]['n'];
        significantEdges[i]['col'][2] /= significantEdges[i]['n'];
        significantEdges[i]['col'][3] /= significantEdges[i]['n'];
        // significantEdges[i]['n'] /= nMax;
    }

    // Make shape
    let shape = new THREE.Mesh(
        new THREE.PlaneGeometry(CONFIG.LAYER_WIDTH, CONFIG.LAYER_HEIGHT),
        new THREE.MeshBasicMaterial({ color: 'white', side: THREE.DoubleSide, alphaTest: 0.01, depthWrite: false })
    );
    shape.rotateX(Math.PI / 2);
    shape.position.set(0, layers.size * CONFIG.LAYER_DISTANCE - (layers.size * CONFIG.LAYER_DISTANCE / 2), 0);

    // Make texture
    const canvas = document.createElement('canvas');
    canvas.width = CONFIG.LAYER_WIDTH * 1024;
    canvas.height = CONFIG.LAYER_HEIGHT * 1024;
    const context = canvas.getContext('2d');
    context.fillStyle = 'rgba(240, 240, 240, 1)';
    context.fillRect(0, 0, canvas.width, canvas.height);


    let nodes = new Set();
    layers.forEach((layer, name) => {
        for (const n of layer.nodes) {
            nodes.add(n);
        }
    });
    nodes = Array.from(nodes);

    for (let e of significantEdges) {
        let p1 = nodes.find(x => x.id === e.src);
        let x1 = p1['x'] * canvas.width;
        let y1 = p1['y'] * canvas.height;
        let p2 = nodes.find(x => x.id === e.dst);
        let x2 = p2['x'] * canvas.width;
        let y2 = p2['y'] * canvas.height;
        drawIntegratedGradientEdge(context, x1, y1, x2, y2, `rgba(${e['col'][0]}, ${e['col'][1]}, ${e['col'][2]}, ${e['col'][3]})`, e['n'] * 2);
    }
    
    let texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearMipMapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.anisotropy = getRenderer().capabilities.getMaxAnisotropy();

    // Apply texture
    shape.material.map = texture;
    shape.material.transparent = true;
    shape.material.needsUpdate = true;

    return [shape, significantEdges];
}

function drawIntegratedGradientEdge(context, x1, y1, x2, y2, col, lineWidth) {
    const gradient = context.createLinearGradient(x1, y1, x2, y2);
    gradient.addColorStop(0, CONFIG.COLORS['m']);
    gradient.addColorStop(1, col);
    context.strokeStyle = gradient;
    context.lineWidth = lineWidth;
    context.lineCap = 'round';
    context.beginPath();
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.stroke();
}

function rgbaToArray(colorString) {
    const rgbaMatch = colorString.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
    
    if (rgbaMatch) {
        let r = parseInt(rgbaMatch[1], 10);
        let g = parseInt(rgbaMatch[2], 10);
        let b = parseInt(rgbaMatch[3], 10);
        let alpha = rgbaMatch[4] ? parseFloat(rgbaMatch[4]) : 1; // Default alpha is 1 if not provided
        
        return [r, g, b, alpha];
    } else {
        throw new Error("Invalid RGBA color string");
    }
}
