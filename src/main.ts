const board = document.querySelector("[data-board]") as HTMLDivElement;
const statusText = document.querySelector("[data-status]") as HTMLParagraphElement;
const mineCount = document.querySelector("[data-mine-count]") as HTMLSpanElement;

const BOARD_SIZE = 10;
const NUMBER_OF_MINE = 10;

const STATUSES = {
   HIDDEN: "hidden",
   MINE: "mine",
   MARKED: "marked",
   NUMBER: "number"
};

type cell = {
   x: number
   y: number
   element: HTMLDivElement
   isMine: boolean
}

type position = {
   x: number
   y: number
}

displayCells();

function createCells(boardSize: number, numberOfMine: number) {
   const cellArray = [];
   const minePositions = getMinePositions(boardSize, numberOfMine);
   for (let x = 0; x < boardSize; x++) {
      const row = [];
      for (let y = 0; y < boardSize; y++) {
         const cellElement = document.createElement("div");
         cellElement.classList.add("cell");
         cellElement.dataset.status = STATUSES.HIDDEN;
         const cell = {x, y, element: cellElement, isMine: minePositions.some(position => checkMatch(position, {x, y}))};
         row.push(cell);
      }
      cellArray.push(row);
   }
   return cellArray;
}

function getMinePositions(boardSize: number, numberOfMine: number) {
   const positions: position[] = [];
   while (positions.length < numberOfMine) {
      const position = {
         x: getRandomNumber(boardSize),
         y: getRandomNumber(boardSize)
      };
      if (!positions.some(p => checkMatch(p, position))) {
         positions.push(position);
      }
   }
   return positions;
}

function getRandomNumber(size: number) {
   return Math.floor(Math.random() * size);
}

function checkMatch(a: position, b: position) {
   return a.x === b.x && a.y === b.y;
}

function displayCells() {
   const cells = createCells(BOARD_SIZE, NUMBER_OF_MINE);
   cells.forEach(row => {
      row.forEach(cell => {
         const cellElement = cell.element;
         cellElement.addEventListener("click", () => {
            revealCell(cells, cell);
            checkGameStatus(cells);
         });
         cellElement.addEventListener("contextmenu", (e) => {
            e.preventDefault();
            markCell(cell);
            listMinesLeft(cells);
         });
         board.appendChild(cellElement);
      });
   });
}

function revealCell(cells: cell[][], cell: cell) {
   const {element, isMine} = cell;
   if (element.dataset.status !== STATUSES.HIDDEN) return;
   if (isMine) {
      element.dataset.status = STATUSES.MINE;
      return;
   }
   element.dataset.status = STATUSES.NUMBER;
   const adjacentCells = getAdjacentCells(cells, cell);
   const mines = adjacentCells.filter(c => c.isMine);
   if (mines.length === 0) {
      adjacentCells.forEach(c => revealCell(cells, c));
   } else {
      element.textContent = mines.length.toString();
   }
}

function checkGameStatus(cells: cell[][]) {
  const hasWon = checkWin(cells);
  const hasLost = checkLose(cells);

  if (hasWon || hasLost) {
    board.addEventListener("click", (e) => {
      e.stopImmediatePropagation();
    }, {capture: true});

    board.addEventListener("contextmenu", (e) => {
      e.stopImmediatePropagation();
    }, {capture: true});
  }

  if (hasWon) {
    statusText.textContent = "You Win.";
  }

  if (hasLost) {
   statusText.textContent = "You Lost.";
 }
}

function checkWin(cells: cell[][]) {
   return cells.every(row => {
      return row.every(cell => {
         const cellStatus = cell.element.dataset.status;
         return cellStatus === STATUSES.NUMBER || (cell.isMine && cellStatus === STATUSES.HIDDEN || cellStatus === STATUSES.MARKED);
      });
   });
}

function checkLose(cells: cell[][]) {
   return cells.some(row => {
      return row.some(cell => cell.element.dataset.status === STATUSES.MINE);
   });
}

function listMinesLeft(cells: cell[][]) {
   const markedCellsCount = cells.reduce((count, row) => {
      return count + row.filter(cell => cell.element.dataset.status === STATUSES.MARKED).length;
   }, 0);
   mineCount.textContent = (NUMBER_OF_MINE - markedCellsCount).toString();
 }

function getAdjacentCells(cells: cell[][], cell: cell) {
   const {x, y} = cell;
   const adjacentCells = [];
   for (let xOffest = -1; xOffest <= 1; xOffest++) {
     for (let yOffest = -1; yOffest <= 1; yOffest++) {
       const adjacentCell = cells[x + xOffest]?.[y + yOffest];
       if (adjacentCell != null) {
         adjacentCells.push(adjacentCell);
       }
     }
   }
   return adjacentCells;
 }

function markCell(cell: cell) {
   const cellStatus = cell.element.dataset.status;
   if (cellStatus !== STATUSES.HIDDEN && cellStatus !== STATUSES.MARKED) return;
   if (cellStatus === STATUSES.HIDDEN) {
      cell.element.dataset.status = STATUSES.MARKED;
   } else {
      cell.element.dataset.status = STATUSES.HIDDEN;
   }
}