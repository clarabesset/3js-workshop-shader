import type p5 from 'p5';

export const sketch = (p: p5) => {
  p.setup = () => {
    p.createCanvas(800, 800);
    console.log('setup');
    p.background(0, 0, 0);
  };

  p.draw = () => {
    p.fill(255, 255, 127);
    p.ellipse(p.width / 2, p.height / 2, p.width / 2, p.height / 2);
  };
};
