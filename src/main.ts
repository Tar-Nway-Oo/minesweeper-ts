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
         const cell = {x, y, element: cellElement, isMine: minePositions.some(position => isMatched(position, {x, y}))};
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
      if (!positions.some(p => isMatched(p, position))) {
         positions.push(position);
      }
   }
   return positions;
}

function getRandomNumber(size: number) {
   return Math.floor(Math.random() * size);
}

function isMatched(a: position, b: position) {
   return a.x === b.x && a.y === b.y;
}

function displayCells() {
   const cells = createCells(BOARD_SIZE, NUMBER_OF_MINE);
   cells.forEach(row => {
      row.forEach(cell => {
         const cellElement = cell.element;
         cellElement.addEventListener("click", () => revealCell(cells, cell));
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
   const mines = adjacentCells.filter(cell => cell.isMine);
   if (mines.length === 0) {
      adjacentCells.forEach(c => revealCell(cells, c));
   } else {
      element.textContent = mines.length.toString();
   }
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
   for (let xOffest = -1; xOffest < 2; xOffest++) {
     for (let yOffest = -1; yOffest < 2; yOffest++) {
       const adjacentCell = cells[x + xOffest]?.[y + yOffest];
       adjacentCells.push(adjacentCell);
     }
   }
   return adjacentCells;
 }

function markCell(cell: cell) {
   const {element} = cell;
   if (element.dataset.status !== STATUSES.HIDDEN && element.dataset.status !== STATUSES.MARKED) return;
   if (element.dataset.status === STATUSES.HIDDEN) {
      element.dataset.status = STATUSES.MARKED;
   } else {
      element.dataset.status = STATUSES.HIDDEN;
   }
}