import React, { useState, useEffect } from "react";
import "./MemoryGame.css";
import PropTypes from "prop-types";
// Card component
const Card = ({ card, onClick, isFlipped, isMatched }) => {
  return (
    <div
      className={`card ${isFlipped ? "flipped" : ""} ${isMatched ? "matched" : ""}`}
      onClick={() => !isFlipped && !isMatched && onClick()}
    >
      <div className="card-inner">
        <div className="card-front"></div>
        <div className="card-back">
          <span>{card.value}</span>
        </div>
      </div>
    </div>
  );
};
// Add prop type validation for Card component
Card.propTypes = {
  card: PropTypes.shape({
    id: PropTypes.number,
    value: PropTypes.number,
    isFlipped: PropTypes.bool,
    isMatched: PropTypes.bool,
  }).isRequired,
  onClick: PropTypes.func.isRequired,
  isFlipped: PropTypes.bool.isRequired,
  isMatched: PropTypes.bool.isRequired,
};
// Main game component
const MemoryGame = () => {
  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [moves, setMoves] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [gridSize, setGridSize] = useState(4); // Default 4x4 grid

  // Generate a new game
  const generateCards = (size) => {
    const totalPairs = (size * size) / 2;
    const values = Array.from({ length: totalPairs }, (_, i) => i + 1);
    const cardValues = [...values, ...values];

    // Shuffle array
    const shuffled = cardValues.sort(() => Math.random() - 0.5);

    return shuffled.map((value, index) => ({
      id: index,
      value: value,
      isFlipped: false,
      isMatched: false,
    }));
  };

  // Initialize game
  useEffect(() => {
    resetGame();
  }, [gridSize]);

  // Reset game state
  const resetGame = () => {
    setCards(generateCards(gridSize));
    setFlippedCards([]);
    setMatchedPairs([]);
    setMoves(0);
    setGameOver(false);
  };

  // Handle game completion
  useEffect(() => {
    if (matchedPairs.length > 0 && matchedPairs.length === cards.length / 2) {
      setGameOver(true);
    }
  }, [matchedPairs, cards]);

  // Handle card click
  const handleCardClick = (cardId) => {
    if (isProcessing) return;

    // Update moves counter
    if (flippedCards.length < 2) {
      setMoves(moves + 1);
    }

    // Flip logic
    if (flippedCards.length === 0) {
      setFlippedCards([cardId]);
    } else if (flippedCards.length === 1) {
      if (flippedCards[0] === cardId) return; // Prevent clicking the same card

      setIsProcessing(true);
      setFlippedCards([...flippedCards, cardId]);

      // Check for a match
      const firstCard = cards.find((card) => card.id === flippedCards[0]);
      const secondCard = cards.find((card) => card.id === cardId);

      if (firstCard.value === secondCard.value) {
        // Match found
        setMatchedPairs([...matchedPairs, firstCard.value]);
        setFlippedCards([]);
        setIsProcessing(false);
      } else {
        // No match, flip back after delay
        setTimeout(() => {
          setFlippedCards([]);
          setIsProcessing(false);
        }, 1000);
      }
    }
  };

  // Change grid size
  const handleGridSizeChange = (size) => {
    setGridSize(size);
  };

  // Create grid style
  const gridStyle = {
    gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
  };

  return (
    <div className="memory-game-container">
      <h1>Memory Game</h1>

      <div className="controls">
        <div className="size-selector">
          <label>Grid Size:</label>
          <div className="button-group">
            <button
              className={gridSize === 2 ? "active" : ""}
              onClick={() => handleGridSizeChange(2)}
            >
              2x2
            </button>
            <button
              className={gridSize === 4 ? "active" : ""}
              onClick={() => handleGridSizeChange(4)}
            >
              4x4
            </button>
            <button
              className={gridSize === 6 ? "active" : ""}
              onClick={() => handleGridSizeChange(6)}
            >
              6x6
            </button>
          </div>
        </div>
        <button className="reset-button" onClick={resetGame}>
          New Game
        </button>
      </div>

      <div className="stats">
        <p>Moves: {moves}</p>
        <p>
          Pairs Found: {matchedPairs.length} of {cards.length / 2}
        </p>
      </div>

      <div className="card-grid" style={gridStyle}>
        {cards.map((card) => (
          <Card
            key={card.id}
            card={card}
            onClick={() => handleCardClick(card.id)}
            isFlipped={flippedCards.includes(card.id)}
            isMatched={matchedPairs.includes(card.value)}
          />
        ))}
      </div>

      {gameOver && (
        <div className="game-over">
          <div className="game-over-content">
            <h2>Congratulations!</h2>
            <p>You completed the game in {moves} moves</p>
            <button onClick={resetGame}>Play Again</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemoryGame;
