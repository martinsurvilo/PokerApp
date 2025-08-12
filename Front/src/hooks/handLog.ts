import { useState, useEffect } from "react";

export interface HandData {
  id: string;
  stacks: number;
  dealer: number;
  cards: Record<string, any>;
  actions: string;
  winnings: Record<string, any>;
}

export function useHands() {
  const [hands, setHands] = useState([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHands = () => {
      fetch("http://127.0.0.1:8000/hands")
        .then(res => {
          if (!res.ok) throw new Error();
          return res.json();
        })
        .then(setHands)
        .catch(() => setError("Failed to load hands."));
    };

    fetchHands();

    const interval = setInterval(fetchHands, 3000);
    return () => clearInterval(interval);
  }, []);

  return { hands, error };
}