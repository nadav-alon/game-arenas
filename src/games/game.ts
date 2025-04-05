import { GenericCompiledArena, NeighborsOf, Player, Vertex } from "./arena";

export type History<V extends readonly Vertex[]> = V[number][]

export type GenericGame<Data> = Game<Data, Vertex<Data>[]>

export class Game<Data, V extends readonly Vertex<Data>[] = []> {
    arena: GenericCompiledArena<Data>
    currentState: V[number];
    winCondition: (this: typeof this, play: History<V>) => Player
    history: History<V>

    constructor(arena: typeof this.arena, initialState: V[number]['id']) {
        this.arena = arena
        this.currentState = this.arena.get(initialState)
        this.winCondition = () => { throw Error('unimplemented') }
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


