'use client';
import React, { useState } from 'react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {ScrollArea} from '@/components/ui/scroll-area';
import { usePokerGame } from '@/hooks/poker';
import { ActionBar } from '@/components/poker/actionBar';
import { GameControls } from '@/components/poker/gameControls';

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
    <div style={{ display: 'flex', height: '100vh' }}>
      <div style={{ 
        flex: 3, 
        borderRight: '1px solid #ccc', 
        padding: '1rem', 
        display: 'flex',
        flexDirection: 'column', 
        height: '100vh' 
      }}>
        <GameControls
          inputValue={inputValue}
          onInputChange={handleInputChange}
          onApplyStack={changeStack}
          onStartHand={startHand}
          gameStarted={gameStarted}
        />

        <div className="mx-auto my-5 text-gray-500 flex-grow">
          <ScrollArea>
            <pre>{log}</pre>
          </ScrollArea>
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

      <div style={{ flex: 2, padding: '1rem' }}>
        
        Right side
      </div>
    </div>
  )
}
