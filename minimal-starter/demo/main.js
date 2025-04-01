import * as THREE from 'three';

import vertexShader from './vertex.glsl';
import fragmentShader from './fragment.glsl';

let renderer = null;
let scene = null;
let camera = null;

let scrollSpeedMultiplier = 1.0;
let targetScrollMultiplier = 1.0;

let mesh = null;
let backgroundMaterial = null;

function init() {
  createRenderer();
  createScene();
  createCamera();
  setBackgroundColor();

  animate();
}

function createRenderer() {
  renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#canvas'),
  });

  renderer.setSize(window.innerWidth, window.innerHeight);
}

function createCamera() {
  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 0.9;
  camera.position.y = 0;

  camera.lookAt(0, 0, 0);
}
function createScene() {
  scene = new THREE.Scene();
}

function setBackgroundColor() {
  let scrollTimeout;

  window.addEventListener('scroll', () => {
    targetScrollMultiplier = 8.0; // accélération temporaire
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      targetScrollMultiplier = 1.0; // retour à la normale après un petit délai sans scroll
    }, 200);
  });

  window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    backgroundMaterial.uniforms.u_resolution.value.set(
      renderer.domElement.width,
      renderer.domElement.height
    );
    mesh.scale.set(window.innerWidth / window.innerHeight, 1, 1);
  });

  const geometry = new THREE.PlaneGeometry(1.1, 1.1, 128, 128);
  backgroundMaterial = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      u_time: { value: 0 },
      u_resolution: {
        value: new THREE.Vector2(window.innerWidth, window.innerHeight),
      },
    },
  });
  mesh = new THREE.Mesh(geometry, backgroundMaterial);
  mesh.scale.set(window.innerWidth / window.innerHeight, 1, 1);
  scene.add(mesh);
}

function animate() {
  requestAnimationFrame(animate);

  // interpolation douce vers la vitesse cible
  scrollSpeedMultiplier += (targetScrollMultiplier - scrollSpeedMultiplier) * 0.1;

  backgroundMaterial.uniforms.u_time.value += 0.001 * scrollSpeedMultiplier;

  backgroundMaterial.uniforms.u_resolution.value.set(
    renderer.domElement.width,
    renderer.domElement.height
  );

  renderer.render(scene, camera);
}

init();

console.log('Hello Three.js!');
