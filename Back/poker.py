from pokerkit import Automation, NoLimitTexasHoldem
from repository import HandData
import ulid
import re

class PokerHand:
    def __init__(self):
        self.id = str(ulid.new())
        self.state = None
        self.game = None
        self.log = ""
                    
    def __repr__(self):
        return f"<PokerHand id={self.id}>"
    
    #Choosing dealer is automated by pokerkit so dealer is always player 6, 
    # value given to function here is only used to log the hand
    def start_hand(self, starting_stack = 10000):
        self.starting_stack = starting_stack
        self.bblind = 40
        self.player_count = 6
        self.dealer = 5
        
        self.game = NoLimitTexasHoldem(
            (
                Automation.ANTE_POSTING,
                Automation.BET_COLLECTION,
                Automation.BLIND_OR_STRADDLE_POSTING,
                Automation.CARD_BURNING,
                Automation.HOLE_DEALING,
                #Automation.BOARD_DEALING,
                Automation.HOLE_CARDS_SHOWING_OR_MUCKING,
                Automation.HAND_KILLING,
                Automation.CHIPS_PUSHING,
                #Automation.CHIPS_PULLING,
            ),
            False,
            0,
            (int(self.bblind / 2), self.bblind),
            self.bblind,
        )

        self.state = self.game(
            starting_stack,
            self.player_count,
        )
        
        for index, hand in enumerate(self.state.hole_cards):
            self.log += f"Player {index + 1} is dealt {''.join(card.rank + card.suit for card in hand)}\n"
            
        self.log += "---\n"
        self.log += f"Player {((self.dealer) % self.state.player_count) + 1} is the dealer\n"
        self.log += f"Player {((self.dealer + 1) % self.state.player_count) + 1} posts small blind - {int(self.bblind / 2)} chips\n"
        self.log += f"Player {((self.dealer + 2) % self.state.player_count) + 1} posts big blind - {self.bblind} chips\n"
        self.log += "---\n"

        return self.state

    def action(self, action, amount = 0):
        if not self.state:
            return {"error": "Hand not started"}
        #Grammar error if a player calls 1 chip it says 1 chips
        if action == 'fold':
            self.log += f"Player {self.state.actor_index + 1} folds\n"
            self.state.fold()
        elif action == 'check':
            self.log += f"Player {self.state.actor_index + 1} checks\n"
            self.state.check_or_call()
        elif action == 'call':
            self.log += f"Player {self.state.actor_index + 1} calls {self.state.checking_or_calling_amount} chips\n"
            self.state.check_or_call()
        elif action == 'bet':
            self.log += f"Player {self.state.actor_index + 1} bets {amount} chips\n"
            self.state.complete_bet_or_raise_to(amount)
        elif action == 'raise':
            self.log += f"Player {self.state.actor_index + 1} raises to {amount} chips\n"
            self.state.complete_bet_or_raise_to(amount)
        elif action == "allin":
            previous_bet = self.state.bets[self.state.actor_index]
            amount = self.state.stacks[self.state.actor_index] + previous_bet
            self.log += f"Player {self.state.actor_index + 1} goes allin with {amount} chips\n"
            if amount <= self.state.checking_or_calling_amount + previous_bet:
                self.state.check_or_call()
            else:
                self.state.complete_bet_or_raise_to(amount)
            
        self.deal_board_if_needed()
        return self.state
    
    def deal_board_if_needed(self):
        while self.state.can_deal_board():
            street_index = self.state.street_index
            self.state.deal_board()
            board_cards = list(self.state.get_board_cards(0))
            board_str = ''.join(card.rank + card.suit for card in board_cards)
            
            if street_index == 1:
                self.log += f"Flop cards dealt: {board_str}\n"
            elif street_index == 2:
                self.log += f"Turn cards dealt: {board_str[6:]}\n"  
            elif street_index == 3:
                self.log += f"River cards dealt: {board_str[8:]}\n"

    def is_game_over(self):
        if self.state.can_pull_chips():
            self.log += f"Hand {self.id} ended\n"
            self.log += f"Final pot was {self.state.total_pot_amount}\n"
            while self.state.can_pull_chips():
                self.state.pull_chips()
            return True
        else:
            return False
     
    def is_action_allowed(self, action, amount):
        if self.state.status == True:
            if action == "fold" and self.state.checking_or_calling_amount != 0:
                return True
            if action == "allin":
                return True
            if action == "check" and self.state.checking_or_calling_amount == 0:
                return True
            if action == "call" and self.state.checking_or_calling_amount > 0:
                return True
            
            if amount is not None and amount > 0:
                if self.state.can_complete_bet_or_raise_to(amount):
                    if action == "bet" and self.state.checking_or_calling_amount == 0:
                        return True
                    if action == "raise" and self.state.checking_or_calling_amount > 0:
                        return True 
                    
        return False
    
    def get_status(self):
        #print(f"DEBUG get_status: actor_index={self.state.actor_index}, stacks={self.state.stacks}, status={self.state.status}")
        if not self.state or not self.state.status:
            return {"log": self.log}
        else:
            return {
                "log": self.log,
                "game_started": bool(self.state and self.state.status),
                "call_amount": self.state.checking_or_calling_amount,
                "bet_size": self.bblind,
                "current_stack": self.state.stacks[self.state.actor_index],
                "previous_bet": self.state.bets[self.state.actor_index]
            }
            
    def to_hand_data(self) -> HandData:
        hole_cards, player_actions = self.read_log()
        return HandData(
            id=self.id,
            stacks=self.starting_stack,
            dealer=self.dealer,
            cards=hole_cards,
            actions=player_actions,
            winnings=self.get_winnings_dict()
        )
        
    def read_log(self):
        #if line has "is dealt" then "{part 1} is dealt {part 2}" -> hole_cards.append('{part 1}': '{part 2}')
        
        #if line has "folds" then self.log += 'f:'
        #if line has "checks" then self.log += 'x:'
        #if line has "calls" then self.log += 'c:'
        #if line has "bets" then "... bets {x} chips" self.log += 'b{x}:'
        #if line has "raises" then "... raises {x} chips" self.log += 'r{x}:'
        #if line has "goes allin" then self.log += 'allin:'
        #if line has "cards dealt" then self.log[:-1] += ' Cards '
        
        hole_cards = {}
        player_actions = ""
        for line in self.log.splitlines():            
            if "folds" in line:
                player_actions += "f:"
                continue
            if "checks" in line:
                player_actions += "x:"
                continue
            if "calls" in line:
                player_actions += "c:"
                continue
            if "goes allin" in line:
                player_actions += "allin:"
                continue
            
            m = re.match(r"Player (\d+) is dealt (.+)", line)
            if m:
                player = f"Player {m.group(1)}"
                hole_cards[player] = m.group(2)
                continue
            
            m = re.match(r".*bets (\d+) chips", line)
            if m:
                player_actions += f"b{m.group(1)}:"
                continue
            
            m = re.match(r".*raises to (\d+) chips", line)
            if m:
                player_actions += f"r{m.group(1)}:"
                continue
            
            m = re.match(r"(Flop|Turn|River) cards dealt: (.+)", line)
            if m:
                player_actions = player_actions[:-1]
                player_actions += f" {m.group(2)} "
                continue
            
        if player_actions.endswith(':'):
            player_actions = player_actions[:-1]
            
        return hole_cards, player_actions
       
    def get_winnings_dict(self):
        return {
            f"Player {i+1}": f"{end - start:+d}"
            for i, (end, start) in enumerate(zip(self.state.stacks, self.state.starting_stacks))
        }
            
