'use client';
import React from 'react';
import { usePokerGame } from '@/hooks/poker';
import { ActionBar } from '@/components/poker/actionBar';
import { GameControls } from '@/components/poker/gameControls';
import { HandsHistory, HandLog } from '@/components/poker/logs';

export default function Page() {
  const {
    inputValue, setInputValue,
    setStacks,
    log,
    gameStarted,
    betSize,
    previousBet,
    currentBet,
    incrementBet, decrementBet,
    isActionAllowed,
    sendAction,
    startHand,
  } = usePokerGame();

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setInputValue(e.target.value);
  }

  function changeStack() {
    const parsed = parseInt(inputValue, 10);
    if (parsed > 0) {
      setStacks(parsed);
    }
  }

  return (
    <div className="flex h-screen">
      <div className="flex flex-col w-3/5 p-4 h-screen overflow-hidden">
        <GameControls
          inputValue={inputValue}
          onInputChange={handleInputChange}
          onApplyStack={changeStack}
          onStartHand={startHand}
          gameStarted={gameStarted}
        />

        <HandLog log={log} />

        <ActionBar
          gameStarted={gameStarted}
          betSize={betSize}
          previousBet={previousBet}
          currentBet={currentBet}
          isActionAllowed={isActionAllowed}
          sendAction={sendAction}
          incrementBet={incrementBet}
          decrementBet={decrementBet}
        />

      </div>

      <div className="w-2/5 p-4 mr-4 h-screen overflow-hidden">
        <HandsHistory />
      </div>
    </div>
  )
}
