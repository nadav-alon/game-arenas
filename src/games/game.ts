import { Arena, Edges, GenericCompiledArena, NeighborsOf, Player, Vertex } from "./arena";

type History<V extends readonly Vertex[]> = V[number][]
type WinCondition<V extends readonly Vertex[]> = (play: History<V>) => Player

export class Game<Data, V extends readonly Vertex<Data>[] = []> {
    arena: GenericCompiledArena<Data>
    currentState: V[number];
    winCondition: WinCondition<V>;
    history: History<V>

    constructor(arena: typeof this.arena, initialState: V[number]['id'], winCondition: WinCondition<V>) {
        this.arena = arena
        this.currentState = this.arena.get(initialState)
        this.winCondition = winCondition
        this.history = [this.currentState]
    }

    getCurrentPlayer(): Player {
        return this.currentState.player
    }

    play<CurV extends typeof this.currentState.id>(choice: NeighborsOf<CurV, typeof this.arena.vertices, typeof this.arena.edges>[number]) {
        const newState = this.arena.getNeighbors(this.currentState.id).find(n => n === choice)
        if (!newState) {
            throw new Error('cannot play this choice')
        }

        this.currentState = this.arena.get(newState)
        this.history.push(this.currentState)
    }

    getCurrentWinner() {
        return this.winCondition(this.history)
    }
}


type ReachabilityData = { accepting: boolean }
export const createReachabilityGame = (v: Vertex<ReachabilityData>[], e: Edges) => {
    const arena = new Arena<ReachabilityData, Vertex<ReachabilityData>[], Edges>(v, e).compile()

    return new Game<ReachabilityData, Vertex<ReachabilityData>[]>(arena, v[0].id, (h) =>
        h.some(s => s.player === 0) ? 0 : 1)
}