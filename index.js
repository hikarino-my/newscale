class Synth {
    audioContext;
    source;
    sineWaveArray;
    sampleRate=44100;
    durationInSeconds = 60;
    keyCode;
    volume = 0.1;
    stopped=true;
    suspended=false;
    hz=440;
    type="sine";
    pars = [1,1];
    constructor({keyCode, pars, type}) {
      this.type = type;
      this.pars = pars;
        this.keyCode = keyCode;
    }
    createOs() {
        this.hz = current_hz * this.pars[0] / this.pars[1];
        current_hz = this.hz
        this.oscillator = this.audioContext.createOscillator();
        this.oscillator.type = this.type;
        this.oscillator.frequency.setValueAtTime(this.hz, this.audioContext.currentTime);
        this.oscillator.connect(this.gainNode);
        this.oscillator.start(0);
    }
    playSound(code) {
        //this.stopSound();
        // Initialize AudioContext
        //console.log('Sound playing');
        if (this.stopped){
            if (!this.audioContext) {
                this.audioContext = new AudioContext();
                this.gainNode = this.audioContext.createGain();
                this.gainNode.gain.setValueAtTime(1, this.audioContext.currentTime); // Start at full volume
                this.createOs();
                this.gainNode.connect(this.audioContext.destination);
                this.audioContext.resume();
            }
            else {
                this.gainNode.gain.cancelScheduledValues(this.audioContext.currentTime);
                this.oscillator.stop(this.audioContext.currentTime);
                this.gainNode.gain.setValueAtTime(1, this.audioContext.currentTime);
                this.createOs();
            }
            console.log(code, "down", this.hz);
        }
        this.stopped = false;
      }
    stopSound() {
      if (!this.stopped && this.audioContext){
        this.gainNode.gain.cancelScheduledValues(this.audioContext.currentTime);
        this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, this.audioContext.currentTime);
        this.gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
        this.oscillator.stop(this.audioContext.currentTime + 1)
        this.stopped = true;
      }
      }
}
let current_hz = 440;

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
*/
const ref = 440;
/*const syn1 = new Synth({hz: ref * Math.pow(2,   (-9/12)), keyCode: "Digit1"})
const syn2 = new Synth({hz: ref * Math.pow(2,   (-8/12)), keyCode: "Digit2"})
const syn3 = new Synth({hz: ref * Math.pow(2,   (-7/12)), keyCode: "Digit3"})
const syn4 = new Synth({hz: ref * Math.pow(2,   (-6/12)), keyCode: "Digit4"})
const syn5 = new Synth({hz: ref * Math.pow(2,   (-5/12)), keyCode: "Digit5"})
const syn6 = new Synth({hz: ref * Math.pow(2,   (-4/12)), keyCode: "Digit6"})
const syn7 = new Synth({hz: ref * Math.pow(2,   (-3/12)), keyCode: "Digit7"})
const syn8 = new Synth({hz: ref * Math.pow(2,   (-2/12)), keyCode: "Digit8"})
const syn9 = new Synth({hz: ref * Math.pow(2,   (-1/12)), keyCode: "Digit9"})
const syn10 = new Synth({hz: ref * Math.pow(2,  (0/12)), keyCode: "Digit0"})
const syn11 = new Synth({hz: ref * Math.pow(2,  (1/12)), keyCode: "Minus"})
const syn12 = new Synth({hz: ref * Math.pow(2,  (2/12)), keyCode: "Equal"})
*/
const type = "triangle";// "sine", "square", "sawtooth", "triangle"
const syns = [
  new Synth({type: "sine",  pars: [1, 1], keyCode: "Digit1"}),
  new Synth({type: "triangle",  pars: [2,1], keyCode: "Digit2"}),
  new Synth({type: "square",  pars: [3,2], keyCode: "Digit3"}),
  new Synth({type: "sawtooth",  pars: [4,3], keyCode: "Digit4"}),
  new Synth({type: "sine",  pars: [5,4], keyCode: "Digit5"}),
  new Synth({type: "square",  pars: [5,3], keyCode: "Digit6"}),
  new Synth({type: "sawtooth",  pars: [6,5], keyCode: "Digit7"}),
  new Synth({type: "sawtooth",  pars: [7,6], keyCode: "Digit8"}),
  new Synth({type: "triangle",  pars: [7,5], keyCode: "Digit9"}),
  new Synth({type: "sawtooth",  pars: [7,4], keyCode: "Digit0"}),
  new Synth({type: "sine",  pars: [8,7], keyCode: "Minus"}),
  new Synth({type: "triangle",  pars: [8,5], keyCode: "Equal"}),
  new Synth({type: "sawtooth",  pars: [9,8], keyCode: "IntlYen"}),

  new Synth({type: "sine",  pars: [9,7], keyCode: "KeyQ"}),
  new Synth({type: "sawtooth",  pars: [9,5], keyCode: "KeyW"}),
  new Synth({type: "square",  pars: [10,9], keyCode: "KeyE"}),
  new Synth({type: "sine",  pars: [10,7], keyCode: "KeyR"}),
  new Synth({type: "triangle",  pars: [11,10], keyCode: "KeyT"}),
  new Synth({type: "sawtooth",  pars: [11,9], keyCode: "KeyY"}),
  new Synth({type: "square",  pars: [11,8], keyCode: "KeyU"}),
  new Synth({type: "square",  pars: [11,7], keyCode: "KeyI"}),
  new Synth({type: "sawtooth",  pars: [11,6], keyCode: "KeyO"}),
  new Synth({type: "sawtooth",  pars: [12,11], keyCode: "KeyP"}),
  new Synth({type: "triangle",  pars: [12,7], keyCode: "BracketLeft"}),
  new Synth({type: "square",  pars: [1,2], keyCode: "BracketRight"}),

  new Synth({type: "square", pars: [2,3], keyCode: "KeyA"}),
  new Synth({type: "triangle", pars: [3,4], keyCode: "KeyS"}),
  new Synth({type: "sine", pars: [3,5], keyCode: "KeyD"}),
  new Synth({type: "triangle", pars: [4,5], keyCode: "KeyF"}),
  new Synth({type: "triangle", pars: [4,7], keyCode: "KeyG"}),
  new Synth({type: "triangle", pars: [5,6], keyCode: "KeyH"}),
  new Synth({type: "sine", pars: [5,7], keyCode: "KeyJ"}),
  new Synth({type: "square", pars: [5,8], keyCode: "KeyK"}),
  new Synth({type: "sawtooth", pars: [5,9], keyCode: "KeyL"}),
  new Synth({type: "sine", pars: [6,7], keyCode: "Semicolon"}),
  new Synth({type: "sine", pars: [7,8], keyCode: "Quote"}),
  new Synth({type: "sine", pars: [7,9], keyCode: "Backslash"}),

  new Synth({type: "square", pars: [7,10], keyCode: "KeyZ"}),
  new Synth({type: "sine", pars: [7,11], keyCode: "KeyX"}),
  new Synth({type: "square", pars: [7,12], keyCode: "KeyC"}),
  new Synth({type: "sawtooth", pars: [7,13], keyCode: "KeyV"}),
  new Synth({type: "triangle", pars: [8,9], keyCode: "KeyB"}),
  new Synth({type: "square", pars: [8,11], keyCode: "KeyN"}),
  new Synth({type: "sawtooth", pars: [8,13], keyCode: "KeyM"}),
  new Synth({type: "sine", pars: [9,10], keyCode: "Comma"}),
  new Synth({type: "triangle", pars: [9,11], keyCode: "Period"}),
  new Synth({type: "square", pars: [9,13], keyCode: "Slash"})
]
window.addEventListener('keydown', (event) => {
  //event.preventDefault()
  for(var syn of syns){
    if (event.code===syn.keyCode){
      syn.playSound(event.code);
      break;
    }
  }
});
window.addEventListener('keyup', (event) => {
  //event.preventDefault()
  for(var syn of syns){
    if (event.code===syn.keyCode){
      syn.stopSound();
      break;
    }
  }
});
