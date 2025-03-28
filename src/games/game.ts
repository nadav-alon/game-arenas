import { GenericCompiledArena, NeighborsOf, Player, Vertex } from "./arena";

type WinCondition<V extends readonly Vertex[]> = (play: V[number][]) => Player

export class Game<Data, V extends readonly Vertex<Data>[] = []> {
    arena: GenericCompiledArena<Data>
    currentState: V[number];
    winCondition: WinCondition<V>;
    history: V[number][]

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


// type ReachabilityData = { accepting: boolean }
// export const createReachabilityGame = <V extends Vertex<ReachabilityData>[], E extends Edges>(v: V, e: E) => {
//     const arena = new Arena<ReachabilityData, V, E>(v, e).compile()
//     arena.add({ id: '1', player: 0, data: { accepting: true } })
//     const neigh = arena.getNeighbors('1')
//     const x = neigh[0]

//     return new Game(arena, v[0].id, () => true)
// }