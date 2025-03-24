// Import necessary Three.js modules
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { PMREMGenerator, MeshPhysicalMaterial } from 'three';
import settings from './settings.js';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Import Tweakpane
import { Pane } from 'tweakpane';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// Global variables
let scene, camera, renderer;
let directionalLight, ambientLight;
let materials;
let envMap;
let labelMaterial; // Add a reference to the label material
let customName = 'Dreya'; // Add a variable to store the custom name
let model; // Reference to the loaded model
let lenis; // Reference to Lenis for smooth scrolling

// Object coordinates for scrolling animation
const defaultCoordinates = {
  position: { x: 0, y: -2, z: 0 },
  rotation: { x: 0, y: 0, z: 0 },
};

const objectCoordinates = {
  position: { x: 0, y: -2, z: 0 },
  rotation: { x: 0, y: 0, z: 0 },
};

// Added animations for subtle movement
const addedRotation = {
  x: 0,
  y: 0,
  z: 0,
};

const addedPosition = {
  x: 0,
  y: 0,
  z: 0,
};

// Mouse tracking for interactive movement
const mouse = { x: 0, y: 0 };
const mouseTarget = { x: 0.5 * window.innerWidth, y: 0.5 * window.innerHeight };

// Initialize the scene
function initScene() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xdcccbd);
}

// Initialize Lenis for smooth scrolling
function initLenis() {
  lenis = new Lenis({
    duration: 2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    smoothTouch: false,
    touchMultiplier: 2,
  });

  // Connect Lenis to requestAnimationFrame for smooth scrolling
  function raf(time) {
    lenis.raf(time);
    ScrollTrigger.update();
    requestAnimationFrame(raf);
    
    // Update mouse movement
    mouse.x += (mouseTarget.x - mouse.x) * 0.02;
    mouse.y += (mouseTarget.y - mouse.y) * 0.02;
    
    // Apply animations to model if it exists
    if (model) {
      applyModelAnimations();
    }
  }
  
  requestAnimationFrame(raf);
}

// Apply all animations to the model
function applyModelAnimations() {
  // Apply base coordinates from scroll
  const responsiveFactor = window.innerWidth < 800 ? 0.5 : 1;
  
  // Position adjustments
  model.position.x = objectCoordinates.position.x * responsiveFactor + 
                      0.00001 * (mouse.x - 0.5 * window.innerWidth) + 
                      addedPosition.x;
  
  model.position.y = objectCoordinates.position.y + 
                      0.00001 * (mouse.y - 0.5 * window.innerHeight) + 
                      addedPosition.y;
  
  model.position.z = objectCoordinates.position.z + addedPosition.z;
  
  // Rotation adjustments
  model.rotation.x = objectCoordinates.rotation.x - 
                      0.0005 * (mouse.y - 0.5 * window.innerHeight) + 
                      addedRotation.x;
  
  model.rotation.y = objectCoordinates.rotation.y - 
                      0.0005 * (mouse.x - 0.5 * window.innerWidth) + 
                      addedRotation.y;
  
  model.rotation.z = objectCoordinates.rotation.z + addedRotation.z;
}

// Initialize ScrollTriggers for scroll-based animations
function initScrollTriggers() {
  const sections = document.querySelectorAll('.section');
  
  sections.forEach((section, index) => {
    // Create a ScrollTrigger for each section
    ScrollTrigger.create({
      trigger: section,
      start: index === 0 ? 'center center' : 'top center',
      end: index === sections.length - 1 ? 'center center' : 'bottom center',
      scrub: true,
      onEnter: () => {
        // Update the label when entering a new section
        if (labelMaterial) {
          const sectionName = section.dataset.labelName || 'Dreya';
          if (customName !== sectionName) {
            customName = sectionName;
            labelMaterial.map = createLabelTexture(customName);
            labelMaterial.needsUpdate = true;
          }
        }
      },
      onUpdate: (self) => {
        const rawProgress = self.progress;
        // Use GSAP's easing for smoother transitions
        const progress = gsap.parseEase("power4.inOut")(rawProgress);
        
        // Calculate and apply rotation values
        updateObjectRotation(index, progress, sections);
        
        // Calculate and apply position values
        updateObjectPosition(index, progress, sections);
      },
    });
  });
}

