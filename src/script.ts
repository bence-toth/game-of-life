enum Field {
  Void,
  Cell,
}

const gridSize = 100;

const getRandomCell = () => (Math.random() < 0.25 ? Field.Cell : Field.Void);

const getRandomRow = () => Array(gridSize).fill(undefined).map(getRandomCell);

const invertCell = (cell: number) =>
  cell === Field.Cell ? Field.Void : Field.Cell;

let grid = Array(gridSize)
  .fill(undefined)
  .map(() => getRandomRow());

let gameIntervalId: number | null = null;

document.getElementById("table").innerHTML = grid
  .map(
    (row, rowIndex) =>
      `<div class="tr">${row
        .map(
          (cell, columnIndex) => `
          <div class="td${cell === Field.Cell ? " alive" : ""}">
            <button data-row="${rowIndex}" data-column="${columnIndex}"></button>
          </div>
          `
        )
        .join("")}</div>`
  )
  .join("");

const rows = document.querySelectorAll("#table .tr");
const cells = [...rows].map((row) => row.querySelectorAll(".td"));

const updateGrid = () => {
  cells.forEach((row, rowIndex) => {
    row.forEach((cell, columnIndex) => {
      if (grid[rowIndex][columnIndex] === Field.Void) {
        cell.classList.remove("alive");
      } else {
        cell.classList.add("alive");
      }
    });
  });
};

const nextRound = () => {
  const nextGrid: Field[][] = [];
  grid.forEach((row, rowIndex) => {
    const nextRow: Field[] = [];
    row.forEach((_, columnIndex) => {
      const neighbors = [
        (grid[rowIndex - 1] ?? [])[columnIndex - 1],
        (grid[rowIndex - 1] ?? [])[columnIndex],
        (grid[rowIndex - 1] ?? [])[columnIndex + 1],
        (grid[rowIndex] ?? [])[columnIndex - 1],
        (grid[rowIndex] ?? [])[columnIndex + 1],
        (grid[rowIndex + 1] ?? [])[columnIndex - 1],
        (grid[rowIndex + 1] ?? [])[columnIndex],
        (grid[rowIndex + 1] ?? [])[columnIndex + 1],
      ];
      const numberOfAliveNeighbors = neighbors.filter(
        (neighbor) => neighbor === Field.Cell
      ).length;

      // Live cells
      if (grid[rowIndex][columnIndex] === Field.Cell) {
        // Any live cell with fewer than two live neighbours dies, as if by underpopulation.
        if (numberOfAliveNeighbors < 2) {
          nextRow.push(Field.Void);
          return;
        }
        // Any live cell with two or three live neighbours lives on to the next generation.
        else if ([2, 3].includes(numberOfAliveNeighbors)) {
          nextRow.push(Field.Cell);
          return;
        }
        // Any live cell with more than three live neighbours dies, as if by overpopulation.
        else if (numberOfAliveNeighbors > 3) {
          nextRow.push(Field.Void);
          return;
        }
      }
      // Dead cells
      else {
        // Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.
        if (numberOfAliveNeighbors === 3) {
          nextRow.push(Field.Cell);
          return;
        }
        // Any dead cell with more or less than three live neighbours will stay a dead cell.
        else {
          nextRow.push(Field.Void);
          return;
        }
      }
    });
    nextGrid.push(nextRow);
  });
  grid = nextGrid;
};

const playButton = document.getElementById("play");
playButton.addEventListener("click", () => {
  if (gameIntervalId === null) {
    gameIntervalId = window.setInterval(() => {
      nextRound();
      requestAnimationFrame(updateGrid);
    }, 50);
    playButton.innerText = "Pause";
  } else {
    clearInterval(gameIntervalId);
    gameIntervalId = null;
    playButton.innerText = "Play";
  }
});

const randomizeButton = document.getElementById("randomize");
randomizeButton.addEventListener("click", () => {
  grid.forEach((row, rowIndex) => {
    row.forEach((_, columnIndex) => {
      grid[rowIndex][columnIndex] = getRandomCell();
    });
  });
  if (gameIntervalId === null) {
    updateGrid();
  }
});

const clearButton = document.getElementById("clear");
clearButton.addEventListener("click", () => {
  grid.forEach((row, rowIndex) => {
    row.forEach((_, columnIndex) => {
      grid[rowIndex][columnIndex] = Field.Void;
    });
  });
  if (gameIntervalId === null) {
    updateGrid();
  } else {
    clearInterval(gameIntervalId);
    gameIntervalId = null;
    playButton.innerText = "Play";
    updateGrid();
  }
});

const cellButtons = document.querySelectorAll("#table button");
cellButtons.forEach((cellButton) => {
  cellButton.addEventListener("click", (event) => {
    const button = event.target as HTMLButtonElement;
    const rowIndex = Number(button.dataset.row);
    const columnIndex = Number(button.dataset.column);
    grid[rowIndex][columnIndex] = invertCell(grid[rowIndex][columnIndex]);
    if (gameIntervalId === null) {
      updateGrid();
    }
  });
});
