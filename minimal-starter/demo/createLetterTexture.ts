import * as THREE from 'three';

import P5 from 'p5';

import { sketch } from './sketch';

export function createLetterTexture(sketchOptions: Parameters<typeof sketch>[1]) {
  const p5canvas = document.createElement('canvas');

  /* const p = */ new P5(sketch(p5canvas, sketchOptions));

  return new Promise<THREE.CanvasTexture>((res, _rej) => {
    setTimeout(() => {
      res(new THREE.CanvasTexture(p5canvas));
    }, 200);
  });
}
