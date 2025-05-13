'use client'

import React, { useState, useEffect } from 'react';

interface Card {
  id: number;
  value: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const cardValues = ['A', 'B', 'C', 'A', 'B', 'C'];

function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

export default function Home() {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [matchedIndices, setMatchedIndices] = useState<number[]>([]);
  const [moves, setMoves] = useState<number>(0);

  useEffect(() => {
    startGame();
  }, []);

  const startGame = () => {
    setCards(
      shuffleArray(cardValues).map((value, index) => ({
        id: index,
        value,
        isFlipped: false,
        isMatched: false,
      }))
    );
    setFlippedIndices([]);
    setMatchedIndices([]);
    setMoves(0);
  };

  const handleCardClick = (index: number) => {
    if (flippedIndices.length < 2 && !flippedIndices.includes(index) && !matchedIndices.includes(index)) {
      setFlippedIndices([...flippedIndices, index]);
      setCards((prevCards) =>
        prevCards.map((card) =>
          card.id === index ? { ...card, isFlipped: true } : card
        )
      );
    }
  };

  useEffect(() => {
    if (flippedIndices.length === 2) {
      setMoves((prevMoves) => prevMoves + 1);
      const [firstIndex, secondIndex] = flippedIndices;
      if (cards[firstIndex].value === cards[secondIndex].value) {
        setMatchedIndices([...matchedIndices, firstIndex, secondIndex]);
        setCards((prevCards) =>
          prevCards.map((card) =>
            card.id === firstIndex || card.id === secondIndex
              ? { ...card, isMatched: true }
              : card
          )
        );
        setFlippedIndices([]);
      } else {
        setTimeout(() => {
          setCards((prevCards) =>
            prevCards.map((card) =>
              card.id === firstIndex || card.id === secondIndex
                ? { ...card, isFlipped: false }
                : card
            )
          );
          setFlippedIndices([]);
        }, 1000);
      }
    }
  }, [flippedIndices, cards, matchedIndices]);

  const hasWon = matchedIndices.length === cards.length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', fontFamily: 'sans-serif' }}>
      <h1>翻牌配对游戏</h1>
      <p>步数: {moves}</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 80px)', gap: '10px' }}>
        {cards.map((card, index) => (
          <div
            key={card.id}
            style={{
              width: '80px',
              height: '120px',
              border: '1px solid #ccc',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              fontSize: '2em',
              cursor: 'pointer',
              backgroundColor: card.isFlipped || card.isMatched ? '#eee' : '#fff',
            }}
            onClick={() => handleCardClick(index)}
          >
            {(card.isFlipped || card.isMatched) && card.value}
          </div>
        ))}
      </div>
      {hasWon && (
        <div style={{ marginTop: '20px', fontSize: '1.2em' }}>
          恭喜你！你用了 {moves} 步完成了游戏！
          <button onClick={startGame} style={{ marginLeft: '10px', padding: '5px 10px' }}>重新开始</button>
        </div>
      )}
      {!hasWon && (
        <button onClick={startGame} style={{ marginTop: '20px', padding: '5px 10px' }}>重新开始</button>
      )}
    </div>
  );
}