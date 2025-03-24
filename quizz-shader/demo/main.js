import * as THREE from 'three';
import fragmentShader from './fragment.glsl';
import vertexShader from './vertex.glsl';
import gsap from 'gsap';

 // Quiz data
 const quizData = [
  {
    id: 'age',
    question: 'What is your age?',
    description: 'Your hair changes throughout your life. Tell us your age range so we can better understand your hair.',
    options: [
      { id: 'under18', label: 'Under 18', icon: '<svg viewBox="0 0 24 24"><circle cx="12" cy="10" r="3" fill="#555"/><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="#555"/></svg>' },
      { id: '18-24', label: '18-24', icon: '<svg viewBox="0 0 24 24"><circle cx="12" cy="10" r="3" fill="#555"/><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="#555"/></svg>' },
      { id: '25-34', label: '25-34', icon: '<svg viewBox="0 0 24 24"><circle cx="12" cy="10" r="3" fill="#555"/><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="#555"/></svg>' },
      { id: '35-44', label: '35-44', icon: '<svg viewBox="0 0 24 24"><circle cx="12" cy="10" r="3" fill="#555"/><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="#555"/></svg>' },
      { id: '45-54', label: '45-54', icon: '<svg viewBox="0 0 24 24"><circle cx="12" cy="10" r="3" fill="#555"/><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="#555"/></svg>' },
      { id: '55+', label: '55+', icon: '<svg viewBox="0 0 24 24"><circle cx="12" cy="10" r="3" fill="#555"/><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="#555"/></svg>' }
    ]
  },
  {
    id: 'texture',
    question: 'What is your hair texture?',
    description: 'Understanding your hair texture helps us determine the right formulation for you.',
    options: [
      { id: 'straight', label: 'Straight', icon: '<svg viewBox="0 0 24 24"><path d="M3 6h18v2H3z" fill="#555"/><path d="M3 11h18v2H3z" fill="#555"/><path d="M3 16h18v2H3z" fill="#555"/></svg>' },
      { id: 'wavy', label: 'Wavy', icon: '<svg viewBox="0 0 24 24"><path d="M3 6c3 0 3 4 6 4s3-4 6-4 3 4 6 4" fill="none" stroke="#555" stroke-width="2"/><path d="M3 14c3 0 3 4 6 4s3-4 6-4 3 4 6 4" fill="none" stroke="#555" stroke-width="2"/></svg>' },
      { id: 'curly', label: 'Curly', icon: '<svg viewBox="0 0 24 24"><path d="M4 4c4 0 2 4 6 4s2-4 6-4 2 4 6 4" fill="none" stroke="#555" stroke-width="2"/><path d="M4 12c4 0 2 4 6 4s2-4 6-4 2 4 6 4" fill="none" stroke="#555" stroke-width="2"/></svg>' },
      { id: 'coily', label: 'Coily', icon: '<svg viewBox="0 0 24 24"><path d="M4 5c1-1 2-1 3 0s2 1 3 0 2-1 3 0 2 1 3 0 2-1 3 0" fill="none" stroke="#555" stroke-width="2"/><path d="M4 12c1-1 2-1 3 0s2 1 3 0 2-1 3 0 2 1 3 0 2-1 3 0" fill="none" stroke="#555" stroke-width="2"/><path d="M4 19c1-1 2-1 3 0s2 1 3 0 2-1 3 0 2 1 3 0 2-1 3 0" fill="none" stroke="#555" stroke-width="2"/></svg>' }
    ]
  },
  {
    id: 'thickness',
    question: 'How would you describe your hair thickness?',
    description: 'Hair thickness refers to the width of each individual hair strand.',
    options: [
      { id: 'fine', label: 'Fine', icon: '<svg viewBox="0 0 24 24"><line x1="4" y1="12" x2="20" y2="12" stroke="#555" stroke-width="1"/></svg>' },
      { id: 'medium', label: 'Medium', icon: '<svg viewBox="0 0 24 24"><line x1="4" y1="12" x2="20" y2="12" stroke="#555" stroke-width="2"/></svg>' },
      { id: 'thick', label: 'Thick', icon: '<svg viewBox="0 0 24 24"><line x1="4" y1="12" x2="20" y2="12" stroke="#555" stroke-width="3"/></svg>' }
    ]
  }
];

// State
let currentQuestionIndex = 0;
const answers = {};
let selectedOption = null;

// DOM elements
const quizContainer = document.getElementById('quiz-container');
const nextButton = document.getElementById('next-btn');
const backButton = document.getElementById('back-btn');
const progressFill = document.getElementById('progress-fill');

// Initialize quiz
function initQuiz() {
  renderQuestion();
  updateProgress();
  
  // Event listeners
  nextButton.addEventListener('click', handleNextClick);
  backButton.addEventListener('click', handleBackClick);
}

// Render current question
function renderQuestion() {
  const currentQuestion = quizData[currentQuestionIndex];
  selectedOption = answers[currentQuestion.id] || null;
  
  let html = `
    <div class="question">
      <h1>${currentQuestion.question}</h1>
      <p class="description">${currentQuestion.description}</p>
      <div class="options">
  `;
  
  currentQuestion.options.forEach(option => {
    const isSelected = selectedOption === option.id;
    html += `
      <div class="option ${isSelected ? 'selected' : ''}" data-id="${option.id}">
        <div class="option-icon">${option.icon}</div>
        <div class="option-label">${option.label}</div>
      </div>
    `;
  });
  
  html += `
      </div>
    </div>
  `;
  
  quizContainer.innerHTML = html;
  
  // Add click event listeners to options
  document.querySelectorAll('.option').forEach(option => {
    option.addEventListener('click', () => selectOption(option.dataset.id));
  });
  
  // Update button states
  nextButton.disabled = selectedOption === null;
  backButton.style.display = currentQuestionIndex > 0 ? 'block' : 'none';
  
  // Update button text for last question
  if (currentQuestionIndex === quizData.length - 1) {
    nextButton.textContent = 'See Results';
  } else {
    nextButton.textContent = 'Next';
  }
}

