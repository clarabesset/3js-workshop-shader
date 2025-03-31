varying vec2 vUv;

uniform float u_time;

uniform vec2 circles[5]; 

uniform vec3 col1;
uniform vec3 col2;
uniform vec3 col3;

float circle(vec2 st, vec2 origin, float size) {
    return smoothstep(distance(st, origin) - 0.05, distance(st, origin) + 0.05, size);
}

void main() {
    float progress[5];
    for (int i = 0; i < 5; i++) {
        progress[i] = u_time * cos(float(i) * 100.0) * 0.33;
    }

    vec3 circle1 = mix(vec3(1.0), col1, circle(vUv, vec2(0.9, 0.2), mod(progress[0], 1.0)));
    vec3 circle2 = mix(vec3(1.0), col2, circle(vUv, vec2(0.1, 0.1), mod(progress[1], 1.0)));
    vec3 circle3 = mix(vec3(1.0), col3, circle(vUv, vec2(0.5, 0.7), mod(progress[2], 1.0)));

    vec3 finalColor = min(min(circle1, circle2), circle3);

    gl_FragColor = vec4(finalColor, 1);

    #include <colorspace_fragment>;
}
