import * as THREE from 'three';
import { Pane } from 'tweakpane';

import P5 from 'p5';

import vertexShader from './vertex.glsl';
import fragmentShader from './fragment.glsl';

import { sketch } from './sketch';

let renderer = null;
let scene = null;
let camera = null;

let p5Mesh = null;
let mesh = null;

function init() {
  const renderer = createRenderer();
  const scene = createScene();
  const camera = createCamera();
  createMesh();
  createP5Mesh();

  animate();
}

function createRenderer() {
  renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#canvas'),
  });

  renderer.setSize(window.innerWidth, window.innerHeight);

  return renderer;
}

let model = null;
let backgroundMaterial = null;

function createCamera() {
  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 0.9;
  camera.position.y = 0;

  camera.lookAt(0, 0, 0);
}

function createScene() {
  scene = new THREE.Scene();
  return scene;
}

function createMesh() {
  const geometry = new THREE.PlaneGeometry(1, 1, 128, 128);

  backgroundMaterial = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      proseColors: {
        value: [
          // new THREE.Vector3(Math.random(), Math.random(), Math.random()),
          new THREE.Color('#EAD7F3'),
          new THREE.Color('#BBACC2'),
          new THREE.Color('#B9C2A6'),
          new THREE.Color('#4D523C'),
          new THREE.Color('#ECFF92'),
          new THREE.Color('#F69371'),
          new THREE.Color('#C5765A'),
        ],
      },
      circles: {
        value: Array.from({ length: 15 }).map(
          () => new THREE.Vector2(Math.random(), Math.random())
        ),
      },
      u_time: {
        value: 0.0,
      },
    },
  });

  mesh = new THREE.Mesh(geometry, backgroundMaterial);
  mesh.scale.set(window.innerWidth / window.innerHeight, 1, 1);
  scene.add(mesh);
  return mesh;
}

function createDebugger() {
  const pane = new Pane();
  const folder = pane.addFolder({ title: 'Mesh', expanded: true });
  folder.addBinding(mesh, 'rotation', { label: 'Rotation' });
  folder.addBinding(mesh.material, 'aoMapIntensity', {
    label: 'AO Map Intensity',
  });
}
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  backgroundMaterial.uniforms.u_time.value += 0.01;

  // p5Mesh.rotation.y += 0.01;
}

function createP5Mesh() {
  const p = new P5(sketch, document.querySelector('body')!);

  setTimeout(() => {
    const p5canvas = document.querySelector('#defaultCanvas0')!;
    console.log('p5canvas', p5canvas);

    const geo = new THREE.PlaneGeometry();
    const texture = new THREE.CanvasTexture(p5canvas);
    const mat = new THREE.MeshBasicMaterial({
      color: new THREE.Color('white'),
      side: THREE.DoubleSide,
      map: texture,
      opacity: 0.3,
      transparent: true,
    });

    mat.needsUpdate = true;

    p5Mesh = new THREE.Mesh(geo, mat);
    p5Mesh.scale.set(0.18, 0.18, 1);
    p5Mesh.position.set(0.4, 0.4, 0);
    scene.add(p5Mesh);
  }, 200);
}

init();

console.log('Hello Three.js!');
