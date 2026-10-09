window.TabRenderer = (() => {
  const STRINGS = ["E", "A", "D", "G", "B", "e"];

  function renderView(container, tab, onNoteClick) {
    container.innerHTML = "";

    tab.measures.forEach((measure, measureIndex) => {
      const measureElement = document.createElement("div");
      measureElement.className = "measure";
      measureElement.dataset.measure = measureIndex;

      const number = document.createElement("div");
      number.className = "measure-number";
      number.textContent = `Measure ${measureIndex + 1}`;
      measureElement.appendChild(number);

      for (let stringIndex = 0; stringIndex < 6; stringIndex += 1) {
        const row = document.createElement("div");
        row.className = "tab-string";

        const name = document.createElement("span");
        name.className = "string-name";
        name.textContent = STRINGS[stringIndex];
        row.appendChild(name);

        const notes = document.createElement("div");
        notes.className = "note-row";

        measure.forEach((beat, beatIndex) => {
          const note = document.createElement("span");
          note.className = "note clickable";
          note.dataset.measure = measureIndex;
          note.dataset.beat = beatIndex;
          note.dataset.string = stringIndex;

          const value = beat[stringIndex];
          note.textContent = value === "" ? "·" : value;

          note.addEventListener("click", () => {
            if (value !== "") onNoteClick(measureIndex, beatIndex, stringIndex, Number(value));
          });

          notes.appendChild(note);
        });

        row.appendChild(notes);
        measureElement.appendChild(row);
      }

      container.appendChild(measureElement);
    });
  }

  function renderEditor(container, tab, onChange) {
    container.innerHTML = "";

    tab.measures.forEach((measure, measureIndex) => {
      const section = document.createElement("div");
      section.className = "measure-editor";

      const heading = document.createElement("div");
      heading.className = "measure-editor-title";
      heading.textContent = `Measure ${measureIndex + 1}`;
      section.appendChild(heading);

      const wrap = document.createElement("div");
      wrap.className = "editor-wrap";

      const grid = document.createElement("div");
      grid.className = "editor-grid";

      for (let stringIndex = 0; stringIndex < 6; stringIndex += 1) {
        const row = document.createElement("div");
        row.className = "editor-row";
        row.style.setProperty("--beats", measure.length);

        const label = document.createElement("div");
        label.className = "editor-label";
        label.textContent = STRINGS[stringIndex];
        row.appendChild(label);

        measure.forEach((beat, beatIndex) => {
          const input = document.createElement("input");
          input.className = "editor-cell";
          input.type = "text";
          input.inputMode = "numeric";
          input.maxLength = 2;
          input.value = beat[stringIndex];
          input.setAttribute("aria-label", `Measure ${measureIndex + 1}, beat ${beatIndex + 1}, string ${STRINGS[stringIndex]}`);

          input.addEventListener("input", () => {
            const value = input.value.replace(/[^\d]/g, "").slice(0, 2);
            input.value = value;
            tab.measures[measureIndex][beatIndex][stringIndex] = value;
            onChange();
          });

          input.addEventListener("keydown", event => {
            if (event.key === "ArrowRight" || event.key === "Tab") {
              const next = input.parentElement?.children[input.cellIndex + 1];
              if (next && next.tagName === "INPUT") {
                event.preventDefault();
                next.focus();
              }
            }
          });

          row.appendChild(input);
        });

        grid.appendChild(row);
      }

      wrap.appendChild(grid);
      section.appendChild(wrap);
      container.appendChild(section);
    });
  }

  function clearCurrent(container) {
    container.querySelectorAll(".current").forEach(node => node.classList.remove("current"));
  }

  function highlight(container, measureIndex, beatIndex) {
    clearCurrent(container);

    if (measureIndex < 0) return;

    container.querySelectorAll(
      `.note[data-measure="${measureIndex}"][data-beat="${beatIndex}"]`
    ).forEach(node => node.classList.add("current"));
  }

  return { renderView, renderEditor, highlight };
})();
