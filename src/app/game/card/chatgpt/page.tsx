'use client'

import { useState, useEffect } from 'react'

type Card = {
  id: number
  symbol: string
  isFlipped: boolean
  isMatched: boolean
}

const symbols = ['🍎', '🍌', '🍎', '🍌'] // 简单两对

export default function GamePage() {
  const [cards, setCards] = useState<Card[]>([])
  const [flipped, setFlipped] = useState<number[]>([])

  // 初始化洗牌
  useEffect(() => {
    const shuffled = symbols
      .map((s, i) => ({ id: i, symbol: s, isFlipped: false, isMatched: false }))
      .sort(() => Math.random() - 0.5)
    setCards(shuffled)
  }, [])

  function handleFlip(index: number) {
    if (cards[index].isFlipped || cards[index].isMatched || flipped.length === 2) return

    const newCards = [...cards]
    newCards[index].isFlipped = true
    setCards(newCards)

    const newFlipped = [...flipped, index]
    setFlipped(newFlipped)

    if (newFlipped.length === 2) {
      const [i1, i2] = newFlipped
      if (newCards[i1].symbol === newCards[i2].symbol) {
        newCards[i1].isMatched = true
        newCards[i2].isMatched = true
        setCards(newCards)
        setFlipped([])
      } else {
        // 翻回去
        setTimeout(() => {
          newCards[i1].isFlipped = false
          newCards[i2].isFlipped = false
          setCards([...newCards])
          setFlipped([])
        }, 1000)
      }
    }
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8">
      <h1 className="text-2xl mb-6">🍓 简易翻牌游戏</h1>
      <div className="grid grid-cols-4 gap-4">
        {cards.map((card, idx) => (
          <button
            key={card.id}
            onClick={() => handleFlip(idx)}
            className="w-16 h-20 text-2xl border rounded flex items-center justify-center bg-white shadow"
          >
            {card.isFlipped || card.isMatched ? card.symbol : '❓'}
          </button>
        ))}
      </div>
    </main>
  )
}
