import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { LayeredGraph } from './LayeredGraph.js';
import { getChecked } from '../scripts/filter.js';
import { getFixedNodeConstraint } from '../scripts/nodeLock.js';

// Configuration parameters
export let CONFIG = {
    'LAYER_WIDTH': 1,
    'LAYER_HEIGHT': 0.5,
    'LAYER_DISTANCE': 0.2,
    'TEXTURE_RES': 1024,
    'TEXTURE_FILL': 'rgba(30, 30, 30, 0.05)',
    'NODE_PADDING': 20,
    'EDGE_WIDTH': 4,
    'COLORS': {
        'sp': 'rgba(171, 206, 48, 1.0)',
        'sn': 'rgba(250, 26, 13, 1.0)',
        's': 'rgba(88, 180, 238, 1.0)',
        'a': 'rgba(140, 140, 140, 1.0)',
        'm': 'rgba(180, 180, 180, 1.0)'
    }
}

// Basic setup
const renderSpace = document.getElementById('renderSpace');
const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(renderSpace.clientWidth, renderSpace.clientHeight);
renderer.setAnimationLoop(animate);
renderSpace.appendChild( renderer.domElement );
export function getRenderer() {
	return renderer;
}

const scene = new THREE.Scene();
export function getScene() {
	return scene;
}

const WIDTH = renderSpace.clientWidth / 500;
const HEIGHT = renderSpace.clientHeight / 500;
const camera = new THREE.OrthographicCamera( WIDTH / - 2, WIDTH / 2, HEIGHT / 2, HEIGHT / - 2, 1, 1000 );
camera.position.set(0, 6, 0);
camera.zoom = 2.5;
camera.updateProjectionMatrix();
export function getCamera() {
	return camera;
}

const controls = new OrbitControls( camera, renderer.domElement );
controls.maxPolarAngle = Math.PI * 0.5;
controls.minDistance = 1;
controls.maxDistance = 8;
controls.enableDamping = true;

// Resizing TODO: Fix canvas resize bug
// window.addEventListener('resize', resizeRenderer, false);
// function resizeRenderer() {
//     const canvas = renderer.domElement;
//     // look up the size the canvas is being displayed
//     const width = canvas.clientWidth;
//     const height = canvas.clientHeight;

//     // adjust displayBuffer size to match
//     if (canvas.width !== width || canvas.height !== height) {
//         // you must pass false here or three.js sadly fights the browser
//         renderer.setSize(width, height, false);
//         camera.aspect = width / height;
//         camera.updateProjectionMatrix();

//         // update any render target sizes here
//     }
//     console.log('CALLES')
// }

// Initialize layered graph
export const layeredGraph = new LayeredGraph();

// Triggered when .dot file is uploaded
export function addToVisualization(dotName, dotFile) {
    layeredGraph.addLayer(dotName, dotFile, getChecked());
}

// Triggered when .dot file is deleted
export function removeFromVisualization(dotName) {
    layeredGraph.removeLayer(dotName, getChecked());
}

export function updateNodeLocking() {
    layeredGraph.setLayout(getFixedNodeConstraint());
    layeredGraph.updateLayerPositions();
    layeredGraph.updateLayerTextures(getChecked());
}

// Animation loop
function animate() {
    controls.update();
    layeredGraph.updateLayerLabels();
    layeredGraph.updateIntegratedLayerOpacity();
    renderer.render(scene, camera);

    if(controls.getPolarAngle() > 1.4) {
        layeredGraph.rotateLabelsToAngledPos();
    } else {
        layeredGraph.rotateLabelsToNormalPos();
    }
}
