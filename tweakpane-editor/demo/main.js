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


// Import necessary Three.js modules
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { PMREMGenerator, MeshPhysicalMaterial } from 'three';
import settings from './settings.js';
// Import Tweakpane
import { Pane } from 'tweakpane';

// Global variables
let scene, camera, renderer, controls;
let directionalLight, ambientLight;
let materials;
let pane; // Tweakpane instance
let envMap;
let labelMaterial; // Add a reference to the label material
let customName = 'Dreya'; // Add a variable to store the custom name

// Initialize the scene
function initScene() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xdcccbd);
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
}

// Create and configure the renderer
function setupRenderer() {
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.shadowMap.enabled = true;
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

// Function to update the label texture
function updateLabelTexture(name) {
  console.log(  labelMaterial);
  if (labelMaterial) {
    // Update the custom name
    customName = name;
      
    // Create a new texture with the updated name
    const newTexture = createLabelTexture(customName);
    
    // Apply the new texture to the label material
    labelMaterial.map = newTexture;
    labelMaterial.needsUpdate = true;
  }
}

// Create materials for different parts of the model
function createMaterials() {
  const aoExterior = new THREE.TextureLoader().load('/textures/exterior_shadow.png')
  aoExterior.flipY = false;
  const aoPump = new THREE.TextureLoader().load('/textures/pump_shadow.png')
  aoPump.flipY = false;
  
  // Create the label material
 
  labelMaterial =  new THREE.MeshStandardMaterial({
    color: settings.materials.label.color, 
    roughness: settings.materials.label.roughness,
    metalness:  settings.materials.label.metalness,
    envMap,
    envMapIntensity:  settings.materials.label.envMapIntensity,  
    map: createLabelTexture(customName)
  })
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
    label: labelMaterial,
    ground: new THREE.MeshStandardMaterial({
        aoMap: new THREE.TextureLoader().load('/textures/ground_shadow.png'),
        color: settings.materials.ground.color,  
        aoMapIntensity: settings.materials.ground.roughness,
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
        child.material.name = 'label';
      }
      else if (child.name === 'ground') {
        child.material = materials.ground;
        child.material.name = 'ground';
      }
    }
  });
}


// Handle successful model loading
function onModelLoaded(gltf) {
  const model = gltf.scene;
  
  // Create materials for all parts
  materials = createMaterials();
  
  // Apply materials to the appropriate model parts
  applyMaterialsToModel(model, materials);
  
  // Add the model to the scene
  scene.add(model);
  
  // After model is loaded, setup Tweakpane with initial camera values
  setupTweakpane();
}


// Handle loading progress
function onLoadProgress(progress) {
  console.log('Loading progress: ', (progress.loaded / progress.total) * 100, '%');
}

// Handle loading errors
function onLoadError(error) {
  console.error('An error occurred while loading the model:', error);
}

// Set up orbit controls for camera interaction
function setupControls() {
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = settings.controls.dampingFactor;
  controls.maxPolarAngle = settings.controls.maxPolarAngle;
  controls.target.set(settings.controls.target.x, settings.controls.target.y, settings.controls.target.z);
}

