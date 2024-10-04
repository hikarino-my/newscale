const audioContext = new AudioContext();
const analyser = audioContext.createAnalyser();
analyser.fftSize = 512; // Set FFT size (higher means more detailed waveform)
const bufferLength = analyser.frequencyBinCount; // Half of fftSize
const dataArray = new Uint8Array(bufferLength); // Array to hold time-domain data
analyser.connect(audioContext.destination);

class Synth {
  keyCode;
  volume = 0.1;
  stopped = true;
  hz = 440;
  type = "sine";
  pars = [1, 1];
  label = "";
  constructor({ keyCode, pars, type, label }) {
    //  "sine", "square", "sawtooth", "triangle"
    if (type == "sawtooth") {
      type = "sine";
    }
    type = "triangle";
    this.type = type;
    this.label = label;
    this.pars = pars;
    this.keyCode = keyCode;
  }

  get dist() {
    return this.pars[0] > this.pars[1]
      ? this.pars[0] / this.pars[1]
      : this.pars[1] / this.pars[0];
  }
  get ratio() {
    return this.pars[0] / this.pars[1];
  }
  get nextHz() {
    return current_hz * this.ratio;
  }
  createOs() {
    this.hz = this.nextHz;
    current_hz = this.hz;
    if (this.oscillator) {
      this.oscillator.disconnect();
    }
    this.oscillator = audioContext.createOscillator();
    this.oscillator.type = this.type;
    this.oscillator.frequency.setValueAtTime(this.hz, audioContext.currentTime);
    this.oscillator.connect(this.gainNode);
    this.oscillator.start(0);
  }
  playSound(code) {
    if (this.stopped) {
      if (!this.gainNode) {
        this.gainNode = audioContext.createGain();
        this.gainNode.gain.setValueAtTime(
          this.volume,
          audioContext.currentTime
        ); // Start at full volume
        this.createOs();
        this.gainNode.connect(analyser);
      } else {
        // TODO: consider discarding gainNode
        this.gainNode.gain.cancelScheduledValues(audioContext.currentTime);
        this.oscillator.stop(audioContext.currentTime);
        this.gainNode.gain.setValueAtTime(
          this.volume,
          audioContext.currentTime
        );
        this.createOs();
      }
      console.log(code, "down", this.hz);
      const hz_view = document.getElementById("hz");
      hz_view.textContent =
        hz_view.textContent.trim() + " " + this.hz.toFixed(3);
    }
    this.stopped = false;
  }
  stopSound() {
    if (!this.stopped && this.gainNode) {
      this.gainNode.gain.cancelScheduledValues(audioContext.currentTime);
      this.gainNode.gain.setValueAtTime(
        this.gainNode.gain.value,
        audioContext.currentTime
      );
      this.gainNode.gain.exponentialRampToValueAtTime(
        0.001,
        audioContext.currentTime + 0.5
      );
      this.oscillator.stop(audioContext.currentTime + 1);
      this.stopped = true;
      const hz_view = document.getElementById("hz");
      const keep_hzs = [];
      const playing_hzs = hz_view.textContent
        .trim()
        .split(" ")
        .map((v) => v.trim());
      let flag = true;
      for (let v of playing_hzs) {
        if (flag && v === this.hz.toFixed(3)) {
          flag = false;
          continue;
        }
        keep_hzs.push(v);
      }
      hz_view.textContent = keep_hzs.join(" ");
    }
  }
}
let current_hz = 440;
const fps = 60;
let now = 0;

function drawWaveform() {
  const canvas = document.getElementById("waveformCanvas");
  const canvasCtx = canvas.getContext("2d");
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;

  function draw() {
    const timestamp = new Date();
    const delta = Math.floor(timestamp - now);
    requestAnimationFrame(draw); // Call draw at the next animation frame
    if (delta < 60) {
      return;
    }
    now = timestamp;
    analyser.getByteTimeDomainData(dataArray);
    canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
    canvasCtx.lineWidth = 2;
    canvasCtx.strokeStyle = "rgb(0, 0, 0)";
    canvasCtx.beginPath();
    const sliceWidth = canvas.width / bufferLength;
    let x = 0;
    for (let i = 0; i < bufferLength; i++) {
      const v = dataArray[i] / 128.0; // Normalize the data
      const y = (v * canvas.height) / 2;
      if (i === 0) {
        canvasCtx.moveTo(x, y);
      } else {
        canvasCtx.lineTo(x, y);
      }
      x += sliceWidth;
    }
    canvasCtx.lineTo(canvas.width, canvas.height / 2);
    canvasCtx.stroke(); // Draw the waveform
  }
  draw();
}