// Update object rotation based on scroll progress
function updateObjectRotation(index, progress, sections) {
  // Get current rotation values
  const currentRotationX = (index === 0 
    ? defaultCoordinates.rotation.x 
    : parseFloat(sections[index - 1].dataset.rotationX)) || defaultCoordinates.rotation.x;
    
  const currentRotationY = (index === 0 
    ? defaultCoordinates.rotation.y 
    : parseFloat(sections[index - 1].dataset.rotationY)) || defaultCoordinates.rotation.y;
    
  const currentRotationZ = (index === 0 
    ? defaultCoordinates.rotation.z 
    : parseFloat(sections[index - 1].dataset.rotationZ)) || defaultCoordinates.rotation.z;
  
  // Get target rotation values
  const nextRotationX = parseFloat(sections[index].dataset.rotationX) || defaultCoordinates.rotation.x;
  const nextRotationY = parseFloat(sections[index].dataset.rotationY) || defaultCoordinates.rotation.y;
  const nextRotationZ = parseFloat(sections[index].dataset.rotationZ) || defaultCoordinates.rotation.z;
  
  // Apply interpolated rotation
  gsap.to(objectCoordinates.rotation, {
    x: gsap.utils.interpolate(currentRotationX, nextRotationX, progress),
    y: gsap.utils.interpolate(currentRotationY, nextRotationY, progress),
    z: gsap.utils.interpolate(currentRotationZ, nextRotationZ, progress),
    duration: 0.1,     // Add a small duration for smoother transitions
    overwrite: true  
  });
}

// Update object position based on scroll progress
function updateObjectPosition(index, progress, sections) {
  // Get current position values
  const currentPositionX = (index === 0 
    ? defaultCoordinates.position.x 
    : parseFloat(sections[index - 1].dataset.positionX)) || defaultCoordinates.position.x;
    
  const currentPositionY = (index === 0 
    ? defaultCoordinates.position.y 
    : parseFloat(sections[index - 1].dataset.positionY)) || defaultCoordinates.position.y;
    
  const currentPositionZ = (index === 0 
    ? defaultCoordinates.position.z 
    : parseFloat(sections[index - 1].dataset.positionZ)) || defaultCoordinates.position.z;
  
  // Get target position values
  const nextPositionX = parseFloat(sections[index].dataset.positionX) || defaultCoordinates.position.x;
  const nextPositionY = parseFloat(sections[index].dataset.positionY) || defaultCoordinates.position.y;
  const nextPositionZ = parseFloat(sections[index].dataset.positionZ) || defaultCoordinates.position.z;
  
  // Apply responsive factor for smaller screens
  const responsiveFactor = window.innerWidth < 800 ? 0.5 : 1;
  
  // Apply interpolated position
  gsap.to(objectCoordinates.position, {
    x: responsiveFactor * gsap.utils.interpolate(currentPositionX, nextPositionX, progress),
    y: gsap.utils.interpolate(currentPositionY, nextPositionY, progress),
    z: gsap.utils.interpolate(currentPositionZ, nextPositionZ, progress),
    duration: 0.1,     // Add a small duration for smoother transitions
    overwrite: true  
  });
  
  // Update label name based on current section
  // Only update when progress is near 1 to avoid constant texture updates
  if (progress > 0.9 && labelMaterial) {
    // Get the name from the section's data attribute or use a default
    const sectionName = sections[index].dataset.labelName || 'Dreya';
    
    // Only update if the name has changed
    if (customName !== sectionName) {
      customName = sectionName;
      labelMaterial.map = createLabelTexture(customName);
      labelMaterial.needsUpdate = true;
    }
  }
}

// Create a texture for the label
const canvas = document.createElement('canvas');
canvas.width = 1024;
canvas.height = 1024;
const ctx = canvas.getContext('2d');

