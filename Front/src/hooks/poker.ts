import { useState } from 'react';

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

  function updateGameState(data) {
    setLog(data.log);
    setGameStarted(data.game_started ?? false);
    setCallAmount(data.call_amount ?? 0);
    setBetSize(data.bet_size ?? 0);
    setPreviousBet(data.previous_bet ?? 0);
    setMaxBet(data.current_stack + data.previous_bet);
    setCurrentBet(Math.min(
      Math.max(
        (data.call_amount * 2) + data.previous_bet, 
        data.bet_size
      ), 
      data.current_stack
    ));
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
        return true;

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
    callAmount,
    betSize,
    maxBet,
    previousBet,
    currentBet,
    updateGameState,
    incrementBet, decrementBet,
    isActionAllowed,
  }
}