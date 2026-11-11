import { describe, expect, it } from 'vitest';
import { centred, covering, cropOf, zoomedAround } from './crop';

// A landscape photo, twice as wide as tall, in a square frame 100 px across
// and in a tall one, 100 × 125
const photo = { width: 2000, height: 1000 };
const square = { width: 100, height: 100 };
const tall = { width: 100, height: 125 };

describe('placing a photo in a frame', () => {
  it('starts covering the frame with the middle of the photo', () => {
    expect(cropOf(photo, square, centred)).toEqual({
      x: 500,
      y: 0,
      width: 1000,
      height: 1000,
    });
    expect(cropOf(photo, tall, centred)).toEqual({
      x: 600,
      y: 0,
      width: 800,
      height: 1000,
    });
  });

  it('can’t be moved off the frame', () => {
    // At zoom 1 it's 200 × 100 in the square: 50 to spare on either side
    // across, none up or down
    expect(covering(photo, square, { zoom: 1, x: 80, y: 30 })).toEqual({
      zoom: 1,
      x: 50,
      y: 0,
    });
  });

  it('zooms around a point, keeping what’s under it', () => {
    const zoomed = zoomedAround(photo, square, centred, 2, { x: 25, y: 25 });
    expect(zoomed).toEqual({ zoom: 2, x: -25, y: -25 });
    expect(cropOf(photo, square, zoomed)).toEqual({
      x: 875,
      y: 375,
      width: 500,
      height: 500,
    });
  });

  it('keeps between fitting and four times closer', () => {
    expect(zoomedAround(photo, square, centred, 0.5).zoom).toBe(1);
    expect(zoomedAround(photo, square, centred, 9).zoom).toBe(4);
  });
});
