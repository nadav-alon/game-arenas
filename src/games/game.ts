import { Arena, Edges, NeighborsOf, Player, Vertex } from "./arena";

type WinCondition<V extends readonly Vertex[]> = (play: V[number][]) => Player

export class Game<V extends readonly Vertex[] = [], E extends Edges = []> {
    arena: Arena<V,E,true>;
    currentState: V[number];
    winCondition: WinCondition<V>;
    history: V[number][]

    constructor(vertices: V = [] as unknown as V, edges: E = [] as unknown as E, initialState: V[number], winCondition:WinCondition<V>) {
        this.arena = new Arena(vertices, edges).compile()
        this.currentState = initialState
        this.winCondition = winCondition
        this.history = [initialState]
    }

    getCurrentPlayer(): Player {
        return this.currentState.p
    }

    play(choice: NeighborsOf<typeof this.currentState.v,V,E>[number]){ 
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