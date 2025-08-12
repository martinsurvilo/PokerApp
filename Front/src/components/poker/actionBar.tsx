'use client';
import { Button } from '@/components/ui/button';

interface ActionBarProps {
  gameStarted: boolean;
  betSize: number;
  previousBet: number;
  currentBet: number;
  isActionAllowed: (action: string) => boolean;
  sendAction: (action: string, amount?: number) => void;
  incrementBet: (step: number) => void;
  decrementBet: (step: number) => void;
}

export function ActionBar({ 
  gameStarted, 
  betSize, 
  previousBet, 
  currentBet, 
  isActionAllowed, 
  sendAction, 
  incrementBet, 
  decrementBet 
}: ActionBarProps) {
  if (!gameStarted) return null;
  return (
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
  );
}