import type p5 from 'p5';

import { makeNoise3D } from 'open-simplex-noise';

import { seededRandom, distance } from './utils';
import { globalDefaultSeedNmb } from './globals';
import poissonDisc from './poissonDisc';

const noise3D = makeNoise3D(globalDefaultSeedNmb);

const config = {
  canvasSize: 800,
  pixelDensity: 1,
  textSize: 0.75,
  noise: {
    intensity: 0.3,
    scale: 0.05,
    // seed: 320,
  },
  curl: {
    // intensity: 0.8,
    // scale: 0.5,
    // seed: 10,
  },
  blurField: {
    intensity: 0.03,
  },
  maxVelocity: 1,
  debug: {
    letterFields: false,
    curlField: false,
    sampling: false, // broken?
    particles: false,
  },
};

function createLetterFieldImg(p: p5, letter: string) {
  const createLetterImg = ({
    dilatation = 0,
    blurRatio = 0,
    opacity,
    color = [255, 255, 255],
  }: {
    dilatation?: number;
    blurRatio?: number;
    opacity: number;
    color?: [number, number, number];
  }) => {
    const lg = p.createGraphics(p.width, p.height, 'p2d');
    lg.pixelDensity(config.pixelDensity);

    const posX = p.width * 0.5;
    const posY = p.height * 0.58;

    lg.textAlign(p.CENTER, p.CENTER);
    lg.textSize(p.width * config.textSize);
    lg.textFont('Palatino');

    lg.fill(...color, 255 * opacity);
    lg.text(letter, posX, posY);
    if (dilatation > 0) {
      lg.filter(p.BLUR, 1);
      /* TODO: have slightly less arbitrary values for quantity of iterations */
      for (let i = 0; i < dilatation * (p.width + p.height) * 0.017; i++) {
        lg.filter(p.DILATE);
      }
    }
    if (dilatation < 0) {
      /* TODO: have slightly less arbitrary values for quantity of iterations */
      for (let i = 0; i < Math.abs(dilatation) * (p.width + p.height) * 0.007; i++) {
        lg.filter(p.ERODE);
      }
      lg.filter(p.BLUR, 1);
    }
    if (dilatation > 0 && blurRatio !== 0) lg.filter(p.BLUR, Math.floor(lg.height * blurRatio));

    return lg;
  };
  const lg_outer = createLetterImg({
    dilatation: 1,
    opacity: 0.9,
    blurRatio: 0.02,
    color: [0, 0, 255],
  });
  const lg_original = createLetterImg({
    opacity: 0.7,
    blurRatio: 0.01,
    color: [0, 255, 0],
  });
  const lg_inner = createLetterImg({
    dilatation: -1,
    opacity: 1,
    blurRatio: 0.02,
    color: [255, 0, 0],
  });
  const imagesToAdd = [lg_outer, lg_original, lg_inner];

  const lg_composite = p.createGraphics(p.width, p.height, 'p2d');
  lg_composite.pixelDensity(config.pixelDensity);
  lg_composite.background(0);
  lg_composite.blendMode(p.ADD);
  imagesToAdd.forEach((img) => {
    lg_composite.image(img, 0, 0, lg_composite.width, lg_composite.height); // todo: find a way to have a proper intensity for each image
  });

  lg_composite.loadPixels(); // makes myp5Graphics.pixels available

  return lg_composite;
}

function sampleRgba(
  buffer: Uint8ClampedArray,
  x: number, // normalized value ([0->1])
  y: number, // normalized value ([0->1])
  pixelWidth: number,
  pixelHeight: number,
  channel: 0 | 1 | 2 | 3 = 0
) {
  if (x > 1 || x < 0) console.error('x value is out of bound:', x);
  if (y > 1 || y < 0) console.error('y value is out of bound:', y);

  const xCoord = Math.floor(x * pixelWidth);
  const yCoord = Math.floor(y * pixelHeight);
  const index = yCoord * pixelWidth * 4 + xCoord * 4 + channel; // letterTextureScale?

  const sampledValue = buffer[index];

  if (config.debug.sampling) {
    // console.log("debugSampling: ", buffer[index]);

    buffer[index] = 255 - buffer[index];
    buffer[index + 1] = 255 - buffer[index + 1];
    buffer[index + 2] = 255 - buffer[index + 2];
    buffer[index + 3] = 255;
    // don't forget to add myImage.updatePixels() after this function, wherever you want to debug
  }

  return sampledValue;
}

function getCurl(
  curlScale: number,
  xNormalized: number, // [0->1]
  yNormalized: number, // [0->1]
  f: number
): [number, number] {
  const x = xNormalized / curlScale;
  const y = yNormalized / curlScale;

  const delta = 0.01;
  let n1 = noise3D(x + delta, y, f);
  let n2 = noise3D(x - delta, y, f);

  const cy = -(n1 - n2) / (delta * 2);

  n1 = noise3D(x, y + delta, f);
  n2 = noise3D(x, y - delta, f);
  const cx = (n1 - n2) / (delta * 2);

  return [cy, cx];
}

