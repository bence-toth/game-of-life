const gridSize = 100;

const getRandomRow = () =>
  Array(gridSize)
    .fill()
    .map(() => (Math.random() < 0.5 ? 1 : 0));

let grid = Array(gridSize)
  .fill()
  .map(() => getRandomRow());

document.getElementById("table").innerHTML = grid
  .map(
    (row) =>
      `<div class="tr">${row
        .map((cell) => `<div class="td${cell === 1 ? " alive" : ""}"></div>`)
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
      let nextCellValue;
      if (grid[rowIndex][columnIndex] === 1) {
        // Any live cell with fewer than two live neighbours dies, as if by underpopulation.
        if (numberOfAliveNeighbors < 2) {
          nextCellValue = 0;
        }
        // Any live cell with two or three live neighbours lives on to the next generation.
        else if ([2, 3].includes(numberOfAliveNeighbors)) {
          nextCellValue = 1;
        }
        // Any live cell with more than three live neighbours dies, as if by overpopulation.
        else if (numberOfAliveNeighbors > 3) {
          nextCellValue = 0;
        }
      }
      // Dead cells
      else {
        // Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.
        if (numberOfAliveNeighbors === 3) {
          nextCellValue = 1;
        }
        // Any dead cell with more or less than three live neighbours will stay a dead cell.
        else {
          nextCellValue = 0;
        }
      }
      nextRow.push(nextCellValue);
    });
    nextGrid.push(nextRow);
  });
  grid = nextGrid;
};

setInterval(() => {
  nextRound();
  requestAnimationFrame(updateGrid);
}, 10);
