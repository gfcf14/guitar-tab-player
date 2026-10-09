window.TabAudio = (() => {
  let context = null;

  // Frequencies for low E through high e.
  const OPEN_STRINGS = [
    82.4069, 110.0000, 146.8324,
    195.9977, 246.9417, 329.6276
  ];

  function ensureContext() {
    if (!context) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) throw new Error("Web Audio is not supported by this browser.");
      context = new AudioContext();
    }
    if (context.state === "suspended") context.resume();
    return context;
  }

  function playString(stringIndex, fret, duration = 0.55) {
    if (!Number.isInteger(stringIndex) || stringIndex < 0 || stringIndex > 5) return;

    const ctx = ensureContext();
    const frequency = OPEN_STRINGS[stringIndex] * Math.pow(2, Number(fret) / 12);
    const now = ctx.currentTime;

    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.type = "triangle";
    oscillator.frequency.setValueAtTime(frequency, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.16, now + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    oscillator.connect(gain);
    gain.connect(ctx.destination);

    oscillator.start(now);
    oscillator.stop(now + duration + 0.03);
  }

  function playBeat(beat) {
    beat.forEach((value, stringIndex) => {
      if (value !== "" && value !== null && value !== undefined) {
        playString(stringIndex, Number(value));
      }
    });
  }

  function metronomeClick(strong = false) {
    const ctx = ensureContext();
    const now = ctx.currentTime;
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.type = "square";
    oscillator.frequency.value = strong ? 1000 : 700;

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.06, now + 0.002);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);

    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.06);
  }

  return { playBeat, playString, metronomeClick };
})();
