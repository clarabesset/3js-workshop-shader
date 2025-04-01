precision mediump float;

uniform float u_time;
uniform vec2 u_resolution;

varying vec2 vUv;

vec3 green = vec3(0.305, 0.321, 0.239);
vec3 salmon = vec3(0.964, 0.572, 0.447);

float rand(vec2 n) {
  return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 ip = floor(p);
  vec2 u = fract(p);
  u = u * u * (3.0 - 2.0 * u);

  float res = mix(
    mix(rand(ip), rand(ip + vec2(1.0, 0.0)), u.x),
    mix(rand(ip + vec2(0.0, 1.0)), rand(ip + vec2(1.0, 1.0)), u.x),
    u.y
  );
  return res * res;
}

const mat2 mtx = mat2(0.80, 0.60, -0.60, 0.80);

float fbm(vec2 p) {
  float f = 0.0;
  f += 0.500000 * noise(p + u_time); p = mtx * p * 2.02;
  f += 0.031250 * noise(p);          p = mtx * p * 2.01;
  f += 0.250000 * noise(p);          p = mtx * p * 2.03;
  f += 0.125000 * noise(p);          p = mtx * p * 2.01;
  f += 0.062500 * noise(p);          p = mtx * p * 2.04;
  f += 0.015625 * noise(p + sin(u_time));
  return f / 0.96875;
}

float pattern(vec2 p) {
  return fbm(p + fbm(p + fbm(p)));
}

vec3 colormap(float x) {
  return mix(green, salmon, clamp(x, 0.0, 1.0));
}

void main() {
  vec2 uv = vUv * vec2(u_resolution.x / u_resolution.y, 1.0);
  float shade = pattern(uv);
  gl_FragColor = vec4(colormap(shade), 1.0);
}