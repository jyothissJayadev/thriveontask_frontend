import { useState, useEffect } from "react";
import "./EndlessTimeCounter.css";

const EndlessTimeCounter = () => {
  // Set the starting time to March 3, 2025, 4:30 AM
  const [startTime] = useState(() => {
    const start = new Date(2025, 2, 5, 16, 30, 0); // Month is 0-indexed in JS (2 means March)
    return start;
  });

  const [time, setTime] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const difference = now - startTime;

      // Ensure that no time value goes below 0
      const days = Math.max(0, Math.floor(difference / (1000 * 60 * 60 * 24)));
      const hours = Math.max(
        0,
        Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      );
      const minutes = Math.max(0, Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)));
      const seconds = Math.max(0, Math.floor((difference % (1000 * 60)) / 1000));

      setTime({ days, hours, minutes, seconds });
      setAnimate(true);

      setTimeout(() => {
        setAnimate(false);
      }, 500); // Animation duration
    }, 1000); // Update the timer every second

    return () => clearInterval(timer); // Clear the timer on component unmount
  }, [startTime]);

  const formatNumber = (num) => {
    return num.toString().padStart(2, "0");
  };

  return (
    <div className="time-counter-container">
      <h1 className="counter-heading">Each Second Counts</h1>

      <div className="counter-display">
        <div className="time-box">
          <div className={`time-number ${animate && time.days % 10 === 0 ? "animate" : ""}`}>
            {formatNumber(time.days)}
          </div>
          <div className="time-label">DAYS</div>
        </div>

        <div className="time-box">
          <div className={`time-number ${animate && time.hours % 10 === 0 ? "animate" : ""}`}>
            {formatNumber(time.hours)}
          </div>
          <div className="time-label">HOURS</div>
        </div>

        <div className="time-box">
          <div className={`time-number ${animate && time.minutes % 10 === 0 ? "animate" : ""}`}>
            {formatNumber(time.minutes)}
          </div>
          <div className="time-label">MINUTES</div>
        </div>

        <div className="time-box">
          <div className={`time-number ${animate && time.seconds % 10 === 0 ? "animate" : ""}`}>
            {formatNumber(time.seconds)}
          </div>
          <div className="time-label">SECONDS</div>
        </div>
      </div>
    </div>
  );
};

export default EndlessTimeCounter;