function drawScale() {
  const canvas = document.getElementById("scale-bar");
  const canvasCtx = canvas.getContext("2d");
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
  function draw() {
    requestAnimationFrame(draw); // Call draw at the next animation frame
    const octwidth = canvas.width / 7;
    const keywidth = octwidth / 12;
    const A440 = octwidth * 3 + keywidth * 9.5;
    const calcPlace = (hz) => Math.log2(hz / 440) * octwidth + A440;
    canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
    canvasCtx.fillStyle = "black"; // 線は赤色
    canvasCtx.font = "14px bold";
    canvasCtx.textAlign = "center";
    syns
      .toSorted((a, b) => Math.sign(a.dist - b.dist))
      .forEach((syn, i) => {
        canvasCtx.fillText(
          syn.label,
          calcPlace(syn.nextHz),
          canvas.height - 20 - (canvas.height * i*1.8) / 100
        );
      });
    canvasCtx.strokeStyle = "#333"; // 塗りつぶしは暗めの色
    canvasCtx.fillStyle = "#f00"; // 線は赤色
    canvasCtx.lineWidth = 5; // 線の幅は5px
    syns
      .filter((s) => !s.stopped)
      .map((s) => calcPlace(s.hz))
      .forEach((v) => {
        canvasCtx.beginPath();
        // const x = octwidth * 3 + keywidth * 9.5; // x 座標
        const y = (canvas.height * 98) / 100; // y 座標
        canvasCtx.arc(v, y, 5, 0, 2 * Math.PI);
        canvasCtx.closePath();
        canvasCtx.fill();
      });
  }
  draw();
}
/*
A (ラ) = 440Hz
A♯/B♭ (ラ♯/シ♭) = 440 × 2^(1/12) ≈ 466.16Hz
B (シ) = 440 × 2^(2/12) ≈ 493.88Hz
C (ド) = 440 × 2^(3/12) ≈ 523.25Hz
C♯/D♭ (ド♯/レ♭) = 440 × 2^(4/12) ≈ 554.37Hz
D (レ) = 440 × 2^(5/12) ≈ 587.33Hz
D♯/E♭ (レ♯/ミ♭) = 440 × 2^(6/12) ≈ 622.25Hz
E (ミ) = 440 × 2^(7/12) ≈ 659.25Hz
F (ファ) = 440 × 2^(8/12) ≈ 698.46Hz
F♯/G♭ (ファ♯/ソ♭) = 440 × 2^(9/12) ≈ 739.99Hz
G (ソ) = 440 × 2^(10/12) ≈ 783.99Hz
G♯/A♭ (ソ♯/ラ♭) = 440 × 2^(11/12) ≈ 830.61Hz
const syn1 = new Synth({hz: ref * Math.pow(2,   (-9/12)), keyCode: "Digit1"})
*/
const ref = 440;
const type = "triangle"; // "sine", "square", "sawtooth", "triangle"
const tar = {
  Digit1: ["1", [1, 1]],
  Digit2: ["2", [2, 1]],
  Digit3: ["3", [3, 2]],
  Digit4: ["4", [4, 3]],
  Digit5: ["5", [5, 4]],
  Digit6: ["6", [5, 3]],
  Digit7: ["7", [6, 5]],
  Digit8: ["8", [7, 6]],
  Digit9: ["9", [7, 5]],
  Digit0: ["0", [7, 4]],
  Minus: ["-", [8, 7]],
  Equal: ["^", [8, 5]],
  IntlYen: ["\\", [9, 8]],
  KeyQ: ["q", [9, 7]],
  KeyW: ["w", [9, 5]],
  KeyE: ["e", [10, 9]],
  KeyR: ["r", [10, 7]],
  KeyT: ["t", [11, 10]],
  KeyY: ["y", [11, 9]],
  KeyU: ["u", [11, 8]],
  KeyI: ["i", [11, 7]],
  KeyO: ["o", [11, 6]],
  KeyP: ["p", [12, 11]],
  BracketLeft: ["@", [12, 7]],
  BracketRight: ["[", [1, 2]],
  KeyA: ["a", [2, 3]],
  KeyS: ["s", [3, 4]],
  KeyD: ["d", [3, 5]],
  KeyF: ["f", [4, 5]],
  KeyG: ["g", [4, 7]],
  KeyH: ["h", [5, 6]],
  KeyJ: ["j", [5, 7]],
  KeyK: ["k", [5, 8]],
  KeyL: ["l", [5, 9]],
  Semicolon: [";", [6, 7]],
  Quote: [":", [7, 8]],
  Backslash: ["]", [7, 9]],
  KeyZ: ["z", [7, 10]],
  KeyX: ["x", [7, 11]],
  KeyC: ["c", [7, 12]],
  KeyV: ["v", [7, 13]],
  KeyB: ["b", [8, 9]],
  KeyN: ["n", [8, 11]],
  KeyM: ["m", [8, 13]],
  Comma: [",", [9, 10]],
  Period: [".", [9, 11]],
  Slash: ["/", [9, 13]],
};
const syns = Object.entries(tar).map(
  ([keyCode, [label, pars]]) =>
    new Synth({ type: "sine", label, pars, keyCode })
);
let started = false;

window.addEventListener("keydown", (event) => {
  //event.preventDefault()
  if (started) {
    for (let syn of syns) {
      if (event.code === syn.keyCode) {
        syn.playSound(event.code);
        break;
      }
    }
    if (event.code === "Space") current_hz = 440;
    if (event.code === "Escape") syns.forEach((syn) => syn.stopSound());
  } else {
    if (event.code === "Space") {
      audioContext.resume();
      console.log("resumed");
      started = true;
      let initialize_i = 0;
      current_hz = 110;
      const limit = 20;
      let flag = true;
      const initialize = (prev) => {
        prev.stopSound();
        if (initialize_i > limit) {
          current_hz = 440;
          return;
        }
        initialize_i++;
        const syn = flag ? syns[6] : syns[17];
        flag = !flag;
        syn.playSound("initialize");
        setTimeout(() => initialize(syn), 100);
      };
      initialize(syns[6]);
      // syn.playSound(event.code);
    }
  }
});
window.addEventListener("keyup", (event) => {
  //event.preventDefault()
  for (let syn of syns) {
    if (event.code === syn.keyCode) {
      syn.stopSound();
      break;
    }
  }
});

window.addEventListener("DOMContentLoaded", () => {
  drawWaveform();
  drawScale();
});
window.onresize = () => {
  ["waveformCanvas", "scale-bar"]
    .map((e) => document.getElementById(e))
    .forEach(
      (canvas) =>
        ([canvas.width, canvas.height] = [
          canvas.clientWidth,
          canvas.clientHeight,
        ])
    );
};
