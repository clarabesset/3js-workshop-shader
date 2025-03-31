import * as THREE from "three";
import { Pane } from "tweakpane";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";

import vertexShader from "./vertex.glsl";
import fragmentShader from "./fragment.glsl";

const textureLoader = new THREE.TextureLoader();
const gltfLoader = new GLTFLoader();
const dracoLoader = createDracoLoader();
gltfLoader.setDRACOLoader(dracoLoader);

function createDracoLoader() {
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath(
    "https://www.gstatic.com/draco/versioned/decoders/1.5.5/"
  );
  dracoLoader.setDecoderConfig({ type: "js" });
  return dracoLoader;
}

let renderer = null;
let scene = null;
let camera = null;

let mesh = null;

function init() {
  createRenderer();
  createScene();
  createCamera();
  createLights();
  createLoader();

  animate();
}

function createRenderer() {
  renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector("#canvas"),
  });

  renderer.setSize(window.innerWidth, window.innerHeight);
}

let model = null;
let albedoTexture = null;
let normalTexture = null;
let aoTexture = null;
let roughnessTexture = null;
let heightTexture = null;

async function createLoader() {
  gltfLoader.load("monkey-compressed.glb", async (result) => {
    model = result.scene;

    createMesh();
    // createMonkey();
    createDebugger();
  });
}

function createCamera() {
  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.z = 0.9;
  camera.position.y = 0;

  camera.lookAt(0, 0, 0);
}
function createScene() {
  scene = new THREE.Scene();
}

function createMesh() {
  const geometry = new THREE.PlaneGeometry(1, 1, 128, 128);

  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      u_time: {
        value: 0.0,
      },
    },
  });

  mesh = new THREE.Mesh(geometry, material);
  mesh.scale.set(window.innerWidth / window.innerHeight, 1, 1);
  scene.add(mesh);
}

function createLights() {
  const ambientLight = new THREE.AmbientLight(new THREE.Color("#ffffff"), 2); // soft white light
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(
    new THREE.Color("#ffffff"),
    1
  );
  directionalLight.position.set(10, 10, 0);
  scene.add(directionalLight);
}

function createDebugger() {
  const pane = new Pane();
  const folder = pane.addFolder({ title: "Mesh", expanded: true });
  folder.addBinding(mesh, "rotation", { label: "Rotation" });
  folder.addBinding(mesh.material, "aoMapIntensity", {
    label: "AO Map Intensity",
  });
}
function animate() {
  requestAnimationFrame(animate);
  model.rotation.y += 0.01;
  renderer.render(scene, camera);
  if (material.uniforms.u_time.value) {
    material.uniforms.u_time.value -= 2;
  }
}

init();

// // Handle window resize
// window.addEventListener('resize', () => {
//   renderer.setSize(window.innerWidth, window.innerHeight);
//   camera.aspect = window.innerWidth / window.innerHeight;
//   camera.updateProjectionMatrix();
// });

console.log('Hello Three.js!');
