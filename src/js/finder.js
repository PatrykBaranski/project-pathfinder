import Modal from "./modal.js";

class Finder {
  constructor(meshSize) {
    this.meshSize = meshSize;
    this.startAndEndCords = {};
    this.generateHTMLElements();
    this.generateMesh();
    this.generateSteps();
    this.setStep(this.finderStep.begin);
    this.initFieldClick();
    this.initBtn();
  }

  generateSteps() {
    this.finderStep = {
      begin: {
        step: "begin",
        btnText: "FINISH DRAWING",
        headerText: "DRAW ROUTES",
      },
      compute: {
        step: "compute",
        btnText: "COMPUTE",
        headerText: "PICK START AND FINISH",
      },
      replay: {
        step: "replay",
        btnText: "START AGAIN",
        headerText: "THE BEST ROUTE IS...",
      },
    };
  }

  generateHTMLElements() {
    this.drawingContainer = document.querySelector(".drawing-container");
    this.stepTitle = document.querySelector(".step-title");
    this.btnStep = document.querySelector(".btnChangeStep");
  }

  generateMesh() {
    const { drawingContainer, meshSize } = this;
    this.mesh = {};

    for (let i = 1; i <= meshSize; i++) {
      this.mesh[i] = {};
      for (let j = 1; j <= meshSize; j++) {
        this.mesh[i][j] = false;
        drawingContainer.innerHTML += `<div class="field" data-row="${i}" data-column="${j}"></div>`;
      }
    }
  }

  flatMeshToSingleArray(mesh) {
    return Object.values(mesh)
      .map((e) => Object.values(e))
      .flat();
  }

  toggleField(clickedField) {
    const { mesh } = this;

    const field = {
      row: +clickedField.dataset.row,
      column: +clickedField.dataset.column,
    };

    const edgeFields = [];
    if (field.row > 1) edgeFields.push(mesh[field.row - 1][field.column]);
    if (field.row < 10) edgeFields.push(mesh[field.row + 1][field.column]);
    if (field.column > 1) edgeFields.push(mesh[field.row][field.column - 1]);
    if (field.column < 10) edgeFields.push(mesh[field.row][field.column + 1]);

    if (mesh[field.row][field.column]) {
      mesh[field.row][field.column] = false;
      clickedField.classList.remove("selected");
    } else {
      if (this.flatMeshToSingleArray(mesh).includes(true)) {
        if (!edgeFields.includes(true)) {
          alert(
            "A new field should touch at least one that is already selected!"
          );
          return;
        }
      }
      mesh[field.row][field.column] = true;
      clickedField.classList.add("selected");
    }
  }

  choseStartAndFinish(clickedField) {
    const { startAndEndCords, selectFieldElem } = this;
    const field = {
      row: +clickedField.dataset.row,
      column: +clickedField.dataset.column,
    };

    if (!clickedField.classList.contains("selected")) {
      alert("Pls select a checked field");
      return;
    }
    if ("start" in startAndEndCords && "end" in startAndEndCords) {
      if (
        field.row === startAndEndCords.start.row &&
        field.column === startAndEndCords.start.column
      ) {
        clickedField.classList.remove("success");
        delete startAndEndCords.start;
        return;
      }
      if (
        field.row === startAndEndCords.end.row &&
        field.column === startAndEndCords.end.column
      ) {
        clickedField.classList.remove("success");
        delete startAndEndCords.end;
        return;
      }

      selectFieldElem(
        startAndEndCords.start.row,
        startAndEndCords.start.column
      ).classList.remove("success");

      startAndEndCords.start = startAndEndCords.end;
      startAndEndCords.end = { row: field.row, column: field.column };
      clickedField.classList.add("success");
    }
    if (!("start" in startAndEndCords)) {
      if (
        field.row === startAndEndCords?.end?.row &&
        field.column === startAndEndCords?.end?.column
      ) {
        clickedField.classList.remove("success");
        delete startAndEndCords.end;
        return;
      }
      startAndEndCords.start = { row: field.row, column: field.column };
      clickedField.classList.add("success");
      return;
    }
    if ("start" in startAndEndCords && !("end" in startAndEndCords)) {
      if (
        field.row === startAndEndCords.start.row &&
        field.column === startAndEndCords.start.column
      ) {
        clickedField.classList.remove("success");
        delete startAndEndCords.start;
        return;
      }
      startAndEndCords.end = { row: field.row, column: field.column };
      clickedField.classList.add("success");
      return;
    }
  }

