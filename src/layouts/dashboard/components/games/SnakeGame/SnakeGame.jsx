import React, { useState, useEffect, useRef } from "react";
import "./SnakeGame.css";
import { updateCompleteSpeed } from "api/api"; // Import the API function

const gridSize = 10;
const initialSnake = [{ x: 5, y: 5 }];
const initialDirection = "RIGHT";
const initialSpeed = 200;

// Function to generate random food position
const generateFood = (snake) => {
  let foodPosition;
  do {
    foodPosition = {
      x: Math.floor(Math.random() * gridSize),
      y: Math.floor(Math.random() * gridSize),
    };
  } while (snake.some((segment) => segment.x === foodPosition.x && segment.y === foodPosition.y));
  return foodPosition;
};

// Function to get high score from localStorage
const getHighScore = () => {
  const savedHighScore = localStorage.getItem("snakeGameHighScore");
  return savedHighScore ? parseInt(savedHighScore) : 0;
};

const SnakeGame = () => {
  const [snake, setSnake] = useState(initialSnake);
  const [food, setFood] = useState(generateFood(initialSnake));
  const [direction, setDirection] = useState(initialDirection);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(getHighScore());
  const [speed, setSpeed] = useState(initialSpeed);
  const [gameStarted, setGameStarted] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [addSpeed, setAddSpeed] = useState(0); // State for speed to be added
  const [speedMessage, setSpeedMessage] = useState(""); // Message to display speed bonus
  const gameIntervalRef = useRef();
  const gameContainerRef = useRef(null);

  // Handle keyboard input with event prevention
  useEffect(() => {
    const handleKeydown = (e) => {
      if (!gameStarted || countdown !== null || gameOver) return;

      // Prevent default behavior for arrow keys and WASD during gameplay
      // This prevents scrolling without disabling it completely
      if (
        ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "w", "a", "s", "d", " "].includes(e.key)
      ) {
        e.preventDefault();
      }

      switch (e.key) {
        case "ArrowUp":
        case "w":
          if (direction !== "DOWN") setDirection("UP");
          break;
        case "ArrowDown":
        case "s":
          if (direction !== "UP") setDirection("DOWN");
          break;
        case "ArrowLeft":
        case "a":
          if (direction !== "RIGHT") setDirection("LEFT");
          break;
        case "ArrowRight":
        case "d":
          if (direction !== "LEFT") setDirection("RIGHT");
          break;
        case " ": // Add space key to pause/resume
          // Optional: Add pause functionality
          break;
        default:
          break;
      }
    };

    // Only add the event listener when the game is active
    if (gameStarted && !gameOver) {
      window.addEventListener("keydown", handleKeydown);
    }

    return () => {
      window.removeEventListener("keydown", handleKeydown);
    };
  }, [direction, gameStarted, countdown, gameOver]);

  // Focus management
  useEffect(() => {
    if (gameStarted && !gameOver && gameContainerRef.current) {
      // Focus the game container when game starts
      gameContainerRef.current.focus();
    }
  }, [gameStarted, gameOver]);

  // Scroll into view when game starts (if it's offscreen)
  useEffect(() => {
    if (gameStarted && !gameOver && gameContainerRef.current) {
      // Smoothly scroll to the game container when the game starts
      gameContainerRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [gameStarted, gameOver]);

  // Countdown effect
  useEffect(() => {
    if (countdown === null) return;

    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setCountdown(null);
    }
  }, [countdown]);

  // Game loop
  useEffect(() => {
    if (gameOver || !gameStarted || countdown !== null) return;

    gameIntervalRef.current = setInterval(() => {
      moveSnake();
    }, speed);

    return () => clearInterval(gameIntervalRef.current);
  }, [snake, direction, gameOver, gameStarted, countdown, speed]);

  // Update high score when game over and calculate speed bonus
  useEffect(() => {
    if (gameOver) {
      // Update high score
      if (score > highScore) {
        setHighScore(score);
        localStorage.setItem("snakeGameHighScore", score.toString());
      }

      // Calculate speed bonus based on score thresholds
      let speedBonus = 0;
      let message = "";

      if (score > 30) {
        speedBonus = 3;
        message = "You gained +3 Speed for scoring over 30 points!";
      } else if (score > 20) {
        speedBonus = 2;
        message = "You gained +2 Speed for scoring over 20 points!";
      } else if (score > 10) {
        speedBonus = 1;
        message = "You gained +1 Speed for scoring over 10 points!";
      }

      setAddSpeed(speedBonus);
      setSpeedMessage(message);

      // Call API to update speed if there's a bonus
      if (speedBonus > 0) {
        const token = localStorage.getItem("jwtToken"); // Adjust based on your auth implementation

        if (token) {
          updateCompleteSpeed(speedBonus, token)
            .then((response) => {
              console.log("Speed updated successfully:", response);
            })
            .catch((error) => {
              console.error("Failed to update speed:", error);
            });
        }
      }
    }
  }, [gameOver, score, highScore]);

  // Move the snake
  const moveSnake = () => {
    const newHead = { ...snake[0] };

    switch (direction) {
      case "UP":
        newHead.y -= 1;
        break;
      case "DOWN":
        newHead.y += 1;
        break;
      case "LEFT":
        newHead.x -= 1;
        break;
      case "RIGHT":
        newHead.x += 1;
        break;
      default:
        break;
    }

    // Check for game over conditions
    if (
      newHead.x < 0 ||
      newHead.x >= gridSize ||
      newHead.y < 0 ||
      newHead.y >= gridSize ||
      snake.slice(1).some((segment) => segment.x === newHead.x && segment.y === newHead.y)
    ) {
      setGameOver(true);
      clearInterval(gameIntervalRef.current);
      return;
    }

    // Add new head to snake
    const newSnake = [newHead, ...snake];

    // Check if snake eats food
    if (newHead.x === food.x && newHead.y === food.y) {
      setFood(generateFood(newSnake));
      setScore(score + 1);

      // Increase speed gradually as score increases
      if (score > 0 && score % 3 === 0 && speed > 50) {
        setSpeed((prevSpeed) => prevSpeed - 10);
      }
    } else {
      newSnake.pop(); // Remove last tail segment
    }

    setSnake(newSnake);
  };

  // Start the game with countdown
  const startGame = () => {
    setSnake(initialSnake);
    setFood(generateFood(initialSnake));
    setDirection(initialDirection);
    setGameOver(false);
    setScore(0);
    setSpeed(initialSpeed);
    setGameStarted(true);
    setCountdown(3);
    setAddSpeed(0);
    setSpeedMessage("");
  };

  // Restart the game
  const restartGame = () => {
    startGame();
  };

  // Determine if a segment is the head
  const isHead = (x, y) => {
    return snake.length > 0 && snake[0].x === x && snake[0].y === y;
  };

  return (
    <div
      className={`game-container ${gameStarted && !gameOver ? "game-active" : ""}`}
      ref={gameContainerRef}
      // Make the container focusable for keyboard events
      tabIndex={0}
      // Prevent scroll on arrow keys within this element
      onKeyDown={(e) => {
        if (
          ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "w", "a", "s", "d", " "].includes(
            e.key
          )
        ) {
          e.preventDefault();
        }
      }}
    >
      <div className="game-header">
        <h1>Snake Game</h1>
        <div className="score-container">
          <div className="score">Score: {score}</div>
          <div className="high-score">High Score: {highScore}</div>
        </div>
      </div>

      <div className="game-board-container">
        {countdown !== null && <div className="countdown">{countdown}</div>}

        <div className={`game-board ${gameOver ? "game-over-shake" : ""}`}>
          {Array.from({ length: gridSize }).map((_, rowIndex) =>
            Array.from({ length: gridSize }).map((_, colIndex) => {
              const isSnakeSegment = snake.some(
                (segment) => segment.x === colIndex && segment.y === rowIndex
              );
              const isSnakeHead = isHead(colIndex, rowIndex);
              const isSnakeFood = food.x === colIndex && food.y === rowIndex;

              return (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={`
                    cell 
                    ${isSnakeHead ? "snake-head" : isSnakeSegment ? "snake" : ""} 
                    ${isSnakeFood ? "food" : ""}
                  `}
                ></div>
              );
            })
          )}
        </div>
      </div>

      {gameOver && (
        <div className="game-over-container">
          <div className="game-over-message">Game Over!</div>
          <div className="final-score">Your Score: {score}</div>
          <div className="final-high-score">High Score: {highScore}</div>
          {speedMessage && <div className="speed-bonus">{speedMessage}</div>}
          <button className="restart-button" onClick={restartGame}>
            Play Again
          </button>
        </div>
      )}

      {!gameStarted && !gameOver && (
        <div className="start-container">
          <button className="start-button pulse" onClick={startGame}>
            Start Game
          </button>
          <div className="instructions">
            <p>Use arrow keys or WASD to control the snake</p>
            <p>Eat the food to grow longer</p>
            <p>Don&apos;t hit the walls or yourself!</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SnakeGame;
