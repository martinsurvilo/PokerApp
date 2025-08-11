'use client';
import React, { useState } from 'react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {ScrollArea} from '@/components/ui/scroll-area';
import { usePokerGame } from '@/hooks/poker';

export default function Page() {
  const {
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

  async function sendAction(action: string, amount?: number) {
    const response = await fetch("http://127.0.0.1:8000/action", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ action, amount }),
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
        <header className="flex justify-center space-x-4 [&>*]:text-xl">
          <span className="mt-1">Stacks:</span>
          <Input 
            type="number"
            defaultValue={10000}
            className="w-36"
            onChange={handleInputChange}
          ></Input>
          <Button 
            onClick={changeStack} 
            className="bg-grey hover:text-white text-black"
          >
              Apply
          </Button>
          <Button onClick={startHand}>{gameStarted ? "Reset" : "Start"}</Button>
        </header>

        <div className="mx-auto my-5 text-gray-500 flex-grow">
          <ScrollArea>
            <pre>{log}</pre>
          </ScrollArea>
        </div>

        {gameStarted && (
          <footer className='sticky bottom-0 p-4 flex justify-center gap-4 bg-white'>
            <Button className='bg-blue-900'
              disabled={!isActionAllowed("fold")}
              onClick={() => sendAction("fold")}
            >
              Fold
            </Button>
            <Button className='bg-yellow-400'
              disabled={!isActionAllowed("check")} 
              onClick={() => sendAction("check")}
            >
              Check
            </Button>
            <Button className='bg-yellow-400'
              disabled={!isActionAllowed("call")}
              onClick={() => sendAction("call")}
            >
                Call
            </Button>

            <div className="flex items-center gap-1">
              <Button className="bg-orange-600"
                disabled={!isActionAllowed("bet")} 
                onClick={() => decrementBet(betSize)}
              >
                -
              </Button>
              <Button className="bg-orange-600"
                disabled={!isActionAllowed("bet")} 
                onClick={() => sendAction("bet", currentBet + previousBet)}
              >
                Bet {currentBet}
              </Button>
              <Button className="bg-orange-600"
                disabled={!isActionAllowed("bet")} 
                onClick={() => incrementBet(betSize)}
              >
                +
              </Button>
            </div>

            <div className="flex items-center gap-1">
              <Button className="bg-orange-600"
                disabled={!isActionAllowed("raise")} 
                onClick={() => decrementBet(betSize)}
              >
                -
              </Button>
              <Button className="bg-orange-600"
                disabled={!isActionAllowed("raise")} 
                onClick={() => sendAction("raise", currentBet)}
              >
                Raise {currentBet}
              </Button>
              <Button className="bg-orange-600"
                disabled={!isActionAllowed("raise")} 
                onClick={() => incrementBet(betSize)}
              >
                +
              </Button>
            </div>

            <Button className = "bg-red-600"
              disabled={!isActionAllowed("allin")}
              onClick={() => sendAction("allin")}
            >
              Allin
            </Button>
          </footer>
        )}
      </div>

      <div style={{ flex: 2, padding: '1rem' }}>
        
        Right side
      </div>
    </div>
  )
}
