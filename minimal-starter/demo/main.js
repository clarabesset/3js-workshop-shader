import * as THREE from 'three';
import { Pane } from 'tweakpane';

const pane = new Pane();

import vertexShader from './vertex.glsl';
import fragmentShader from './fragment.glsl';

let renderer = null;
let scene = null;
let camera = null;

let mesh = null;
let backgroundMaterial = null;

function init() {
  createRenderer();
  createScene();
  createCamera();
  createMesh();

  const params = {
    duration: 3.0,
    frequency: 10.0,
    sharpness: 0.8,
    width: 0.1,
  };

  pane.addBinding(params, 'duration', { min: 0.1, max: 10.0 }).on('change', ev => {
    backgroundMaterial.uniforms.u_ringDuration.value = ev.value;
  });

  pane.addBinding(params, 'frequency', { min: 1.0, max: 50.0 }).on('change', ev => {
    backgroundMaterial.uniforms.u_ringFrequency.value = ev.value;
  });

  pane.addBinding(params, 'sharpness', { min: 0.1, max: 5.0 }).on('change', ev => {
    backgroundMaterial.uniforms.u_ringSharpness.value = ev.value;
  });

  pane.addBinding(params, 'width', { min: 0.01, max: 1.0 }).on('change', ev => {
    backgroundMaterial.uniforms.u_ringWidth.value = ev.value;
  });

  animate();
}

function createRenderer() {
  renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#canvas'),
  });

  renderer.setSize(window.innerWidth, window.innerHeight);
}

let model = null;

function createCamera() {
  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 0.9;
  camera.position.y = 0;

  camera.lookAt(0, 0, 0);
}
function createScene() {
  scene = new THREE.Scene();
}

function createMesh() {
  const geometry = new THREE.PlaneGeometry(1, 1, 128, 128);

  backgroundMaterial = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      u_time: { value: 0 },
      u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
      u_clickTime: { value: 1.0 },
      u_clickOrigin: { value: new THREE.Vector2(0.5, 0.5) },
      u_ringDuration: { value: 3.0 },
      u_ringFrequency: { value: 50.0 },
      u_ringSharpness: { value: 0.8 },
      u_ringWidth: { value: 0.1 },
    },
  });

  mesh = new THREE.Mesh(geometry, backgroundMaterial);
  mesh.scale.set(window.innerWidth / window.innerHeight, 1, 1);
  scene.add(mesh);
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  backgroundMaterial.uniforms.u_time.value += 0.01;
}

window.addEventListener('click', e => {
  console.log('clicked');
  const x = e.clientX / window.innerWidth;
  const y = 1.0 - e.clientY / window.innerHeight;
  backgroundMaterial.uniforms.u_clickOrigin.value.set(x, y);
  backgroundMaterial.uniforms.u_clickTime.value = performance.now() * 0.001;
});

init();

console.log('Hello Three.js!');