def main():
    hand = PokerHand()
    
    hand.start_hand()
    hand.get_status()
    
    #all in on turn
    '''
    #Pre flop
    hand.get_status()
    hand.action('bet', 200)
    hand.get_status()
    hand.action('call')
    hand.get_status()
    hand.action('fold')
    hand.get_status()
    hand.action('fold')
    hand.get_status()
    hand.action('fold')
    hand.get_status()
    hand.action('call')
    hand.get_status()
    
    #Post flop
    hand.action('check')
    hand.get_status()
    hand.action('bet', 500)
    hand.get_status()
    hand.action('fold')
    hand.get_status()
    hand.action('call')
    hand.get_status()
    
    #Turn
    hand.action('bet', 9300)
    hand.get_status()
    hand.action('call')
    hand.get_status()
    
    #River not played
    ''' 
    
    #all rounds played
    '''
    #Pre flop
    hand.get_status()
    hand.action('bet', 200)
    hand.get_status()
    hand.action('call')
    hand.get_status()
    hand.action('fold')
    hand.get_status()
    hand.action('fold')
    hand.get_status()
    hand.action('fold')
    hand.get_status()
    hand.action('call')
    hand.get_status()
    
    #Post flop
    hand.action('check')
    hand.get_status()
    hand.action('bet', 500)
    hand.get_status()
    hand.action('fold')
    hand.get_status()
    hand.action('call')
    hand.get_status()
    
    #Turn
    hand.action('bet', 300)
    hand.get_status()
    hand.action('call')
    hand.get_status()
    
    #River
    hand.action('check')
    hand.action('check')
    hand.get_status()
    '''
    #Instant all in
    #Pre flop
    hand.action('bet', 10000)
    hand.action('call')
    hand.action('call')
    hand.action('call')
    hand.action('call')
    hand.action('call')
    hand.get_status()
    

if __name__ == '__main__':
    main()



