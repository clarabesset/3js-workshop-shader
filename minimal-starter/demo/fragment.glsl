precision mediump float;

uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_clickOrigin; // UV (0 → 1)
uniform float u_clickTime;  // moment du clic (sec)
uniform float u_ringDuration; // duration of the pulsing ring
uniform float u_ringFrequency; // frequency of the wave
uniform float u_ringSharpness; // sharpness of the wave
uniform float u_ringWidth; // width of the wave
varying vec2 vUv;

vec3 green = vec3(0.305, 0.321, 0.239);
vec3 salmon = vec3(0.964, 0.572, 0.447);

float rand(float n) {
    return fract(sin(n) * 43758.5453123);
}

float creamyBlend(vec2 uv, float time) {
    float wave1 = sin(uv.x * 3.0 + time * 0.1);
    float wave2 = cos(uv.y * 3.0 - time * 0.15);
    float wave3 = sin((uv.x + uv.y) * 4.0 + time * 0.05);
    return 0.5 + 0.25 * wave1 + 0.15 * wave2 + 0.1 * wave3;
}

float ripple(vec2 uv, vec2 center, float timeOffset) {
    float dist = distance(uv, center);
    float wave = sin((dist * u_ringFrequency - timeOffset * 2.0));
    float fade = 0.06 / (dist + 0.01);
    float timeFade = smoothstep(1.0, 0.0, timeOffset / u_ringDuration);
    float coreGlow = exp(-pow(dist * 20.0, 2.0)) * 1.2;
    return (wave * fade + coreGlow) * timeFade;
}

// Pulsing ring distortion from click
vec2 applyRingDistortion(vec2 uv, vec2 origin, float elapsed, vec2 resolution) {
    if (elapsed > u_ringDuration) return uv;

    float offset = mod(elapsed, 1.0) / max(elapsed, 0.0001); // avoid div 0
    float currentTime = elapsed * offset;

    vec3 waveParams = vec3(u_ringFrequency, u_ringSharpness, u_ringWidth); // freq, sharpness, width
    float ratio = resolution.y / resolution.x;

    vec2 coord = uv;
    coord.y *= ratio;

    float dist = distance(coord, origin);

    if ((dist <= (currentTime + waveParams.z)) &&
        (dist >= (currentTime - waveParams.z))) {

        float diff = (dist - currentTime);
        float scaleDiff = (1.0 - pow(abs(diff * waveParams.x), waveParams.y));
        float diffTime = diff * scaleDiff;
        vec2 dir = normalize(coord - origin);

        coord += (dir * diffTime) / (currentTime * dist * 40.0);
    }

    coord.y /= ratio;
    return coord;
}

void main() {
    float blendFactor = creamyBlend(vUv, u_time);
    vec3 baseColor = mix(green, salmon, blendFactor);

    float n = fract(sin(dot(vUv * 5.0 + u_time * 0.05, vec2(12.9898, 78.233))) * 43758.5453);
    vec3 color = mix(baseColor, vec3(1.0), n * 0.05);

    // === Pulsing ring only if clicked ===
    float elapsed = u_time - u_clickTime;

    vec2 distortedUv = applyRingDistortion(vUv, u_clickOrigin, elapsed, u_resolution);

    // Recompute creamy blend on distorted UV
    float distortedBlend = creamyBlend(distortedUv, u_time);
    vec3 distortedColor = mix(green, salmon, distortedBlend);

    float n2 = fract(sin(dot(distortedUv * 5.0 + u_time * 0.05, vec2(12.9898, 78.233))) * 43758.5453);
    vec3 finalColor = mix(distortedColor, vec3(1.0), n2 * 0.05);

    gl_FragColor = vec4(finalColor, 1.0);
}