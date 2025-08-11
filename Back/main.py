from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
import poker

app = FastAPI()

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

game = None

@app.post("/start-hand")
def start_hand(stakes: int = Body(..., embed=True)):
    global game
    game = poker.PokerHand()
    game.start_hand(stakes)
    return game.get_status()

@app.post("/action")
def action(
    action: str = Body(..., embed=True),
    amount: int | None = Body(None, embed=True)
):
    global game
    
    if game is None:
        raise HTTPException(status_code=400, detail="Game has not been started yet. Please start a hand first.")
    
    if not game.is_action_allowed(action, amount):
        raise HTTPException(
            status_code=400,
            detail=f"Illegal action '{action}' with amount {amount}"
        )
    
    if amount is not None:
        game.action(action, amount)
    else:
        game.action(action)
    return game.get_status()





