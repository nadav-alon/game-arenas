import { Arena, Edges, NeighborsOf, Player, Vertex } from "./arena";

export type History<V extends readonly Vertex[]> = V[number][]

export type GenericGame<Data> = Game<Data, Vertex<Data>[], Edges>

export class Game<Data, V extends readonly Vertex<Data>[] = [], E extends Edges = [], C extends V[number] = V[0]> {
    arena: Arena<Data, V, E, true>
    currentState: C
    winCondition: (this: typeof this, play: History<V>) => Player
    history: History<V>

    constructor(arena: typeof this.arena, initialState: V[number]['id']) {
        this.arena = arena
        this.currentState = this.arena.get(initialState) as C
        this.winCondition = () => { throw Error('unimplemented') }
        this.history = [this.currentState]
    }

    clone() {
        const clone = new Game<Data, V, E, typeof this.currentState>(this.arena, this.currentState.id)
        clone.winCondition = this.winCondition as typeof clone.winCondition
        clone.history = [...this.history]
        return clone
    }

    getCurrentPlayer(): Player {
        return this.currentState.player
    }

    play<CurV extends C>(choice: NeighborsOf<CurV['id'], V, E>[number]) {
        const newState = this.arena.getNeighbors(this.currentState.id).find(n => n === choice)
        if (!newState) {
            throw new Error('cannot play this choice')
        }

        const newStateVertex = this.arena.get(newState)
        const clone = this.clone()
        clone.currentState = newStateVertex as C
        clone.history.push(clone.currentState)

        return clone as unknown as Game<Data, V, E, typeof newStateVertex>
    }

    getCurrentWinner() {
        return this.winCondition(this.history)
    }
}