function getDerivateVec(
  buffer: Uint8ClampedArray,
  x: number, // normalized value ([0->1])
  y: number, // normalized value ([0->1])
  pixelWidth: number,
  pixelHeight: number,
  channel: 0 | 1 | 2 | 3 = 0,
  delta: number = 1
): [number, number] {
  const sample = (x: number, y: number) =>
    sampleRgba(buffer, x, y, pixelWidth, pixelHeight, channel);

  const normalizedDelta = delta / pixelWidth; // assumes a square

  let clampedX = x;
  let clampedY = y;
  if (x + normalizedDelta > 1) clampedX = 1 - normalizedDelta;
  if (x - normalizedDelta < 0) clampedX = normalizedDelta;
  if (y + normalizedDelta > 1) clampedY = 1 - normalizedDelta;
  if (y - normalizedDelta < 0) clampedY = normalizedDelta;

  let n1 = sample(clampedX + normalizedDelta, clampedY);
  let n2 = sample(clampedX - normalizedDelta, clampedY);
  const cx = n1 - n2;
  // const cy = -(n1 - n2) / (normalizedDelta * 2);

  n1 = sample(clampedX, clampedY + normalizedDelta);
  n2 = sample(clampedX, clampedY - normalizedDelta);
  const cy = n1 - n2;
  // const cx = (n1 - n2) / (normalizedDelta * 2);

  return [cx, cy];
}

function drawVec(p: p5, base: p5.Vector, vec: p5.Vector) {
  p.push();
  p.translate(base.x, base.y);
  const lineVec = vec.limit(8);
  p.line(0, 0, lineVec.x, lineVec.y);
  p.pop();
}

function getFieldsVec(
  p: p5,
  letterImg: p5.Graphics,
  noiseSeed: number,
  curlSeed: number,
  curlIntensity: number,
  curlScale: number,
  [x, y]: [number, number]
) {
  const noiseField = [
    noise3D(x / config.noise.scale, y / config.noise.scale, noiseSeed),
    noise3D(x / config.noise.scale, y / config.noise.scale, noiseSeed + 42),
  ];
  const noiseVec = p.createVector(noiseField[0], noiseField[1]).mult(config.noise.intensity);

  let fieldsVec = noiseVec;

  const curlField = getCurl(curlScale, x, y, curlSeed);
  const curlFieldVec = p.createVector(curlField[0], curlField[1]).mult(curlIntensity);

  fieldsVec = fieldsVec.add(curlFieldVec);

  const blurFieldSample = sampleRgba(
    // @ts-expect-error - p5graphics.pixels type might be wrong (number[])
    letterImg.pixels as Uint8ClampedArray,
    x,
    y,
    letterImg.width, // * config.pixelDensity,
    letterImg.height, // * config.pixelDensity,
    2
  );

  if (blurFieldSample < 50) return fieldsVec;
  const blurFieldDerivated = getDerivateVec(
    // @ts-expect-error - p5graphics.pixels type might be wrong (number[])
    letterImg.pixels as Uint8ClampedArray,
    x,
    y,
    letterImg.width, // * config.pixelDensity,
    letterImg.height, // * config.pixelDensity,
    2
  );
  const blurFieldVec = p
    .createVector(blurFieldDerivated[0], blurFieldDerivated[1])
    .mult(config.blurField.intensity);

  fieldsVec = fieldsVec.add(blurFieldVec);

  return fieldsVec;
}

