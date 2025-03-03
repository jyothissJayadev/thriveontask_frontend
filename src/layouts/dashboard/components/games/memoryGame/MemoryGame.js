import React, { useState, useEffect } from "react";
import "./MemoryGame.css";
import PropTypes from "prop-types";
import { updateCompleteSpeed } from "api/api"; // Import the API function

// Card component
const Card = ({ card, onClick, isFlipped, isMatched }) => {
  return (
    <div
      className={`card ${isFlipped || isMatched ? "flipped" : ""} ${isMatched ? "matched" : ""}`}
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
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [gridSize, setGridSize] = useState(6); // Default 6x6 grid
  const [addSpeed, setAddSpeed] = useState(0); // State for speed to be added
  const [speedMessage, setSpeedMessage] = useState(""); // Message to display speed bonus

  // Calculate score based on grid size and moves
  const calculateScore = (size, totalMoves, matchedPairsCount) => {
    const totalPairs = (size * size) / 2;

    // Perfect score (if completed in minimum possible moves)
    const perfectScore = size === 6 ? 1000 : 2000; // Higher base score for 8x8

    // Minimum possible moves is the number of pairs
    const minimumMoves = totalPairs;

    // Calculate how many excess moves were used
    const excessMoves = totalMoves - minimumMoves;

    // Penalty factor (higher for 6x6 since it's easier)
    const penaltyFactor = size === 6 ? 20 : 15;

    // Calculate score with penalty for extra moves
    let calculatedScore = perfectScore - excessMoves * penaltyFactor;

    // Ensure score doesn't go below zero
    calculatedScore = Math.max(calculatedScore, 0);

    // Bonus for completion
    const completionBonus = matchedPairsCount === totalPairs ? 200 : 0;

    return calculatedScore + completionBonus;
  };

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
    setScore(0);
    setGameOver(false);
    setAddSpeed(0);
    setSpeedMessage("");
  };

  // Handle game completion and set speed bonus
  useEffect(() => {
    if (matchedPairs.length > 0 && matchedPairs.length === cards.length / 2) {
      const finalScore = calculateScore(gridSize, moves, matchedPairs.length);
      setScore(finalScore);
      setGameOver(true);

      // Set speed bonus based on grid size
      let speedBonus = 0;
      if (gridSize === 4) {
        speedBonus = 1;
        setSpeedMessage("You gained +1 Speed for completing 4x4 grid!");
      } else if (gridSize === 6) {
        speedBonus = 2;
        setSpeedMessage("You gained +2 Speed for completing 6x6 grid!");
      } else if (gridSize === 8) {
        speedBonus = 3;
        setSpeedMessage("You gained +5 Speed for completing 8x8 grid!");
      }

      setAddSpeed(speedBonus);

      // Get token from localStorage or your auth service
      const token = localStorage.getItem("jwtToken"); // Adjust based on your auth implementation

      // Call the API to update speed
      if (speedBonus > 0 && token) {
        updateCompleteSpeed(speedBonus, token)
          .then((response) => {
            console.log("Speed updated successfully:", response);
          })
          .catch((error) => {
            console.error("Failed to update speed:", error);
          });
      }
    }
  }, [matchedPairs, cards, moves, gridSize]);

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
        // Match found - update the cards to be matched
        const updatedCards = cards.map((card) => {
          if (card.id === firstCard.id || card.id === secondCard.id) {
            return { ...card, isMatched: true };
          }
          return card;
        });

        setCards(updatedCards);
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

  // Get score rating based on grid size and score
  const getScoreRating = () => {
    const perfectMoves = cards.length / 2;
    const efficiency = (perfectMoves / moves) * 100;

    if (efficiency >= 90) return "Perfect!";
    if (efficiency >= 70) return "Excellent!";
    if (efficiency >= 50) return "Great!";
    if (efficiency >= 30) return "Good";
    return "Try Again";
  };

  return (
    <div className="memory-game-container">
      <h1>Memory Game</h1>

      <div className="controls">
        <div className="size-selector">
          <label>Grid Size:</label>
          <div className="button-group">
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
            <button
              className={gridSize === 8 ? "active" : ""}
              onClick={() => handleGridSizeChange(8)}
            >
              8x8
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
        <p>
          Score:{" "}
          {matchedPairs.length > 0 ? calculateScore(gridSize, moves, matchedPairs.length) : 0}
        </p>
      </div>

      <div className="card-grid" style={gridStyle}>
        {cards.map((card) => (
          <Card
            key={card.id}
            card={card}
            onClick={() => handleCardClick(card.id)}
            isFlipped={flippedCards.includes(card.id)}
            isMatched={card.isMatched}
          />
        ))}
      </div>

      {gameOver && (
        <div className="game-over">
          <div className="game-over-content">
            <h2>Congratulations!</h2>
            <p>
              You completed the {gridSize}x{gridSize} grid in {moves} moves
            </p>
            <p className="final-score">
              Final Score: <span>{score}</span>
            </p>
            <p className="score-rating">{getScoreRating()}</p>
            {speedMessage && <p className="speed-bonus">{speedMessage}</p>}
            <button onClick={resetGame}>Play Again</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemoryGame;
