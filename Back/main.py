from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
import poker
from dotenv import load_dotenv
import os
import psycopg2
from repository import HandRepo

load_dotenv()

conn = psycopg2.connect(
    host=os.getenv("PGHOST"),
    user=os.getenv("PGUSER"),
    password=os.getenv("PGPASSWORD"),
    dbname=os.getenv("PGDATABASE"),
    port=os.getenv("PGPORT")
)

app = FastAPI()
repo = HandRepo(conn)
repo.create_table()

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

games = {}

@app.post("/start-hand")
def start_hand(stakes: int = Body(..., embed=True)):
    global game
    game = poker.PokerHand()
    game.start_hand(stakes)
    games[game.id] = game
    return {"hand_id": game.id, **game.get_status()}

@app.post("/action")
def action(
    hand_id: str = Body(..., embed=True),
    action: str = Body(..., embed=True),
    amount: int | None = Body(None, embed=True)
):
    if hand_id not in games:
        raise HTTPException(status_code=404, detail="Hand not found")
    game = games[hand_id]
    
    if not game.is_action_allowed(action, amount):
        raise HTTPException(
            status_code=400,
            detail=f"Illegal action '{action}' with amount {amount}"
        )
    
    if amount is not None:
        game.action(action, amount)
    else:
        game.action(action)
        
    if game.is_game_over():
        repo.save_hand(game.to_hand_data())
        del games[hand_id]
        
    return {"hand_id": game.id, **game.get_status()}





