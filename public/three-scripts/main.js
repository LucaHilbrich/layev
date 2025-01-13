import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.136.0/build/three.module.js';

// Basic setup
const canvas = document.getElementById('threeCanvas');
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);
renderer.setAnimationLoop(animate);
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, canvas.offsetWidth / canvas.offsetHeight, 0.1, 1000);

// Resizing TODO: Fix canvas size bug
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

// Add a cube
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial({ color: 'rgba(88, 180, 238)' });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// Position the camera
camera.position.z = 5;

// Animation loop
function animate() {
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    renderer.render(scene, camera);
}
