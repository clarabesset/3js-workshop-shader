import { distance, randomPosInsideRadius } from './utils';

import { seededRandom } from './utils';
import { globalDefaultSeedStr } from './globals';

const poissonDisc = ({
  r,
  maxTry = 25,
  width,
  height,
}: {
  r: number;
  maxTry?: number;
  width: number;
  height: number;
}) => {
  let grid: Array<[number, number] | undefined> = [];
  let active: Array<[number, number]> = [];
  let ordered: Array<[number, number]> = [];

  const cellSize = r / Math.sqrt(2);

  const cols = Math.floor(width / cellSize);
  const rows = Math.floor(height / cellSize);

  for (let i = 0; i < cols * rows; i++) {
    grid[i] = undefined;
  }

  const firstPos: [number, number] = [width / 2, height / 2]; // could have some randomness (or custom input)
  const i = Math.floor(firstPos[0] / cellSize);
  const j = Math.floor(firstPos[1] / cellSize);

  grid[i + j * cols] = firstPos;
  active.push(firstPos);

  while (active.length > 0) {
    const randomIndex = Math.floor(seededRandom(globalDefaultSeedStr) * active.length);
    const pos = active[randomIndex];
    let found = false;

    for (let nTry = 0; nTry < maxTry; nTry++) {
      // TODO: either re-implement or inject p5 instance
      let randomPos = randomPosInsideRadius(r * 2, (randomIndex + nTry).toString());
      randomPos = [randomPos[0] + pos[0], randomPos[1] + pos[1]];

      var col = Math.floor(randomPos[0] / cellSize);
      var row = Math.floor(randomPos[1] / cellSize);

      if (col > -1 && row > -1 && col < cols && row < rows && !grid[col + row * cols]) {
        let ok = true;

        for (let i = -1; i <= 1; i++) {
          for (let j = -1; j <= 1; j++) {
            let index = col + i + (row + j) * cols;
            let neighbor = grid[index];
            if (neighbor) {
              const d = distance(randomPos, neighbor);
              if (d < r) {
                ok = false;
                break;
                // Should we break using a named block/loop?
              }
            }
          }
        }
        if (ok) {
          found = true;
          grid[col + row * cols] = randomPos;
          active.push(randomPos);
          ordered.push(randomPos);
          break;
        }
      }
    }

    if (!found) {
      active.splice(randomIndex, 1);
    }
  }

  return ordered;
};

export default poissonDisc;