function createLabelTexture(customName = 'Dreya') {
  const leftMargin = 120;
  
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
      
  // Draw label background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
   
  // Draw divider lines - scale line width and positions
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(leftMargin, 280);
  ctx.lineTo(896, 280);
  ctx.stroke();
   
  // Text color
  ctx.fillStyle = '#000000';
   
  // Scale all font sizes and positions
  ctx.font = '64px "Saol-Regular", serif'; 
  ctx.fillText('Custom', leftMargin, 160); 
  ctx.fillText('Shampoo', leftMargin, 220);
   
  ctx.font = '24px sans-serif'; 
  ctx.fillText('FOR', leftMargin, 340);
   
  ctx.font = '64px "Saol-Regular", serif';
  ctx.fillText(customName, leftMargin, 400);
   
  ctx.font = '84px "Saol-Medium", serif';
  ctx.fillText('prose', leftMargin, 900);
   
  // Draw registered trademark symbol
  ctx.font = '20px sans-serif';
  ctx.fillText('®', leftMargin + 180, 870);
  
  // Create texture from canvas
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  texture.flipY = false; // Flip texture vertically

  return texture;
}

// Load EXR environment map
function loadEnvironmentMap() {
 // Create RGBELoader for loading HDR files
  const hdrLoader = new RGBELoader();
    
  // Enable texture loading via fetch and set the load path
  hdrLoader.setDataType(THREE.HalfFloatType);
  
  // Load the HDR file
  hdrLoader.load('/textures/hdri/studio.hdr', function(texture) {
    // Configure texture for proper environment mapping
    texture.mapping = THREE.EquirectangularReflectionMapping;
    
    // Generate mipmapped cubemap for performance and quality
    const pmremGenerator = new PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();
    
    envMap = pmremGenerator.fromEquirectangular(texture).texture;
    pmremGenerator.dispose();
    
    // Apply to scene environment for reflections
    scene.environment = envMap;
  });
}

// Set up the camera
function setupCamera() {
  camera = new THREE.PerspectiveCamera(
    settings.camera.fov,                                   // Narrower field of view for product photography
    window.innerWidth / window.innerHeight, // Aspect ratio
    settings.camera.near,                                  // Near clipping plane
    settings.camera.far                                  // Far clipping plane
  );
  // Position slightly higher and to the side for a product shot look
  camera.position.set(settings.camera.position.x, settings.camera.position.y, settings.camera.position.z);
  camera.lookAt(0, 0, 0);
}

// Create and configure the renderer
function setupRenderer() {
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  document.body.appendChild(renderer.domElement);
}

// Set up lighting for the scene
function setupLighting() {
  // Add key light (main directional light)
  directionalLight = new THREE.DirectionalLight(
    settings.lights.directionalLight.color,
    settings.lights.directionalLight.intensity
  );
  directionalLight.position.set(
    settings.lights.directionalLight.position.x,
    settings.lights.directionalLight.position.y,
    settings.lights.directionalLight.position.z
  );
  scene.add(directionalLight);

  // Add ambient light for overall illumination
  ambientLight = new THREE.AmbientLight(
    settings.lights.ambientLight.color,
    settings.lights.ambientLight.intensity
  );
  scene.add(ambientLight);
}

// Configure and return a DRACOLoader instance
function createDracoLoader() {
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.5/');
  dracoLoader.setDecoderConfig({ type: 'js' });
  return dracoLoader;
}

// Load the GLB model
function loadModel(modelPath) {
  // Set up GLTF loader with Draco support
  const dracoLoader = createDracoLoader();
  const gltfLoader = new GLTFLoader();
  gltfLoader.setDRACOLoader(dracoLoader);

  // Load the GLB model
  gltfLoader.load(
    modelPath,
    onModelLoaded,
    onLoadProgress,
    onLoadError
  );
}

