varying vec2 vUv;

uniform float u_time;

void main() {
    vec3 green = vec3(0.305, 0.321, 0.239);
    vec3 salmon = vec3(0.964, 0.572, 0.447);

    vec3 finalColor = mix(salmon, green, vUv.x);

    gl_FragColor = vec4(finalColor, 1);
}