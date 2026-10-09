(() => {
  const state = {
    tab: TabData.createDefault()
  };

  const $ = selector => document.querySelector(selector);

  const elements = {
    fileInput: $("#file-input"),
    newTab: $("#new-tab"),
    saveTab: $("#save-tab"),
    title: $("#title-input"),
    tempo: $("#tempo-input"),
    speed: $("#speed-input"),
    metronome: $("#metronome-input"),
    play: $("#play-button"),
    stop: $("#stop-button"),
    status: $("#playback-status"),
    view: $("#tab-view"),
    editor: $("#tab-editor"),
    addBeat: $("#add-beat"),
    addMeasure: $("#add-measure"),
    removeMeasure: $("#remove-measure")
  };

  function syncMetadata() {
    elements.title.value = state.tab.title;
    elements.tempo.value = state.tab.tempo;
  }

  function render() {
    syncMetadata();

    TabRenderer.renderView(elements.view, state.tab, (measureIndex, beatIndex, stringIndex, fret) => {
      TabAudio.playString(stringIndex, fret);
      TabRenderer.highlight(elements.view, measureIndex, beatIndex);
    });

    TabRenderer.renderEditor(elements.editor, state.tab, render);
  }

  function setStatus(text) {
    elements.status.textContent = text;
  }

  TabPlayer.configure({
    getTab: () => state.tab,
    useMetronome: () => elements.metronome.checked,
    onPosition: (measureIndex, beatIndex) => {
      TabRenderer.highlight(elements.view, measureIndex, beatIndex);
      if (measureIndex >= 0) {
        setStatus(`Playing · measure ${measureIndex + 1}, beat ${beatIndex + 1}`);
      } else {
        setStatus("Ready");
      }
    },
    onState: playing => {
      elements.play.textContent = playing ? "❚❚ Pause" : "▶ Play";
      if (!playing && elements.status.textContent.startsWith("Playing")) {
        setStatus("Paused");
      }
    }
  });

  elements.title.addEventListener("input", () => {
    state.tab.title = elements.title.value;
  });

  elements.tempo.addEventListener("change", () => {
    const value = Number(elements.tempo.value);
    state.tab.tempo = Number.isFinite(value)
      ? Math.min(240, Math.max(40, value))
      : 100;
    elements.tempo.value = state.tab.tempo;
  });

  elements.speed.addEventListener("change", () => {
    TabPlayer.setSpeed(Number(elements.speed.value));
  });

  elements.play.addEventListener("click", () => {
    if (TabPlayer.playing) TabPlayer.pause();
    else TabPlayer.play();
  });

  elements.stop.addEventListener("click", () => {
    TabPlayer.stop();
    setStatus("Ready");
  });

  elements.addBeat.addEventListener("click", () => {
    state.tab.measures[state.tab.measures.length - 1].push(TabData.blankBeat());
    render();
  });

  elements.addMeasure.addEventListener("click", () => {
    state.tab.measures.push(TabData.createMeasure(8));
    render();
  });

  elements.removeMeasure.addEventListener("click", () => {
    if (state.tab.measures.length <= 1) {
      setStatus("A tab needs at least one measure.");
      return;
    }

    state.tab.measures.pop();
    render();
  });

  elements.newTab.addEventListener("click", () => {
    TabPlayer.stop();
    state.tab = TabData.createDefault();
    render();
    setStatus("New tab created.");
  });

  elements.saveTab.addEventListener("click", () => {
    const data = JSON.stringify(state.tab, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    const safeTitle = state.tab.title
      .trim()
      .replace(/[^a-z0-9-_]+/gi, "-")
      .replace(/^-+|-+$/g, "") || "tab";

    link.href = url;
    link.download = `${safeTitle}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setStatus("Tab saved.");
  });

  elements.fileInput.addEventListener("change", async event => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      state.tab = TabData.sanitize(JSON.parse(text));
      TabPlayer.stop();
      render();
      setStatus(`Loaded ${file.name}.`);
    } catch (error) {
      console.error(error);
      setStatus("Could not load that tab file.");
    } finally {
      event.target.value = "";
    }
  });

  render();
})();
