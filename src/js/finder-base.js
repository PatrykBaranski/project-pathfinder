import Modal from "./modal.js";
import { flatMeshToSingleArray } from "./utils.js";

class FinderBase {
  constructor(meshSize) {
    this.meshSize = meshSize;
    this.startAndEndCords = {};
    this.directions = [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
    ];
    this.generateHTMLElements();
    this.generateMesh();
    this.generateSteps();
    this.setStep(this.finderStep.begin);
    this.initBtn();
    this.initFieldClick();
    this.initRandomRoutesButton();
  }

  generateSteps() {
    this.finderStep = {
      begin: {
        step: "begin",
        btnText: "Finish drawing",
        headerText: "DRAW ROUTES",
      },
      compute: {
        step: "compute",
        btnText: "Compute",
        headerText: "PICK START AND FINISH",
      },
      replay: {
        step: "replay",
        btnText: "Start again",
        headerText: "THE BEST ROUTE IS...",
      },
    };
  }

  generateHTMLElements() {
    this.drawingContainer = document.querySelector(".drawing-container");
    this.stepTitle = document.querySelector(".step-title");
    this.btnStep = document.querySelector(".btnChangeStep");
    this.btnRandomRoutes = document.querySelector(".btnRandomRoutes");
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

  setStep({ step, headerText, btnText }) {
    this.stepTitle.textContent = headerText;
    this.btnStep.textContent = btnText;
    this.currentStep = step;
  }

  initBtn() {
    this.btnStep.addEventListener("click", () => {
      const { finderStep, currentStep, startAndEndCords, mesh } = this;

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
          const computed = this.computeBestRoute();
          this.setStep(finderStep.replay);

          if (computed) {
            document.body.scrollTo(0, 0);
            document.body.style.overflow = "hidden";

            new Modal([
              this.fullMeshLength,
              this.shortestRouteLength,
              this.longestRouteLength,
            ]);
          }

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

  initFieldClick() {
    this.drawingContainer.addEventListener("click", (e) => {
      const { currentStep, finderStep } = this;
      const clickedField = e.target;

      if (!clickedField.classList.contains("field")) return;

      if (currentStep === finderStep.begin.step) {
        this.toggleField(clickedField);
      }
      if (currentStep === finderStep.compute.step)
        this.choseStartAndFinish(clickedField);
    });
  }

  initRandomRoutesButton() {
    this.btnRandomRoutes.addEventListener("click", () => {
      this.generateRandomRoutes();
    });
  }

  generateRandomRoutes() {
    const { mesh, meshSize, finderStep } = this;

    this.drawingContainer
      .querySelectorAll(
        ".field.selected, .field.success, .field.longest, .field.possible"
      )
      .forEach((field) => {
        field.classList.remove("selected", "success", "longest", "possible");
        field.textContent = "";
      });

    for (let i = 1; i <= meshSize; i++) {
      for (let j = 1; j <= meshSize; j++) {
        mesh[i][j] = false;
      }
    }

    this.setStep(finderStep.begin);

    for (let i = 0; i < meshSize * 5; i++) {
      let randomRow, randomColumn;

      do {
        randomRow = Math.floor(Math.random() * meshSize) + 1;
        randomColumn = Math.floor(Math.random() * meshSize) + 1;
      } while (!this.isValidRandomRoute(randomRow, randomColumn));

      mesh[randomRow][randomColumn] = true;
      this.selectFieldElem(randomRow, randomColumn).classList.add("selected");
    }
  }

  isValidRandomRoute(row, column) {
    const { mesh } = this;

    if (flatMeshToSingleArray(mesh).includes(true)) {
      const edgeFields = [
        mesh[row - 1]?.[column],
        mesh[row + 1]?.[column],
        mesh[row]?.[column - 1],
        mesh[row]?.[column + 1],
      ];

      if (!edgeFields.includes(true)) {
        return false;
      }
    }

    return true;
  }
}
export default FinderBase;
