import { useState } from 'react';

interface GameStateResponse {
  hand_id: string
  log: string;
  game_started?: boolean;
  call_amount?: number;
  bet_size?: number;
  previous_bet?: number;
  current_stack?: number;
}

export function usePokerGame() {
  const [inputValue, setInputValue] = useState("10000"); 
  const [stacks, setStacks] = useState(10000);
  const [log, setLog] = useState("");
  const [gameStarted, setGameStarted] = useState(false);
  const [callAmount, setCallAmount] = useState(0);
  const [betSize, setBetSize] = useState(0);
  const [maxBet, setMaxBet] = useState(0);
  const [previousBet, setPreviousBet] = useState(0);
  const [currentBet, setCurrentBet] = useState(0);
  const [hand_id, setHandId] = useState("");

  function updateGameState(data: GameStateResponse) {
    setHandId(data.hand_id);
    setLog(data.log);
    setGameStarted(data.game_started ?? false);

    const callAmount = data.call_amount ?? 0;
    const betSize = data.bet_size ?? 0;
    const previousBet = data.previous_bet ?? 0;
    const currentStack = data.current_stack ?? 0;
    setCallAmount(callAmount);
    setBetSize(betSize);
    setPreviousBet(previousBet);
    setMaxBet(currentStack + previousBet);

    const minBet = Math.max(callAmount * 2 + previousBet, betSize);
    setCurrentBet(Math.min(minBet, currentStack));
  }

  async function sendAction(action: string, amount?: number) {
    const response = await fetch("http://127.0.0.1:8000/action", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ hand_id, action, amount }),
    });
    if (!response.ok) throw new Error("Request failed");

    const data = await response.json();
    updateGameState(data);
  }

  async function startHand() {
    const response = await fetch("http://127.0.0.1:8000/start-hand", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({stakes: stacks}),
    });

    const data = await response.json();
    updateGameState(data);
  }

  function incrementBet(step: number) {
    setCurrentBet(prev => Math.min(prev + step, maxBet));
  }

  function decrementBet(step: number) {
    setCurrentBet(prev => Math.max(
      prev - step, 
      Math.min(
        Math.max(betSize, callAmount * 2), 
        maxBet)
      )
    );
  }

  function isActionAllowed(action: string) {
    if (!gameStarted) return false;

    switch (action) {
      case "fold":
        return callAmount > 0;

      case "allin":
        return true;

      case "check":
        return callAmount === 0;

      case "call":
        return callAmount > 0;

      case "bet":
        return callAmount === 0;

      case "raise":
        return callAmount > 0 && (currentBet + previousBet) < maxBet;

      default:
        return false;
    }
  }

  return {
    inputValue, setInputValue,
    stacks, setStacks,
    log,
    gameStarted,
    betSize,
    previousBet,
    currentBet,
    incrementBet, decrementBet,
    isActionAllowed,
    sendAction,
    startHand,
  }
}