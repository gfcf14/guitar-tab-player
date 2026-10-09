window.TabPlayer = (() => {
  let timer = null;
  let playing = false;
  let position = 0;
  let speed = 1;
  let loop = false;
  let onPosition = () => {};
  let onState = () => {};
  let getTab = () => null;
  let useMetronome = () => false;

  function flatten(tab) {
    const beats = [];
    tab.measures.forEach((measure, measureIndex) => {
      measure.forEach((beat, beatIndex) => {
        beats.push({ measureIndex, beatIndex, beat });
      });
    });
    return beats;
  }

  function intervalMs(tab) {
    // Eight beats per measure is the default editor grid.
    // The first version treats each beat as an eighth-note.
    return (60000 / tab.tempo / 2) / speed;
  }

  function tick() {
    if (!playing) return;

    const tab = getTab();
    const beats = flatten(tab);

    if (!beats.length) {
      stop();
      return;
    }

    if (position >= beats.length) {
      if (loop) position = 0;
      else {
        stop();
        return;
      }
    }

    const current = beats[position];

    if (useMetronome()) {
      TabAudio.metronomeClick(current.beatIndex === 0);
    }

    TabAudio.playBeat(current.beat);
    onPosition(current.measureIndex, current.beatIndex);

    position += 1;
    timer = setTimeout(tick, intervalMs(tab));
  }

  function play() {
    if (playing) return;
    playing = true;
    onState(true);
    tick();
  }

  function pause() {
    if (!playing) return;
    playing = false;
    clearTimeout(timer);
    timer = null;
    onState(false);
  }

  function stop() {
    playing = false;
    clearTimeout(timer);
    timer = null;
    position = 0;
    onPosition(-1, -1);
    onState(false);
  }

  function setSpeed(value) {
    speed = value === 0.5 ? 0.5 : 1;
    if (playing) {
      clearTimeout(timer);
      tick();
    }
  }

  function setLoop(value) {
    loop = Boolean(value);
  }

  function resetIfNeeded() {
    if (!playing) position = 0;
  }

  return {
    configure(options) {
      getTab = options.getTab;
      onPosition = options.onPosition || onPosition;
      onState = options.onState || onState;
      useMetronome = options.useMetronome || useMetronome;
    },
    play,
    pause,
    stop,
    setSpeed,
    setLoop,
    resetIfNeeded,
    get playing() { return playing; }
  };
})();
