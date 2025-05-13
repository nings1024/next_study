'use client'

import React, { useState, useEffect } from 'react';

interface Cell {
  row: number;
  col: number;
  value: number | null;
  isFixed: boolean;
}

const generateSudoku = (emptyCells: number = 50): (number | null)[][] => {
  // 创建一个 9x9 的空数独
  const board: (number | null)[][] = Array(9).fill(null).map(() => Array(9).fill(null));

  // 填充对角线的 3x3 宫格
  for (let i = 0; i < 3; i++) {
    const numbers = shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        board[i * 3 + r][i * 3 + c] = numbers.pop() || null;
      }
    }
  }

  // TODO: 实现更完整的数独生成算法 (回溯法)
  // 这里为了简化，只填充了对角线宫格，并随机移除一些数字

  const solvedBoard = solveSudoku([...board]);
  if (!solvedBoard) {
    return generateSudoku(emptyCells); // 如果无法解决，重新生成
  }

  const puzzleBoard = solvedBoard.map(row => [...row]);
  let removedCount = 0;
  while (removedCount < emptyCells) {
    const row = Math.floor(Math.random() * 9);
    const col = Math.floor(Math.random() * 9);
    if (puzzleBoard[row][col] !== null) {
      puzzleBoard[row][col] = null;
      removedCount++;
    }
  }

  return puzzleBoard;
};

const solveSudoku = (board: (number | null)[][]): (number | null)[][] | false => {
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      if (board[i][j] === null) {
        for (let num = 1; num <= 9; num++) {
          if (isValidPlacement(board, num, i, j)) {
            board[i][j] = num;
            if (solveSudoku([...board])) {
              return board;
            } else {
              board[i][j] = null; // 回溯
            }
          }
        }
        return false; // 当前位置无法放置任何数字
      }
    }
  }
  return board; // 数独已解决
};

const isValidPlacement = (board: (number | null)[][], num: number, row: number, col: number): boolean => {
  // 检查同一行
  for (let i = 0; i < 9; i++) {
    if (board[row][i] === num) return false;
  }
  // 检查同一列
  for (let i = 0; i < 9; i++) {
    if (board[i][col] === num) return false;
  }
  // 检查 3x3 宫格
  const startRow = Math.floor(row / 3) * 3;
  const startCol = Math.floor(col / 3) * 3;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[startRow + i][startCol + j] === num) return false;
    }
  }
  return true;
};

function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

export default function SudokuGame() {
  const [board, setBoard] = useState<Cell[][]>([]);
  const [errorCells, setErrorCells] = useState<Set<string>>(new Set());

  useEffect(() => {
    const newSudoku = generateSudoku(50);
    const initialBoard: Cell[][] = newSudoku.map((row, rowIndex) =>
      row.map((value, colIndex) => ({
        row: rowIndex,
        col: colIndex,
        value,
        isFixed: value !== null,
      }))
    );
    setBoard(initialBoard);
    setErrorCells(new Set());
  }, []);

  const handleInputChange = (row: number, col: number, value: string) => {
    const num = parseInt(value, 10);
    if ((isNaN(num) || num < 1 || num > 9) && value !== '') {
      return; // 只允许输入 1-9 的数字
    }

    setBoard((prevBoard) =>
      prevBoard.map((boardRow) =>
        boardRow.map((cell) =>
          cell.row === row && cell.col === col && !cell.isFixed
            ? { ...cell, value: value === '' ? null : num }
            : cell
        )
      )
    );
    setErrorCells(new Set()); // 输入时清除错误提示
  };

  const validateBoard = () => {
    const newErrorCells = new Set<string>();
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        const currentValue = board[i][j].value;
        if (currentValue !== null) {
          // 检查行
          for (let k = 0; k < 9; k++) {
            if (k !== j && board[i][k].value === currentValue) {
              newErrorCells.add(`${i}-${j}`);
              newErrorCells.add(`${i}-${k}`);
            }
          }
          // 检查列
          for (let k = 0; k < 9; k++) {
            if (k !== i && board[k][j].value === currentValue) {
              newErrorCells.add(`${i}-${j}`);
              newErrorCells.add(`${k}-${j}`);
            }
          }
          // 检查 3x3 宫格
          const startRow = Math.floor(i / 3) * 3;
          const startCol = Math.floor(j / 3) * 3;
          for (let rowOffset = 0; rowOffset < 3; rowOffset++) {
            for (let colOffset = 0; colOffset < 3; colOffset++) {
              const r = startRow + rowOffset;
              const c = startCol + colOffset;
              if ((r !== i || c !== j) && board[r][c].value === currentValue) {
                newErrorCells.add(`${i}-${j}`);
                newErrorCells.add(`${r}-${c}`);
              }
            }
          }
        }
      }
    }
    setErrorCells(newErrorCells);
  };

  const isSolved = () => {
    
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (board==null|| board[i]==null ||board[i][j]==null || board[i][j].value === null) {
          return false;
        }
      }
    }
    validateBoard();
    return errorCells.size === 0;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', fontFamily: 'sans-serif' }}>
      <h1>数独</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(9, 50px)', gap: '2px', border: '2px solid black' }}>
        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <input
              key={`${rowIndex}-${colIndex}`}
              type="text"
              maxLength={1}
              value={cell.value === null ? '' : cell.value}
              className={`sudoku-cell ${cell.isFixed ? 'fixed' : ''} ${errorCells.has(`${rowIndex}-${colIndex}`) ? 'error' : ''}`}
              onChange={(e) => handleInputChange(cell.row, cell.col, e.target.value)}
              style={{
                width: '50px',
                height: '50px',
                textAlign: 'center',
                fontSize: '1.2em',
                border: '1px solid #ccc',
                fontWeight: cell.isFixed ? 'bold' : 'normal',
                backgroundColor: cell.isFixed ? '#eee' : 'white',
                // 每 3 行和 3 列添加更粗的边框
                borderBottom: (rowIndex + 1) % 3 === 0 ? '2px solid black' : '1px solid #ccc',
                borderRight: (colIndex + 1) % 3 === 0 ? '2px solid black' : '1px solid #ccc',
              }}
              readOnly={cell.isFixed}
            />
          ))
        )}
      </div>
      <div style={{ marginTop: '20px' }}>
        <button onClick={validateBoard}>检查</button>
        <button onClick={() => setBoard([])}>重新开始</button> {/* 简单的重新开始 */}
        {isSolved() && <p style={{ color: 'green', fontWeight: 'bold' }}>恭喜！数独已解决！</p>}
        {errorCells.size > 0 && <p style={{ color: 'red' }}>存在错误！</p>}
      </div>
    </div>
  );
}