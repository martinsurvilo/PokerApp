import { useHands } from "@/hooks/handLog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";

export function HandsHistory() {
  const { hands, error } = useHands();

  if (error) return <p className="text-red-500">{error}</p>;
  if (!hands.length) return <p>Loading...</p>;

  return (
    <div className="mx-auto my-5 text-gray-500 flex-grow pb-20">
      <h1 className="text-4xl pt-9">Hand History</h1>
      <ScrollArea className="h-200 w-full pt-4">
        {hands.map((hand: any) => (
          <Card key={hand.id} className="mb-2 bg-blue-200">
            <CardContent>
              <div>Hand ID: {hand.id}</div>

              <div>
                Stacks: {hand.stacks}{" "}
                Dealer: {hand.dealer + 1}{" "}
                Small blind: {(hand.dealer + 2) % 6}{" "}
                Big blind: {(hand.dealer + 3) % 6}
              </div>

              <div>
                Hands:{" "}
                {Object.entries(hand.cards)
                  .map(([player, cards]) => `${player}: ${cards}`)
                  .join(", ")}
              </div>

              <div className="whitespace-pre-wrap break-all">Actions:{" "}{hand.actions.split('\n').join(', ')}</div>
              
              <div>
                Winnings:{" "}
                {Object.entries(hand.winnings)
                  .map(([player, amount]) => `${player}: ${amount}`)
                  .join(", ")}
              </div>
            </CardContent>
          </Card>
        ))}
      </ScrollArea>
    </div>
  );
}

interface HandLogProps {
  log: string;
}

export function HandLog({ log }: HandLogProps) {
  return(
    <div className="mx-auto my-5 text-gray-500 flex-grow pb-20">
      <h1 className="text-4xl text-gray-500">Playing field log</h1>
      <ScrollArea className="h-200 w-full pt-4">
        <pre>{log}</pre>
      </ScrollArea>
    </div>
  )
}