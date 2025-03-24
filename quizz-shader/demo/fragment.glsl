varying vec2 vUv;
uniform float uTime;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
uniform vec3 uColor4;
uniform int uStep;
uniform float uImpactIntensity;

// Noise functions to add organic movement
float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

// 2D Noise based on Morgan McGuire's work
// https://www.shadertoy.com/view/4dS3Wd
float noise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    // Four corners in 2D of a tile
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    // Smooth interpolation
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

vec2 rotateUv(vec2 uv, float angle) {
    float s = sin(angle);
    float c = cos(angle);
    mat2 rotationMatrix = mat2(c, -s, s, c);
    return rotationMatrix * uv;
}

void main() {
    // Create more dynamic UV coordinates
    vec2 movingUv = vUv;
    
    // Apply rotation that changes over time
    float rotationSpeed = 0.2 ;
    movingUv = rotateUv(movingUv - 0.5, uTime * rotationSpeed) + 0.5;
    
    // Add wave distortion
    float waveAmplitude = 0.05;
    float waveFrequency = 5.0;
    movingUv.x += sin(movingUv.y * waveFrequency + uTime) * waveAmplitude;
    movingUv.y += cos(movingUv.x * waveFrequency + uTime * 0.7) * waveAmplitude;
    
    // Add noise-based movement
    float noiseScale = 4.0;
    float noiseTime = uTime * 10.3;
    float noiseValue = noise(movingUv * noiseScale + noiseTime);
    
    // Use the noise to create organic patterns
    vec2 distortedUv = mix(vUv, movingUv , noiseValue * 0.4 );
    
    // Circular pattern
    float dist = length(distortedUv - 0.5);
    float circle = smoothstep(0.45 + sin(uTime) * 0.5, 0.55 + sin(uTime) * 0.5 , dist );
    
    // Base color selection based on step
    vec3 colorA, colorB;
    if(uStep == 0) {
        colorA = uColor1;
        colorB = uColor2;
    } else if(uStep == 1) {
        colorA = uColor2;
        colorB = uColor3;
    } else if(uStep == 2) {
        colorA = uColor3;
        colorB = uColor4;
    } else {
        colorA = mix(uColor1, uColor3, sin(uTime) * 0.5 + 0.5);
        colorB = mix(uColor2, uColor4, cos(uTime) * 0.5 + 0.5);
    }
    
    // Create pulsating blend
    float pulseRate = sin(uTime * 0.5) * 0.5 + 0.5;
    
    // Final color calculation with all effects combined
    vec3 finalColor = mix(
        mix(colorA, colorB, distortedUv.x), 
        mix(colorB, colorA, distortedUv.y),
        mix(circle, noiseValue, pulseRate)
    );
    
    // Add subtle color variations based on time
    finalColor += sin(uTime + distortedUv.xyx * 10.0) * 0.05;
    
    gl_FragColor = vec4(finalColor, 1.0);
}