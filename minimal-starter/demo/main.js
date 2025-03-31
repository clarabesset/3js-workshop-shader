import * as THREE from 'three';

const textureLoader = new THREE.TextureLoader();



let renderer = null
let scene = null
let camera = null

let mesh = null

let albedoTexture = null;

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

function createLoader() {
    textureLoader.load('albedo.png', (texture) => {
        albedoTexture = texture;
        createMesh();
    })
}
function createCamera() {
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000)
    camera.position.z = 5
}
function createScene() {
    scene = new THREE.Scene()
}

function createMesh() {
    const geometry = new THREE.BoxGeometry(1, 1, 1)
    const material = new THREE.MeshStandardMaterial({ 
        color: new THREE.Color('#ff0000'), 
        map: albedoTexture,
    })
    
    mesh = new THREE.Mesh(geometry, material)
    
    scene.add(mesh)
}

function createLights() {
    const ambientLight = new THREE.AmbientLight(new THREE.Color('#ffffff'), 2) // soft white light
    scene.add(ambientLight)
    
    const directionalLight = new THREE.DirectionalLight(new THREE.Color('#ffffff'), 1)
    directionalLight.position.set(10, 10, 0)
    scene.add(directionalLight)
}

function animate() {
    requestAnimationFrame(animate)

    if(mesh) {
        mesh.rotation.x += 0.01
        mesh.rotation.y += 0.01
    }
    renderer.render(scene, camera)
}

init()

// // Handle window resize
// window.addEventListener('resize', () => {
//   renderer.setSize(window.innerWidth, window.innerHeight);
//   camera.aspect = window.innerWidth / window.innerHeight;
//   camera.updateProjectionMatrix();
// });
