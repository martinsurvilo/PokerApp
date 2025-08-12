'use client';
import React, { useState } from 'react';
import { usePokerGame } from '@/hooks/poker';
import { ActionBar } from '@/components/poker/actionBar';
import { GameControls } from '@/components/poker/gameControls';
import { HandsHistory, HandLog } from '@/components/poker/logs';

export default function Page() {
  const {
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
      <div className="flex flex-col flex-3 p-4 h-screen overflow-hidden">
        <GameControls
          inputValue={inputValue}
          onInputChange={handleInputChange}
          onApplyStack={changeStack}
          onStartHand={startHand}
          gameStarted={gameStarted}
        />

        <div className="flex-1 my-4 ml-30 overflow-hidden">
          <HandLog log={log} />
        </div>

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

      <div className="flex-2 p-4 mr-4 h-screen overflow-hidden">
        <HandsHistory />
      </div>
    </div>
  )
}
