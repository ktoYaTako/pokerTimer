import { useEffect, useState } from 'react';
import { formatTime } from '../utils';

interface TimerProps {
  remainingSeconds: number;
  isRunning: boolean;
}

export function Timer({ remainingSeconds, isRunning }: TimerProps) {
  const [displayed, setDisplayed] = useState(remainingSeconds);

  useEffect(() => {
    setDisplayed(remainingSeconds);

    if (!isRunning) return;

    const interval = setInterval(() => {
      setDisplayed((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [remainingSeconds, isRunning]);

  return <div className="timer">{formatTime(displayed)}</div>;
}