  initFieldClick() {
    this.drawingContainer.addEventListener("click", (e) => {
      const { currentStep, finderStep } = this;
      const clickedField = e.target;

      if (!clickedField.classList.contains("field")) return;

      if (currentStep === finderStep.begin.step) this.toggleField(clickedField);
      if (currentStep === finderStep.compute.step)
        this.choseStartAndFinish(clickedField);
    });
  }

  computeBestRoute() {
    const { startAndEndCords, mesh, meshSize } = this;
    const { start: startCords, end: endCords } = startAndEndCords;

    const result = [];
    const stack = [
      {
        ...startCords,
        path: [startCords],
        visited: new Set(),
      },
    ];

    while (stack.length) {
      const current = stack.pop();
      const { row, column, path, visited } = current;

      if (row === endCords.row && column === endCords.column) {
        result.push(path);
        continue;
      }

      const directions = [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1],
      ];

      for (const [x, y] of directions) {
        const r = row + x;
        const c = column + y;

        if (r < 1 || r > meshSize || c < 1 || c > meshSize) continue;

        if (!mesh[r][c]) continue;

        if (visited.has(`${r}|${c}`)) continue;

        visited.add(`${r}|${c}`);

        stack.push({
          row: r,
          column: c,
          path: [...path, { row: r, column: c }],
          visited: new Set(visited),
        });
      }
    }

    if (result.length) {
      const longestRoute = result.reduce((a, b) =>
        a.length > b.length ? a : b
      );
      const shortestRoute = result.reduce((a, b) =>
        a.length < b.length ? a : b
      );

      this.fullMeshLength = this.flatMeshToSingleArray(mesh).filter(
        (field) => field === true
      ).length;

      this.shortestRouteLength = shortestRoute.length;
      this.longestRouteLength = longestRoute.length;

      shortestRoute.forEach(({ row, column }) => {
        this.selectFieldElem(row, column).classList.add("success");
      });
    } else {
      alert("I could not find any path to go :(");
    }
  }

  initBtn() {
    this.btnStep.addEventListener("click", () => {
      const {
        finderStep,
        currentStep,
        startAndEndCords,
        mesh,
        flatMeshToSingleArray,
      } = this;

      if (currentStep === finderStep.begin.step) {
        const flatMesh = flatMeshToSingleArray(mesh);
        if (flatMesh.filter((field) => field === true).length < 2) {
          alert("Pleas select at least 2 fields");
          return;
        }
        this.setStep(finderStep.compute);
        return;
      }
      if (currentStep === finderStep.compute.step) {
        if (!("start" in startAndEndCords) || !("end" in startAndEndCords)) {
          alert("Pls chose a start and finish for route");
        } else {
          this.computeBestRoute();
          this.setStep(finderStep.replay);
          new Modal([
            this.fullMeshLength,
            this.shortestRouteLength,
            this.longestRouteLength,
          ]);
          return;
        }
      }
      if (currentStep === finderStep.replay.step) {
        this.resetFinder();
        this.setStep(finderStep.begin);
        return;
      }
    });
  }

  resetFinder() {
    this.startAndEndCords = {};
    this.drawingContainer.innerHTML = "";
    this.generateMesh();
  }

  setStep({ step, headerText, btnText }) {
    this.stepTitle.textContent = headerText;
    this.btnStep.textContent = btnText;
    this.currentStep = step;
  }

  selectFieldElem(row, column) {
    return document.querySelector(
      `[data-row="${row}"][data-column="${column}"]`
    );
  }
}
export default Finder;
