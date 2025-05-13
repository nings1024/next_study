'use client'

import { useState } from 'react'

type Cell = {
  value: number | null
  readOnly: boolean
}

const initialBoard: Cell[][] = [
  [{ value: 5, readOnly: true }, { value: 3, readOnly: true }, { value: null, readOnly: false }, { value: null, readOnly: false }, { value: 7, readOnly: true }, { value: null, readOnly: false }, { value: null, readOnly: false }, { value: null, readOnly: false }, { value: null, readOnly: false }],
  [{ value: 6, readOnly: true }, { value: null, readOnly: false }, { value: null, readOnly: false }, { value: 1, readOnly: true }, { value: 9, readOnly: true }, { value: 5, readOnly: true }, { value: null, readOnly: false }, { value: null, readOnly: false }, { value: null, readOnly: false }],
  [{ value: null, readOnly: false }, { value: 9, readOnly: true }, { value: 8, readOnly: true }, { value: null, readOnly: false }, { value: null, readOnly: false }, { value: null, readOnly: false }, { value: null, readOnly: false }, { value: 6, readOnly: true }, { value: null, readOnly: false }],
  [{ value: 8, readOnly: true }, { value: null, readOnly: false }, { value: null, readOnly: false }, { value: null, readOnly: false }, { value: 6, readOnly: true }, { value: null, readOnly: false }, { value: null, readOnly: false }, { value: null, readOnly: false }, { value: 3, readOnly: true }],
  [{ value: 4, readOnly: true }, { value: null, readOnly: false }, { value: null, readOnly: false }, { value: 8, readOnly: true }, { value: null, readOnly: false }, { value: 3, readOnly: true }, { value: null, readOnly: false }, { value: null, readOnly: false }, { value: 1, readOnly: true }],
  [{ value: 7, readOnly: true }, { value: null, readOnly: false }, { value: null, readOnly: false }, { value: null, readOnly: false }, { value: 2, readOnly: true }, { value: null, readOnly: false }, { value: null, readOnly: false }, { value: null, readOnly: false }, { value: 6, readOnly: true }],
  [{ value: null, readOnly: false }, { value: 6, readOnly: true }, { value: null, readOnly: false }, { value: null, readOnly: false }, { value: null, readOnly: false }, { value: null, readOnly: false }, { value: 2, readOnly: true }, { value: 8, readOnly: true }, { value: null, readOnly: false }],
  [{ value: null, readOnly: false }, { value: null, readOnly: false }, { value: null, readOnly: false }, { value: 4, readOnly: true }, { value: 1, readOnly: true }, { value: 9, readOnly: true }, { value: null, readOnly: false }, { value: null, readOnly: false }, { value: 5, readOnly: true }],
  [{ value: null, readOnly: false }, { value: null, readOnly: false }, { value: null, readOnly: false }, { value: null, readOnly: false }, { value: 8, readOnly: true }, { value: null, readOnly: false }, { value: null, readOnly: false }, { value: 7, readOnly: true }, { value: 9, readOnly: true }],
]

export default function SudokuPage() {
  const [board, setBoard] = useState<Cell[][]>(initialBoard)

  const handleChange = (row: number, col: number, val: string) => {
    const num = parseInt(val)
    if (isNaN(num) || num < 1 || num > 9) return

    const newBoard = board.map((r, i) =>
      r.map((cell, j) =>
        i === row && j === col ? { ...cell, value: num } : cell
      )
    )
    setBoard(newBoard)
  }

  return (
    <main className="p-8 flex flex-col items-center min-h-screen">
      <h1 className="text-2xl mb-6">🧩 简易数独</h1>
      <div className="grid grid-cols-9 gap-1">
        {board.map((row, i) =>
          row.map((cell, j) => (
            <input
              key={`${i}-${j}`}
              value={cell.value ?? ''}
              readOnly={cell.readOnly}
              onChange={(e) => handleChange(i, j, e.target.value)}
              className={`w-10 h-10 text-center text-lg border ${
                cell.readOnly ? 'bg-gray-200 font-bold' : 'bg-white'
              }`}
            />
          ))
        )}
      </div>
    </main>
  )
}