// Select an option
function selectOption(optionId) {
  selectedOption = optionId;
  answers[quizData[currentQuestionIndex].id] = optionId;
  
  // Update UI
  document.querySelectorAll('.option').forEach(option => {
    option.classList.toggle('selected', option.dataset.id === optionId);
  });
  
  // Enable next button
  nextButton.disabled = false;

  if (selectedOption) {
    triggerImpact();
  }
}

// Handle next button click
function handleNextClick() {
  if (currentQuestionIndex < quizData.length - 1) {
    currentQuestionIndex++;
    renderQuestion();
  } else {
    showResults();
  }
  updateProgress();
}

// Handle back button click
function handleBackClick() {
  if (currentQuestionIndex > 0) {
    currentQuestionIndex--;
    renderQuestion();
    updateProgress();
  }
}

// Update progress bar
function updateProgress() {
  const progress = ((currentQuestionIndex) / quizData.length) * 100;
  progressFill.style.width = `${progress}%`;
}

// Show results
function showResults() {
  // Create personalized message based on answers
  const ageGroup = answers.age;
  const hairTexture = answers.texture;
  const hairThickness = answers.thickness;
  
  let resultMessage = '';
  let recommendationMessage = '';
  
  // Age-specific message
  if (ageGroup === 'under18' || ageGroup === '18-24') {
    resultMessage += 'Your younger hair tends to be healthier and more resilient. ';
  } else if (ageGroup === '25-34' || ageGroup === '35-44') {
    resultMessage += 'At this stage, your hair may start to show some changes in texture and thickness. ';
  } else {
    resultMessage += 'Mature hair often requires more moisture and gentle care. ';
  }
  
  // Texture and thickness combined message
  resultMessage += `With your ${hairThickness} ${hairTexture} hair, `;
  
  // Render result page
  quizContainer.innerHTML = `
    <div class="result-container">
      <h1 class="result-heading">Your Custom Hair Profile</h1>
      <p class="result-summary">${resultMessage}</p>
      <p class="result-summary">${recommendationMessage}</p>
      <button id="restart-btn" style="margin-top: 30px;">Retake Quiz</button>
    </div>
  `;
  
  // Hide navigation buttons
  nextButton.style.display = 'none';
  backButton.style.display = 'none';
  
  // Add restart button event listener
  document.getElementById('restart-btn').addEventListener('click', () => {
    currentQuestionIndex = 0;
    Object.keys(answers).forEach(key => delete answers[key]);
    renderQuestion();
    updateProgress();
    nextButton.style.display = 'block';
    nextButton.disabled = true;
  });
}

// Start the quiz
initQuiz();


// Create the scene
const scene = new THREE.Scene();

// Create the orthographic camera
const camera = new THREE.OrthographicCamera(
  window.innerWidth / -2, window.innerWidth / 2,
  window.innerHeight / 2, window.innerHeight / -2,
  -1, 1000
);
camera.position.z = 1;

// Create the renderer
const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000, 0); // Transparent background
document.body.insertBefore(renderer.domElement, document.body.firstChild);
renderer.domElement.style.position = 'fixed';
renderer.domElement.style.top = '0';
renderer.domElement.style.left = '0';
renderer.domElement.style.zIndex = '-1';

// Create the shader material with advanced effects for each quiz step
const material = new THREE.ShaderMaterial({
  uniforms: {
    uTime: { value: 0.0 },
    uColor1: { value: new THREE.Color(0xead7f3) },
    uColor2: { value: new THREE.Color(0xf9f7f2) },
    uColor3: { value: new THREE.Color(0xfda583) },
    uStep: { value: 0 },
    uImpactIntensity: {value: 0}
  },
  vertexShader,
  fragmentShader,
  transparent: true
});

// Create a plane geometry that covers the screen
const geometry = new THREE.PlaneGeometry(2, 2);
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);



function triggerImpact() {
  gsap.to(material.uniforms.uImpactIntensity, {
    value: material.uniforms.uImpactIntensity.value + 10,
    duration: 0.5,
    ease: 'power2.inOut',
    onComplete: () => {
      gsap.to(material.uniforms.uImpactIntensity, {
        value: 0,
        duration: 0.5,
        ease: 'power2.inOut'
      });
    }
  });
}
// Update shader with quiz state
function updateShaderWithQuizState() {
  // Update step (normalized to 0-3 range)
  material.uniforms.uStep.value = currentQuestionIndex;
}

// Patch the renderQuestion function to update the shader
const originalRenderQuestion = renderQuestion;
renderQuestion = function() {
  originalRenderQuestion();
  updateShaderWithQuizState();
};

// Patch selectOption function to update shader
const originalSelectOption = selectOption;
selectOption = function(optionId) {
  originalSelectOption(optionId);
  updateShaderWithQuizState();
};

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  material.uniforms.uTime.value += 0.001;
  renderer.render(scene, camera);
}

animate();

// Handle window resize
window.addEventListener('resize', () => {
  camera.left = window.innerWidth / -2;
  camera.right = window.innerWidth / 2;
  camera.top = window.innerHeight / 2;
  camera.bottom = window.innerHeight / -2;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Initial update
updateShaderWithQuizState();
