import psycopg2
import psycopg2.extras
import ulid
from dataclasses import dataclass
from typing import Optional, List
import json


@dataclass
class HandData:
    id: str
    stacks: int
    dealer: int
    cards: dict
    actions: str
    winnings: dict
    
class HandRepo:
    def __init__(self, conn):
        self.conn = conn
        
    def create_table(self):
        with self.conn.cursor() as cur:
            cur.execute("""
            CREATE TABLE IF NOT EXISTS hands (
                id CHAR(26) PRIMARY KEY,
                stacks INT,
                dealer INT,
                cards JSONB,
                actions TEXT,
                winnings JSONB
            );
            """)
            self.conn.commit()
            
    def save_hand(self, hand: HandData):
        with self.conn.cursor() as cur:
            cur.execute("""
                INSERT INTO hands (id, stacks, dealer, cards, actions, winnings)
                VALUES (%s, %s, %s, %s, %s, %s)
                ON CONFLICT (id) DO UPDATE SET
                    stacks = EXCLUDED.stacks,
                    dealer = EXCLUDED.dealer,
                    cards = EXCLUDED.cards,
                    actions = EXCLUDED.actions,
                    winnings = EXCLUDED.winnings;
            """, (
                str(hand.id),
                hand.stacks,
                hand.dealer,
                json.dumps(hand.cards),
                hand.actions,
                json.dumps(hand.winnings),
            ))
            self.conn.commit()
            
    def get_hand(self, hand_id: ulid.ulid) -> Optional[HandData]:
        with self.conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cur:
            cur.execute("SELECT * FROM hands WHERE id = %s", (hand_id,))
            row = cur.fetchone()
            if row is None:
                return None
            return HandData(
                id=str(row["id"]),
                stacks=row["stacks"],
                dealer=row["dealer"],
                cards=row["cards"],
                actions=row["actions"],
                winnings=row["winnings"],
            )
            
    def get_all_hands(self) -> List[HandData]:
        with self.conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cur:
            cur.execute("SELECT * FROM hands ORDER BY id DESC")
            rows = cur.fetchall()
            return [
                HandData(
                    id=str(row["id"]),
                    stacks=row["stacks"],
                    dealer=row["dealer"],
                    cards=row["cards"],
                    actions=row["actions"],
                    winnings=row["winnings"],
                )
                for row in rows
            ]