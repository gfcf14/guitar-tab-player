// The application's deliberately small tab-file format.
//
// {
//   "title": "Example",
//   "tempo": 100,
//   "tuning": ["E", "A", "D", "G", "B", "E"],
//   "measures": [
//     [
//       ["0", "2", "2", "1", "0", "0"],
//       ["0", "2", "2", "1", "0", "0"]
//     ]
//   ]
// }
//
// Each measure contains beats.
// Each beat contains six strings in low-E -> high-e order.
// An empty string means "do not play this string".

window.TabData = (() => {
  const STANDARD_TUNING = ["E", "A", "D", "G", "B", "E"];

  function blankBeat() {
    return ["", "", "", "", "", ""];
  }

  function createMeasure(beats = 8) {
    return Array.from({ length: beats }, blankBeat);
  }

  function createDefault() {
    const measure = [
      ["0", "0", "0", "2", "2", "0"],
      ["0", "0", "0", "2", "3", "0"],
      ["2", "2", "2", "2", "0", "0"],
      ["2", "2", "2", "0", "0", "0"],
      ["0", "0", "0", "2", "3", "0"],
      ["0", "0", "0", "2", "2", "0"],
      ["", "2", "2", "2", "0", "0"],
      ["0", "0", "0", "0", "0", "0"]
    ];

    return {
      title: "My First Tab",
      tempo: 100,
      tuning: [...STANDARD_TUNING],
      measures: [measure.map(beat => [...beat]), createMeasure(8)]
    };
  }

  function sanitize(raw) {
    const source = raw && typeof raw === "object" ? raw : {};
    const tempo = Number(source.tempo);

    const measures = Array.isArray(source.measures)
      ? source.measures.map(measure => {
          if (!Array.isArray(measure)) return [];
          return measure.map(beat => {
            if (!Array.isArray(beat)) return blankBeat();
            return Array.from({ length: 6 }, (_, index) => {
              const value = beat[index];
              if (value === null || value === undefined || value === "") return "";
              const text = String(value).trim();
              return /^\d{1,2}$/.test(text) && Number(text) <= 24 ? text : "";
            });
          }).filter(Boolean);
        }).filter(measure => measure.length > 0)
      : [];

    return {
      title: String(source.title || "Untitled Tab").slice(0, 100),
      tempo: Number.isFinite(tempo) ? Math.min(240, Math.max(40, tempo)) : 100,
      tuning: Array.isArray(source.tuning) && source.tuning.length === 6
        ? source.tuning.map(x => String(x).slice(0, 3))
        : [...STANDARD_TUNING],
      measures: measures.length ? measures : [createMeasure(8)]
    };
  }

  return { STANDARD_TUNING, blankBeat, createMeasure, createDefault, sanitize };
})();
