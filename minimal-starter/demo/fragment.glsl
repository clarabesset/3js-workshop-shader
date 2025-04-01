varying vec2 vUv;

uniform float u_time;
uniform float aspectRatio;

const int circlesCount = 15;
uniform vec2 circles[circlesCount];

const int colorsCount = 4;
uniform vec3 proseColors[colorsCount];

float circle(vec2 st, vec2 origin, float size) {
    return smoothstep(distance(st, origin) - 0.05, distance(st, origin) + 0.05, size);
}

void main() {
    float progress[circlesCount];

    vec2 st = vec2(vUv.x * aspectRatio, vUv.y);

    // vec3 finalColor = vec3(.0, .0, .0); // basis for adding colors ?
    // for(int i = 0; i < circlesCount; i++) {
    //     progress[i] = fract(u_time * 0.1 + cos(float(i)));
    //     vec3 circleCol = circle(st, circles[i], progress[i]) * proseColors[i % colorsCount] * (1.0 - pow(progress[i], .3));
    //     finalColor += circleCol;
    // }

    vec3 finalColor = vec3(.5); // basis for multiplying colors ?
    for(int i = 0; i < circlesCount; i++) {
        progress[i] = fract(u_time * 0.1 + cos(float(i)));
        float circle = circle(st, circles[i], progress[i]) * (1.0 - pow(progress[i], 2.0));
        finalColor = mix(finalColor, proseColors[i % colorsCount], circle);
    }

    gl_FragColor = vec4(finalColor, 1);

    #include <colorspace_fragment>;
}
