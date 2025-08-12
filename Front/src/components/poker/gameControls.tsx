'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface GameControlsProps {
  inputValue: string;
  gameStarted: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onApplyStack: () => void;
  onStartHand: () => void;
}

export function GameControls({
  inputValue,
  gameStarted,
  onInputChange,
  onApplyStack,
  onStartHand,
}: GameControlsProps) {
  return (
    <header className="flex justify-center space-x-4 [&>*]:text-xl">
      <span className="mt-1">Stacks:</span>
      <Input
        type="number"
        value={inputValue}
        className="w-36"
        onChange={onInputChange}
      />
      <Button onClick={onApplyStack} className="bg-grey hover:text-white text-black">
        Apply
      </Button>
      <Button onClick={onStartHand}>
        {gameStarted ? 'Reset' : 'Start'}
      </Button>
    </header>
  );
}