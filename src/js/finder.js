import FinderBase from "./finder-base.js";
import { flatMeshToSingleArray } from "./utils.js";

class Finder extends FinderBase {
  constructor(meshSize) {
    super(meshSize);
  }

  toggleField(clickedField) {
    const { mesh, meshSize } = this;

    const field = {
      row: +clickedField.dataset.row,
      column: +clickedField.dataset.column,
    };

    const edgeFields = [];
    if (field.row > 1) edgeFields.push(mesh[field.row - 1][field.column]);
    if (field.row < meshSize)
      edgeFields.push(mesh[field.row + 1][field.column]);
    if (field.column > 1) edgeFields.push(mesh[field.row][field.column - 1]);
    if (field.column < meshSize)
      edgeFields.push(mesh[field.row][field.column + 1]);

    if (mesh[field.row][field.column]) {
      // maybe some kind of dfs would be better here (?)
      if (
        (edgeFields[0] && edgeFields[1] && !edgeFields[2] && !edgeFields[3]) ||
        (edgeFields[2] && edgeFields[3] && !edgeFields[0] && !edgeFields[1]) ||
        (edgeFields[0] && edgeFields[1] && edgeFields[2] && edgeFields[3])
      ) {
        return;
      }

      mesh[field.row][field.column] = false;
      clickedField.classList.remove("selected");
    } else {
      if (flatMeshToSingleArray(mesh).includes(true)) {
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

  selectFieldElem(row, column) {
    return document.querySelector(
      `[data-row="${row}"][data-column="${column}"]`
    );
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

  computeBestRoute() {
    const { startAndEndCords, mesh, meshSize, directions } = this;
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

      this.fullMeshLength = flatMeshToSingleArray(mesh).filter(
        (field) => field === true
      ).length;

      this.shortestRouteLength = shortestRoute.length;
      this.longestRouteLength = longestRoute.length;

      shortestRoute.forEach(({ row, column }) => {
        this.selectFieldElem(row, column).classList.add("success");
      });
      longestRoute.forEach(({ row, column }) => {
        this.selectFieldElem(row, column).classList.add("longest");
        this.selectFieldElem(row, column).textContent = "L";
      });

      return true;
    } else {
      alert("I could not find any path to go :(");
      return false;
    }
  }

  resetFinder() {
    this.startAndEndCords = {};
    this.drawingContainer.innerHTML = "";
    this.generateMesh();
  }
}
export default Finder;
