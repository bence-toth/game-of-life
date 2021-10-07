const gridSize = 100;

const getRandomCell = () => (Math.random() < 0.25 ? 1 : 0);

const getRandomRow = () => Array(gridSize).fill().map(getRandomCell);

const invertCell = (cell) => (cell === 1 ? 0 : 1);

let grid = Array(gridSize)
  .fill()
  .map(() => getRandomRow());

let gameIntervalId = null;

document.getElementById("table").innerHTML = grid
  .map(
    (row, rowIndex) =>
      `<div class="tr">${row
        .map(
          (cell, columnIndex) => `
          <div class="td${cell === 1 ? " alive" : ""}">
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
      if (grid[rowIndex][columnIndex] === 0) {
        cell.classList.remove("alive");
      } else {
        cell.classList.add("alive");
      }
    });
  });
};

const nextRound = () => {
  const nextGrid = [];
  grid.forEach((row, rowIndex) => {
    const nextRow = [];
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
        (neighbor) => neighbor === 1
      ).length;

      // Live cells
      if (grid[rowIndex][columnIndex] === 1) {
        // Any live cell with fewer than two live neighbours dies, as if by underpopulation.
        if (numberOfAliveNeighbors < 2) {
          nextRow.push(0);
          return;
        }
        // Any live cell with two or three live neighbours lives on to the next generation.
        else if ([2, 3].includes(numberOfAliveNeighbors)) {
          nextRow.push(1);
          return;
        }
        // Any live cell with more than three live neighbours dies, as if by overpopulation.
        else if (numberOfAliveNeighbors > 3) {
          nextRow.push(0);
          return;
        }
      }
      // Dead cells
      else {
        // Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.
        if (numberOfAliveNeighbors === 3) {
          nextRow.push(1);
          return;
        }
        // Any dead cell with more or less than three live neighbours will stay a dead cell.
        else {
          nextRow.push(0);
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
    gameIntervalId = setInterval(() => {
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
      grid[rowIndex][columnIndex] = 0;
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
    const rowIndex = Number(event.target.dataset.row);
    const columnIndex = Number(event.target.dataset.column);
    grid[rowIndex][columnIndex] = invertCell(grid[rowIndex][columnIndex]);
    if (gameIntervalId === null) {
      updateGrid();
    }
  });
});