// Create materials for different parts of the model
function createMaterials() {
  const aoExterior = new THREE.TextureLoader().load('/textures/exterior_shadow.png')
  aoExterior.flipY = false;
  const aoPump = new THREE.TextureLoader().load('/textures/pump_shadow.png')
  aoPump.flipY = false;
  
  // Create and return all materials in an object
  return {
    glass: new MeshPhysicalMaterial({
      color: settings.materials.glass.color, 
      metalness: settings.materials.glass.metalness,
      roughness: settings.materials.glass.roughness,        
      transmission: settings.materials.glass.transmission, 
      transparent: true,
      ior: settings.materials.glass.ior,
      reflectivity: settings.materials.glass.reflectivity,     
      thickness: settings.materials.glass.thickness,
      envMap,
      envMapIntensity: settings.materials.glass.envMapIntensity,  
      aoMap: aoExterior,
      aoMapIntensity: settings.materials.glass.aoMapIntensity,
    }),
    pump: new THREE.MeshStandardMaterial({
      color: settings.materials.pump.color,
      roughness: settings.materials.pump.roughness,
      metalness: settings.materials.pump.metalness,
      aoMap:aoPump,
      envMap,
      envMapIntensity: settings.materials.pump.envMapIntensity,
    }),
    interiorPlastic: new THREE.MeshStandardMaterial({
      color: settings.materials.interiorPlastic.color, 
      roughness: settings.materials.interiorPlastic.roughness,
      metalness: settings.materials.interiorPlastic.metalness,
    }),
    label: new THREE.MeshStandardMaterial({
      color: settings.materials.label.color, 
      roughness: settings.materials.label.roughness,
      metalness:  settings.materials.label.metalness,
      envMap,
      envMapIntensity:  settings.materials.label.envMapIntensity,  
      map: createLabelTexture(customName)
    })
  };
}

// Apply materials to the model
function applyMaterialsToModel(model, materials) {
  model.traverse((child) => {
    if (child.isMesh) {
      console.log(`- ${child.name}`);
    }
  });

  // Apply each material to its corresponding part
  model.traverse((child) => {
    if (child.isMesh) {
      if (child.name === 'exterior_glass') {
        child.material = materials.glass;
        child.material.name = 'glass';
      } 
      else if (child.name === 'pump') {
        child.material = materials.pump;
        child.material.name = 'pump';
      } 
      else if (child.name === 'interior_plastic') {
        child.material = materials.interiorPlastic;
        child.material.name = 'interiorPlastic';
      }
      else if (child.name === 'label') {
        child.material = materials.label;
        labelMaterial = child.material; // Store reference to label material
        child.material.name = 'label';
      }
      else if (child.name === 'ground') {
        child.visible = false
      }
    }
  });
  
}

// Handle successful model loading
function onModelLoaded(gltf) {
  model = gltf.scene;
  
  // Create materials for all parts
  materials = createMaterials();
  
  // Apply materials to the appropriate model parts
  applyMaterialsToModel(model, materials);
  
  // Add the model to the scene
  scene.add(model);
  
  // Initialize scroll triggers after model is loaded
  initScrollTriggers();
}

// Handle loading progress
function onLoadProgress(progress) {
  console.log('Loading progress: ', (progress.loaded / progress.total) * 100, '%');
}

// Handle loading errors
function onLoadError(error) {
  console.error('An error occurred while loading the model:', error);
}


// Handle window resize events
function handleResize() {
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

// Track mouse movement for interactive effect
function setupMouseTracking() {
  window.addEventListener('mousemove', (e) => {
    mouseTarget.x = e.clientX;
    mouseTarget.y = e.clientY;
  });
}

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

// Initialize the application
Promise.all([
  new Promise((resolve, reject) => {
    document.fonts.load('28px "Saol-Regular"')
      .then(fonts => {
        if (fonts.length > 0) {
          resolve();
        } else {
          reject(new Error('Failed to load Saol-Regular'));
        }
      })
      .catch(reject);
  }),
  new Promise((resolve, reject) => {
    document.fonts.load('32px "Saol-Medium"')
      .then(fonts => {
        if (fonts.length > 0) {
          resolve();
        } else {
          reject(new Error('Failed to load Saol-Medium'));
        }
      })
      .catch(reject);
  })
])
.then(() => {
  init();
})

function init() {
  // Initialize scene and components
  initScene();
  setupCamera();
  setupRenderer();
  setupLighting();
  setupMouseTracking();
  handleResize();
  
  // Initialize scrolling
  initLenis();
  
  // Load the environment map
  loadEnvironmentMap();
  
  // Load the bottle model
  loadModel('/models/bottle.glb');
  
  // Start the animation loop
  animate();
}