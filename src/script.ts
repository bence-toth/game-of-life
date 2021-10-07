// Types
enum Field {
  Void,
  Cell,
}

// Options
const worldSize = 100;

// Nodes
const playButtonNode = document.getElementById("play");
const randomizeButtonNode = document.getElementById("randomize");
// const clearButtonNode = document.getElementById("clear");
const worldNode = document.getElementById("world");

// Renderers
const renderField = (rowIndex: number) => (field: Field, columnIndex: number) =>
  `
    <div class="field${field === Field.Cell ? " cell" : ""}">
      <button data-row="${rowIndex}" data-column="${columnIndex}"></button>
    </div>
  `;

const renderRow = (row: Field[], rowIndex: number) => `
  <div class="row">
    ${row.map(renderField(rowIndex)).join("")}
  </div>
`;

const renderWorld = (world: Field[][]) => world.map(renderRow).join("");

// Utility
const getRandomField = () => (Math.random() < 0.25 ? Field.Cell : Field.Void);

const getRandomRow = () => Array(worldSize).fill(undefined).map(getRandomField);

const getRandomWorld = (worldSize: number) =>
  Array(worldSize).fill(undefined).map(getRandomRow);

const invertField = (field: number) =>
  field === Field.Cell ? Field.Void : Field.Cell;

const getNeighbors = (
  world: Field[][],
  rowIndex: number,
  columnIndex: number
) => [
  (world[rowIndex - 1] ?? [])[columnIndex - 1],
  (world[rowIndex - 1] ?? [])[columnIndex],
  (world[rowIndex - 1] ?? [])[columnIndex + 1],
  (world[rowIndex] ?? [])[columnIndex - 1],
  (world[rowIndex] ?? [])[columnIndex + 1],
  (world[rowIndex + 1] ?? [])[columnIndex - 1],
  (world[rowIndex + 1] ?? [])[columnIndex],
  (world[rowIndex + 1] ?? [])[columnIndex + 1],
];

const getNextFieldState = (
  currentFieldState: Field,
  numberOfCellNeighbors: number
) => {
  // Cells
  if (currentFieldState === Field.Cell) {
    // Any cell with fewer than two cell neighbors will become void, dying by isolation.
    if (numberOfCellNeighbors < 2) {
      return Field.Void;
    }
    // Any cell with two or three cell neighbors will stay a cell.
    else if ([2, 3].includes(numberOfCellNeighbors)) {
      return Field.Cell;
    }
    // Any cell with more than three cell neighbors will become void, dying by overpopulation.
    else if (numberOfCellNeighbors > 3) {
      return Field.Void;
    }
  }
  // Void
  else {
    // Any void with exactly three cell neighbors becomes a cell, born by reproduction.
    if (numberOfCellNeighbors === 3) {
      return Field.Cell;
    }
    // Any void with more or less than three cell neighbors will stay void.
    else {
      return Field.Void;
    }
  }
};

const getNextWorld = (currentWorld: Field[][]) => {
  const nextWorld: Field[][] = [];
  currentWorld.forEach((row, rowIndex) => {
    const nextRow: Field[] = [];
    row.forEach((field, columnIndex) => {
      const neighbors = getNeighbors(currentWorld, rowIndex, columnIndex);
      const numberOfCellNeighbors = neighbors.filter(
        (neighbor) => neighbor === Field.Cell
      ).length;
      nextRow.push(getNextFieldState(field, numberOfCellNeighbors));
    });
    nextWorld.push(nextRow);
  });
  return nextWorld;
};

// Game engine
let world = getRandomWorld(worldSize);

const initWorld = () => {
  worldNode.innerHTML = renderWorld(world);
  const rows = worldNode.querySelectorAll(".row");
  return {
    fieldNodes: [...rows].map((row) => row.querySelectorAll(".field")),
    // fieldButtonNodes: worldNode.querySelectorAll("button"),
  };
};

const { fieldNodes /*, fieldButtonNodes */ } = initWorld();

const rehydrateFieldNodes = () => {
  fieldNodes.forEach((row, rowIndex) => {
    row.forEach((fieldNode, columnIndex) => {
      if (world[rowIndex][columnIndex] === Field.Void) {
        fieldNode.classList.remove("cell");
      } else {
        fieldNode.classList.add("cell");
      }
    });
  });
};

const nextGeneration = () => {
  world = getNextWorld(world);
};

let gameIntervalId: number | null = null;

const play = () => {
  nextGeneration();
  requestAnimationFrame(rehydrateFieldNodes);
};

const pause = () => {
  clearInterval(gameIntervalId);
  gameIntervalId = null;
};

// Controls
playButtonNode.addEventListener("click", () => {
  if (gameIntervalId === null) {
    gameIntervalId = window.setInterval(play, 50);
    playButtonNode.innerText = "Pause";
  } else {
    pause();
    playButtonNode.innerText = "Play";
  }
});

randomizeButtonNode.addEventListener("click", () => {
  world.forEach((row, rowIndex) => {
    row.forEach((_, columnIndex) => {
      world[rowIndex][columnIndex] = getRandomField();
    });
  });
  if (gameIntervalId === null) {
    rehydrateFieldNodes();
  }
});

// clearButtonNode.addEventListener("click", () => {
//   world.forEach((row, rowIndex) => {
//     row.forEach((_, columnIndex) => {
//       world[rowIndex][columnIndex] = Field.Void;
//     });
//   });
//   if (gameIntervalId === null) {
//     rehydrateFieldNodes();
//   } else {
//     pause();
//     playButtonNode.innerText = "Play";
//     rehydrateFieldNodes();
//   }
// });

// fieldButtonNodes.forEach((fieldButtonNode) => {
//   fieldButtonNode.addEventListener("click", (event) => {
//     const button = event.target as HTMLButtonElement;
//     const rowIndex = Number(button.dataset.row);
//     const columnIndex = Number(button.dataset.column);
//     world[rowIndex][columnIndex] = invertField(world[rowIndex][columnIndex]);
//     if (gameIntervalId === null) {
//       rehydrateFieldNodes();
//     }
//   });
// });
