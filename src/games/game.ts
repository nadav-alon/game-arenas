import { Arena, Edges, NeighborsOf, Player, SpecificVertexOf, Vertex } from "./arena";

export type History<V extends readonly Vertex[]> = V[number][]

export type GenericGame<Data> = Game<Data, Vertex<Data>[], Edges>

export class Game<Data, V extends readonly Vertex<Data>[] = [], E extends Edges = [], C extends V[number] = V[0]> {
    arena: Arena<Data, V, E, true>
    currentState: C
    winCondition: <G extends GenericGame<Data>>(this: G, play: History<V>) => Player
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

    play<CurV extends C, Choice extends NeighborsOf<CurV['id'], V, E>[number]>(choice: Choice) {
        const newState = this.arena.getNeighbors(this.currentState.id).find(n => n === choice)
        if (!newState) {
            throw new Error('cannot play this choice')
        }

        const newStateVertex = this.arena.get(newState)
        const clone = this.clone()
        clone.currentState = newStateVertex as C
        clone.history.push(clone.currentState)

        return clone as unknown as Game<Data, V, E, SpecificVertexOf<Choice, V>>
    }

    getCurrentWinner() {
        return (this as unknown as GenericGame<Data>).winCondition(this.history)
    }
}