// Setup Tweakpane control panel
function setupTweakpane() {
  pane = new Pane({
    title: 'Scene Controls',
    expanded: true,
  });
  
  // Create a folder for label customization
  const labelFolder = pane.addFolder({
    title: 'Label Customization',
    expanded: true,
  });
  
  // Add text input for changing the name on the label
  labelFolder.addBinding(
    { name: customName },
    'name',
    { label: 'Custom Name' }
  ).on('change', (ev) => {
    updateLabelTexture(ev.value);
  });
  
  // Create a folder for camera position
  const cameraFolder = pane.addFolder({
    title: 'Camera',
    expanded: false,
  });
  
  // Add sliders for camera position
  cameraFolder.addBinding(settings.camera, 'position', {
    min: -50,
    max: 50,
    step: 0.1,
  }).on('change', (ev) => {
    camera.position.set(ev.value.x, ev.value.y, ev.value.z);
  });
  
  
  // Add sliders for orbit controls target
  cameraFolder.addBinding(settings.controls, 'target', {
    min: -10,
    max: 10,
    step: 0.1,
  }).on('change', (ev) => {
    controls.target.set(ev.value.x, ev.value.y, ev.value.z);
    controls.update();
  });
  
  // Add FOV control
  cameraFolder.addBinding(settings.camera, 'fov', {
    min: 10,
    max: 100,
    step: 1,
  }).on('change', () => {
    camera.fov = settings.camera.fov;
    camera.updateProjectionMatrix();
  });

  // Add lighting controls folder
  const lightingFolder = pane.addFolder({
    title: 'Lighting Controls',
    expanded: false,
  });

  // Add controls for directional light (key light)
  const directionalLightFolder = lightingFolder.addFolder({
    title: 'Key Light',
    expanded: false,
  });

  // Add light position controls (using settings object)
  directionalLightFolder.addBinding(settings.lights.directionalLight, 'position', {
    min: -20,
    max: 20,
    step: 0.1,
  }).on('change', (ev) => {
    directionalLight.position.set(ev.value.x, ev.value.y, ev.value.z);
  });

  // Add light intensity control
  directionalLightFolder.addBinding(settings.lights.directionalLight, 'intensity', {
    min: 0,
    max: 3,
    step: 0.1,
  }).on('change', (ev) => {
    directionalLight.intensity = ev.value;
  });

  // Add color control
  directionalLightFolder.addBinding(settings.lights.directionalLight, 'color', {
    picker: 'inline',
    expanded: true,
  }).on('change', (ev) => {
    directionalLight.color.set(ev.value);
  });

  // Add ambient light controls
  const ambientLightFolder = lightingFolder.addFolder({
    title: 'Ambient Light',
    expanded: false,
  });

  // Add ambient light intensity control
  ambientLightFolder.addBinding(settings.lights.ambientLight, 'intensity', {
    min: 0,
    max: 1,
    step: 0.05,
  }).on('change', (ev) => {
    ambientLight.intensity = ev.value;
  });

  // Add ambient light color control
  ambientLightFolder.addBinding(settings.lights.ambientLight, 'color', {
    picker: 'inline',
    expanded: true,
  }).on('change', (ev) => {
    ambientLight.color.set(ev.value);
  });

  // Add helper toggle
  lightingFolder.addBinding(settings.lights.helpers, 'visible', {label: 'Light Helpers'})
    .on('change', (ev) => {
      toggleLightHelpers(ev.value);
    });

    // Create a folder for materials
  const materialsFolder = pane.addFolder({
    title: 'Material Controls',
    expanded: false,
  });
  
  // Add controls for each material
  if (materials) {
    // Add glass material controls
    if (materials.glass) {
      addMaterialControls(materialsFolder, materials.glass, 'Glass Material');
    }
    
    // Add pump material controls
    if (materials.pump) {
      addMaterialControls(materialsFolder, materials.pump, 'Pump Material');
    }
    
    // Add interior plastic material controls
    if (materials.interiorPlastic) {
      addMaterialControls(materialsFolder, materials.interiorPlastic, 'Interior Plastic');
    }
    
    // Add label material controls
    if (materials.label) {
      addMaterialControls(materialsFolder, materials.label, 'Label Material');
    }
    
    // Add ground material controls
    if (materials.ground) {
      addMaterialControls(materialsFolder, materials.ground, 'Ground Material');
    }
  }
}

function addMaterialControls(pane, material, folderName) {
  // Create a folder for the material
  const materialFolder = pane.addFolder({
    title: folderName,
    expanded: false,
  });
  
  // Add basic material properties that all materials have
  materialFolder.addBinding(material, 'visible');
  
  // Add color control
  if (material.color && settings.materials[material.name]) {
    materialFolder.addBinding(settings.materials[material.name], 'color', {
      expanded: false,
      color: {type: 'float'},
    }).on('change', (ev) => {
      material.color.set(ev.value);
    });
  }
  
  // // Add roughness and metalness for StandardMaterial or PhysicalMaterial
  if (material.roughness !== undefined) {
    materialFolder.addBinding(material, 'roughness', {
      min: 0,
      max: 1,
      step: 0.01,
    });
  }
  
  if (material.metalness !== undefined) {
    materialFolder.addBinding(material, 'metalness', {
      min: 0,
      max: 1,
      step: 0.01,
    });
  }
  
  // Add environment map intensity
  if (material.envMapIntensity !== undefined) {
    materialFolder.addBinding(material, 'envMapIntensity', {
      min: 0,
      max: 5,
      step: 0.1,
    });
  }
  
  // Add physical material specific properties
  if (material.transmission !== undefined) {
    materialFolder.addBinding(material, 'transmission', {
      min: 0,
      max: 1,
      step: 0.01,
    });
  }
  
  if (material.ior !== undefined) {
    materialFolder.addBinding(material, 'ior', {
      min: 1,
      max: 2.333,
      step: 0.01,
    });
  }
  
  if (material.reflectivity !== undefined) {
    materialFolder.addBinding(material, 'reflectivity', {
      min: 0,
      max: 1,
      step: 0.01,
    });
  }
  
  if (material.thickness !== undefined) {
    materialFolder.addBinding(material, 'thickness', {
      min: 0,
      max: 5,
      step: 0.1,
    });
  }
  
  
  // AO Map intensity if it exists
  if (material.aoMapIntensity !== undefined) {
    materialFolder.addBinding(material, 'aoMapIntensity', {
      min: 0,
      max: 20,
      step: 0.01,
    });
  }
  
  return materialFolder;
}

// Handle window resize events
function handleResize() {
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

let directionalLightHelper;

// Add this new function to toggle light helpers
function toggleLightHelpers(show) {
  // Remove existing helpers if they exist
  if (directionalLightHelper) scene.remove(directionalLightHelper);
  
  if (show) {
    // Create and add helpers
    directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight, 1);
    scene.add(directionalLightHelper);

  }
}


// Animation loop
function animate() {
  requestAnimationFrame(animate);
  controls.update(); // Required if controls.enableDamping = true
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
  
  initScene();
  setupCamera();
  setupRenderer();
  setupLighting();
  setupControls();
  handleResize();
  
  // Load the environment map
  loadEnvironmentMap();
  
  // Load the bottle model
  loadModel('/models/bottle.glb');
  
  // Start the animation loop
  animate();
}
