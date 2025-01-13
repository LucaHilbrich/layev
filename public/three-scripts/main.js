import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.136.0/build/three.module.js';
import { OrbitControls } from "https://cdn.skypack.dev/three@0.132.2/examples/jsm/controls/OrbitControls.js";


// Basic setup
const canvas = document.getElementById('threeCanvas');

const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);
renderer.setAnimationLoop(animate);

const scene = new THREE.Scene();

const WIDTH = window.innerWidth / 500;
const HEIGHT = window.innerHeight / 500;
const camera = new THREE.OrthographicCamera( WIDTH / - 2, WIDTH / 2, HEIGHT / 2, HEIGHT / - 2, 1, 1000 );
camera.position.z = 2;

const controls = new OrbitControls( camera, renderer.domElement );
controls.maxPolarAngle = Math.PI * 0.5;
controls.minDistance = 1;
controls.maxDistance = 8;

// Resizing TODO: Fix canvas resize bug
window.addEventListener('resize', resizeRenderer, false);
function resizeRenderer() {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    const pixelRatio = window.devicePixelRatio || 1;
    renderer.setSize(width * pixelRatio, height * pixelRatio, false);
    renderer.setPixelRatio(pixelRatio);
}

let layers = {};
// Triggered when .dot file is uploaded
export function addToVisualization(dotName, dotFile) {
    const l = new Layer(dotFile);
    l.createLayer();

    layers[dotName] = l;
    updateLayers();
}

// Triggered when .dot file is deleted
export function removeFromVisualization(dotName) {
    layers[dotName].removeLayer();
    delete layers[dotName];
    updateLayers();
}

function updateLayers() {
    for (const [index, [name, layer]] of Object.entries(Object.entries(layers))) {
        layer.updatePosition(index);
    }
}

// Animation loop
function animate() {
    renderer.render(scene, camera);
}


//////////////////////////////////////////////////////////////////////////////////////////////////

const LAYER_WIDTH = 1;
const LAYER_HEIGHT = 0.5;
const LAYER_DISTANCE = 0.2;
const TEXTURE_RES = 1024;
const TEXTURE_FILL = 'rgba(30, 30, 30, 0.02)';
const COLORS = {
    'sp': 'rgba(171, 206, 48)',
    'sn': 'rgba(250, 26, 13)',
    's': 'rgba(88, 180, 238)',
    'a': 'rgba(255, 255, 255, 0.5)',
    'm': 'rgba(120, 120, 120, 0.5)'
}

//////////////////////////////////////////////////////////////////////////////////////////////////

class Layer {
    constructor(dotFile) {
        const dotContents = parseDot(dotFile);
        this.name = dotContents.name;
        this.nodes = dotContents.nodes;
        this.edges = dotContents.edges;
    }

    createLayer() {
        this.plane = makePlane();
        this.texture = makeTexture(this.edges);
        this.plane.material.map = this.texture;
        this.plane.material.transparent = true;
        this.plane.material.needsUpdate = true;
        scene.add(this.plane);
    }

    updatePosition(index) {
        this.plane.position.set(0, index * LAYER_DISTANCE - (Object.keys(layers).length * LAYER_DISTANCE / 2), 0);
    }

    removeLayer() {
        scene.remove(this.plane);
    }
}

function parseDot(dotFile) {
    const graphNameRegex = /digraph\s+(\w+)\s*\{/;
    const edgeRegex = /"(\w+)"\s*->\s*"(\w+)"\s*\[type="(\w+)"\]/g;

    const graphNameMatch = dotFile.match(graphNameRegex);
    const graphName = graphNameMatch ? graphNameMatch[1] : null;

    const edges = [];
    const nodes = new Set();
    
    let match;
    while ((match = edgeRegex.exec(dotFile)) !== null) {
        const start = match[1];
        const end = match[2];
        const type = match[3];

        edges.push({ start, end, type });

        nodes.add(start);
        nodes.add(end);
    }

    return {
        name: graphName,
        nodes: Array.from(nodes),
        edges,
    };
}

function makePlane() {
    let plane = new THREE.Mesh(
        new THREE.PlaneGeometry(LAYER_WIDTH, LAYER_HEIGHT),
        new THREE.MeshBasicMaterial({ color: 'white', side: THREE.DoubleSide, alphaTest: 0.01, depthWrite: false })
    );
    plane.rotateX(Math.PI / 2);
    scene.add(plane);
    return plane;
}

function makeTexture(edges) {
    const canvas = document.createElement('canvas');
    canvas.width = LAYER_WIDTH * TEXTURE_RES;
    canvas.height = LAYER_HEIGHT * TEXTURE_RES;

    const context = canvas.getContext('2d');
    context.fillStyle = TEXTURE_FILL;
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
    texture.anisotropy = renderer.capabilities.getMaxAnisotropy();

    return texture;
}

function updateTexture() {

}

function drawGradientEdge(context, x1, y1, x2, y2, edgeType, lineWidth) {
    const gradient = context.createLinearGradient(x1, y1, x2, y2);
    gradient.addColorStop(0, COLORS['m']);
    gradient.addColorStop(1, COLORS[edgeType]);
    context.strokeStyle = gradient;
    context.lineWidth = lineWidth;
    context.lineCap = 'round';
    context.beginPath();
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.stroke();
}
