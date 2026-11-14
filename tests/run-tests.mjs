/**
 * Runner Node.js para executar SelfTest.runAll() em CI ou via terminal:
 *   node tests/run-tests.mjs
 */

const createMockCanvas = () => ({
  width: 64,
  height: 64,
  getContext: () => ({
    imageSmoothingEnabled: false,
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
    font: '',
    textAlign: 'left',
    globalAlpha: 1,
    fillRect() {},
    strokeRect() {},
    clearRect() {},
    drawImage() {},
    beginPath() {},
    moveTo() {},
    lineTo() {},
    closePath() {},
    arc() {},
    ellipse() {},
    fill() {},
    stroke() {},
    save() {},
    restore() {},
    translate() {},
    scale() {},
    fillText() {},
    createLinearGradient: () => ({ addColorStop() {} }),
    createRadialGradient: () => ({ addColorStop() {} })
  })
});

if (typeof globalThis.document === 'undefined') {
  globalThis.document = {
    createElement: (tag) => (tag === 'canvas' ? createMockCanvas() : { classList: { add() {}, remove() {}, toggle() {} }, style: {} }),
    getElementById: () => null,
    querySelector: () => null,
    body: { classList: { toggle() {} } }
  };
}

if (typeof globalThis.window === 'undefined') {
  globalThis.window = {
    AudioContext: null,
    webkitAudioContext: null,
    addEventListener() {}
  };
}

if (typeof globalThis.Image === 'undefined') {
  globalThis.Image = class MockImage {
    set src(_) {}
  };
}

const { SelfTest } = await import('../src/tests/SelfTest.js');
const passed = SelfTest.runAll();
process.exit(passed ? 0 : 1);