export const sketch =
  (
    canvas: HTMLCanvasElement,
    {
      letter = 'A',
      isCircle = false,
      isLarge = false,
      framesQuantity = 25,
      strokeBaseWeight = 2,
      strokeVariability = 1,
      poissonDiscRadius = 12,
      noiseSeed = 100,
      curlSeed = 10,
      curlIntensity = 0.8,
      curlScale = 0.5,
    }: {
      letter?: string;
      isCircle?: boolean;
      isLarge?: boolean;
      framesQuantity?: number;
      strokeBaseWeight?: number;
      strokeVariability?: number;
      poissonDiscRadius?: number;
      noiseSeed?: number;
      curlSeed?: number;
      curlIntensity?: number;
      curlScale?: number;
    } = {}
  ) =>
  (p: p5) => {
    let poissonParticles: Array<[number, number]>;
    let particlePositions: Array<[number, number]>;
    let particles: Array<{
      pos: [number, number];
      vel: [number, number];
    }>;
    let particlesPositions: Array<Array<[number, number]>>;

    p.setup = () => {
      console.time('sketch setup');
      console.log('before createCanvas', document.querySelectorAll('canvas').length);
      p.createCanvas(config.canvasSize, config.canvasSize, 'p2d', canvas);
      console.log('after createCanvas', document.querySelectorAll('canvas').length);
      p.pixelDensity(config.pixelDensity);
      p.noLoop();

      console.time('createLetterFieldImg');
      const letterImg = createLetterFieldImg(p, letter);
      console.timeEnd('createLetterFieldImg');
      console.log('after letterImg', document.querySelectorAll('canvas').length);

      if (config.debug.sampling) {
        const coords = [0.5, 0.25];
        /* const value = */ sampleRgba(
          // @ts-expect-error - p5graphics.pixels type might be wrong (number[])
          letterImg.pixels as Uint8ClampedArray,
          coords[0],
          coords[1],
          letterImg.width, // * config.pixelDensity,
          letterImg.height // * config.pixelDensity,
        );

        letterImg.updatePixels();
      }

      if (config.debug.letterFields) {
        p.tint(255, 255 * 1); // Display at reduced opacity
        p.image(letterImg, 0, 0, p.width, p.height); // for debug purposes
      }

      /* draw vector fields */
      if (config.debug.curlField) {
        const resolution = 70;

        p.push();

        for (let y = 0; y < resolution; y++) {
          for (let x = 0; x < resolution; x++) {
            const coords = [y / resolution, x / resolution];
            const curlVec = getCurl(curlScale, coords[0], coords[1], curlSeed);

            p.stroke(0, 128, 255, 255);
            p.strokeWeight(2);

            const base = [coords[0] * p.width, coords[1] * p.height];
            drawVec(
              p,
              p.createVector(base[0], base[1]),
              p.createVector(curlVec[0], curlVec[1]).mult(Math.floor(p.width / resolution - 1))
            );
          }
        }
        p.pop();
      }

      /* create particles */
      poissonParticles = poissonDisc({
        r: poissonDiscRadius,
        width: p.width,
        height: p.height,
      });

      particlePositions = poissonParticles.filter(([x, y]) => {
        const pixelData = sampleRgba(
          // @ts-expect-error - p5graphics.pixels type might be wrong (number[])
          letterImg.pixels as Uint8ClampedArray,
          x / letterImg.width,
          y / letterImg.height,
          letterImg.width,
          letterImg.height,
          2
        );
        if (isCircle) {
          return pixelData < 190 && distance([p.width / 2, p.height / 2], [x, y]) < p.width * 0.38;
        }
        if (isLarge) {
          return pixelData > 90;
        }
        return pixelData > 190;
      });

      particles = particlePositions.map((pos) => {
        if (config.debug.particles) {
          p.stroke(255, 0, 0, 220);
          p.strokeWeight(config.canvasSize / 100);
          p.point(pos[0], pos[1]); // debug
        }

        const randomDirection = p
          .createVector(0, 1)
          .rotate(seededRandom(pos[0].toString() + pos[1].toString()) * p.TWO_PI);

        const randomVelocity: [number, number] = [
          randomDirection.x * 0.01,
          randomDirection.y * 0.01,
        ];

        return {
          pos,
          vel: randomVelocity,
        };
      });

      particlesPositions = particles.map((particle) => [particle.pos]);

      /* move particles */
      for (let i = 0; i < framesQuantity; i++) {
        particles.forEach((particle, index) => {
          const currentPosition = particle.pos;
          const currentVelocity = particle.vel;

          const velocityVec = p.createVector(currentVelocity[0], currentVelocity[1]);

          const fieldsVec = getFieldsVec(
            p,
            letterImg,
            noiseSeed,
            curlSeed,
            curlIntensity,
            curlScale,
            [particle.pos[0] / config.canvasSize, particle.pos[1] / config.canvasSize]
          );

          const newVelocityVec = velocityVec.add(fieldsVec).limit(config.maxVelocity);

          const newVelocity: [number, number] = [newVelocityVec.x, newVelocityVec.y];

          const newPosition: [number, number] = [
            currentPosition[0] + newVelocity[0],
            currentPosition[1] + newVelocity[1],
          ];
          // TODO: clamp

          particle.pos = newPosition;
          particle.vel = newVelocity;
          particlesPositions[index].push(newPosition);
        });
      }
    };

    console.timeEnd('sketch setup');

    p.draw = () => {
      console.log('draw');

      // draw particle paths
      p.stroke(255, 255, 255, 170);
      p.stroke(0, 0, 0, 255);
      p.noFill();
      particlesPositions.forEach((particlePositions, particleIndex) => {
        p.strokeWeight(
          ((particleIndex * strokeVariability) % (5 * strokeVariability)) + strokeBaseWeight
        );
        p.beginShape();
        particlePositions.forEach((particlePosition, index) => {
          if (index === 0 || index === 1) {
            p.vertex(particlePosition[0], particlePosition[1]);
          } else {
            p.curveVertex(particlePosition[0], particlePosition[1]);
          }
        });
        p.endShape();
      });
    };
  };
