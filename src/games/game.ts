import { Arena, Edges, NeighborsOf, Player, Vertex } from "./arena";

type WinCondition<V extends readonly Vertex[]> = (play: V[number][]) => Player

export class Game<V extends readonly Vertex[] = [], E extends Edges = []> {
    arena: Arena<V,E,true>;
    currentState: V[number];
    winCondition: WinCondition<V>;
    history: V[number][]

    constructor(arena: typeof this.arena, initialState: V[number]['v'], winCondition:WinCondition<V>) {
        this.arena = arena
        this.currentState = this.arena.get(initialState)
        this.winCondition = winCondition
        this.history = [this.currentState]
    }

    getCurrentPlayer(): Player {
        return this.currentState.p
    }

    play<CurV extends typeof this.currentState.v>(choice: NeighborsOf<CurV, typeof this.arena.vertices, typeof this.arena.edges>[number]) { 
        const newState = this.arena.getNeighbors(this.currentState.v).find(n=> n === choice)
        if (!newState){
            throw new Error('cannot play this choice') 
        } 

        this.currentState = this.arena.get(newState)
        this.history.push(this.currentState)
    }

    getCurrentWinner() {
        return this.winCondition(this.history)
    }
}


// const arena = new Arena().addP0('1').addP1('2').addEdge("1","2").compile()
// const game = new Game(arena, '1', (p)=>p.find(v=>v.v === '1') ? 0 : 1)

// game.play<typeof game.currentState.v>("2")
// game.getCurrentWinner()
// // game.play<typeof game.currentState.v>()
