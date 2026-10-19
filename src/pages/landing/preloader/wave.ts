// The surface of the "liquid" that fills the wordmark: a long sine wave whose
// crest sits at y = 0, with a deep body below it. Slide it by one period to loop.
export const WAVE_PERIOD = 260;
export const WAVE_AMP = 9;

export const wavePath = (() => {
  let d = `M ${-WAVE_PERIOD * 4} 0`;
  for (let x = -WAVE_PERIOD * 4; x < WAVE_PERIOD * 8; x += WAVE_PERIOD) {
    d += ` q ${WAVE_PERIOD / 4} ${-WAVE_AMP} ${WAVE_PERIOD / 2} 0 t ${WAVE_PERIOD / 2} 0`;
  }
  return `${d} V 2000 H ${-WAVE_PERIOD * 4} Z`;
})();
