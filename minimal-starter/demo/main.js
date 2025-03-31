import * as THREE from 'three';
import { Pane } from 'tweakpane';

const textureLoader = new THREE.TextureLoader();



let renderer = null
let scene = null
let camera = null

let mesh = null


function init() {
    createRenderer()
    createScene()
    createCamera()
    createLights()
    createLoader()
    
    animate()
}

function createRenderer() {
    renderer = new THREE.WebGLRenderer({
        canvas: document.querySelector('#canvas'),
    })
    
    renderer.setSize(window.innerWidth, window.innerHeight)
}

let albedoTexture = null;
let normalTexture = null;
let aoTexture = null;
let roughnessTexture = null;
let heightTexture = null;

async function createLoader() {
    albedoTexture = await textureLoader.load('albedo.png')
    normalTexture = await textureLoader.load('normal.png')
    aoTexture = await textureLoader.load('ao.png')
    roughnessTexture = await textureLoader.load('roughness.png')
    heightTexture = await textureLoader.load('height.png')
    createMesh();

    createDebugger()
}

function createCamera() {
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000)
    camera.position.z = 15
    camera.position.y = 14

    camera.lookAt(0, 0, 0)
}
function createScene() {
    scene = new THREE.Scene()
}

function createMesh() {
    const geometry = new THREE.PlaneGeometry(1, 1, 128, 128)
    const material = new THREE.MeshStandardMaterial({ 
        map: albedoTexture,
        normalMap: normalTexture,
        normalScale: new THREE.Vector2(10, 10),
        aoMap: aoTexture,
        aoMapIntensity : 1,
        roughnessMap: roughnessTexture,
        displacementMap: heightTexture,
        displacementScale: 0.1,
    })
    
    mesh = new THREE.Mesh(geometry, material)
    mesh.rotation.x = -Math.PI / 2
    mesh.scale.set(20, 20, 20)
    scene.add(mesh)
}

function createLights() {
    const ambientLight = new THREE.AmbientLight(new THREE.Color('#ffffff'), 2) // soft white light
    scene.add(ambientLight)
    
    const directionalLight = new THREE.DirectionalLight(new THREE.Color('#ffffff'), 1)
    directionalLight.position.set(10, 10, 0)
    scene.add(directionalLight)
}

function createDebugger() {
    const pane = new Pane()
    const folder = pane.addFolder({ title: 'Mesh', expanded: true })
    folder.addBinding(mesh, 'rotation', { label: 'Rotation'})
    folder.addBinding(mesh.material, 'aoMapIntensity', { label: 'AO Map Intensity' })
}
function animate() {
    requestAnimationFrame(animate)

    renderer.render(scene, camera)
}

init()

// // Handle window resize
// window.addEventListener('resize', () => {
//   renderer.setSize(window.innerWidth, window.innerHeight);
//   camera.aspect = window.innerWidth / window.innerHeight;
//   camera.updateProjectionMatrix();
// });
