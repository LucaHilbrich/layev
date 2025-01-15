import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.136.0/build/three.module.js';
import { OrbitControls } from "https://cdn.skypack.dev/three@0.132.2/examples/jsm/controls/OrbitControls.js";

import { LayeredGraph } from './LayeredGraph.js';

// Configuration parameters
export let CONFIG = {
    'LAYER_WIDTH': 1,
    'LAYER_HEIGHT': 0.5,
    'LAYER_DISTANCE': 0.2,
    'TEXTURE_RES': 1024,
    'TEXTURE_FILL': 'rgba(30, 30, 30, 0.05)',
    'COLORS': {
        'sp': 'rgba(171, 206, 48, 1.0)',
        'sn': 'rgba(250, 26, 13, 1.0)',
        's': 'rgba(88, 180, 238, 1.0)',
        'a': 'rgba(255, 255, 255, 1.0)',
        'm': 'rgba(120, 120, 120, 1.0)'
    }
}

// Basic setup
const canvas = document.getElementById('threeCanvas');

const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);
renderer.setAnimationLoop(animate);
export function getRenderer() {
	return renderer;
}

const scene = new THREE.Scene();
export function getScene() {
	return scene;
}

const WIDTH = window.innerWidth / 500;
const HEIGHT = window.innerHeight / 500;
const camera = new THREE.OrthographicCamera( WIDTH / - 2, WIDTH / 2, HEIGHT / 2, HEIGHT / - 2, 1, 1000 );
camera.position.set(1, 0.7, 2);
camera.zoom = 2;
camera.updateProjectionMatrix();

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

// Initialize layered graph
export const layeredGraph = new LayeredGraph();

// Triggered when .dot file is uploaded
export function addToVisualization(dotName, dotFile) {
    layeredGraph.addLayer(dotName, dotFile);
}

// Triggered when .dot file is deleted
export function removeFromVisualization(dotName) {
    layeredGraph.removeLayer(dotName);
}

// Animation loop
function animate() {
    renderer.render(scene, camera);
}
