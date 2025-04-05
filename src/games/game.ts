import { Arena, Edges, GenericArena, NeighborsOf, Player, Vertex, VertexId } from "./arena";

type History<V extends readonly Vertex[]> = V[number][]

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


export type ReachabilityData = { accepting: boolean }
export type ReachabilityGame = GenericGame<ReachabilityData>
export const createReachabilityGame = <V extends Vertex<ReachabilityData>[], E extends Edges>(a: Arena<ReachabilityData, V, E>) => {
    const arena = a.compile()
    const { vertices: v } = arena

    const game = new Game(arena, v[0].id)

    game.winCondition = (h) =>
        h.some(s => s.data?.accepting) ? 0 : 1

    return game
}

const generateStrategyFromHistory = <V extends Vertex<unknown>[]>(h: History<V>) => {
    const strategy: Map<VertexId, VertexId> = new Map()

    h.slice(0, h.length).forEach((s, i) => {
        strategy.set(s.id, h[i + 1].id)
    })

    return strategy
}

const nextState = <Data>(game: GenericGame<Data>, strategy: Map<VertexId, VertexId>, currentState: Vertex) => {

    const nextState = strategy.get(currentState.id)

    if (!nextState)
        throw new Error('Incomplete strategy')

    return game.arena.get(nextState)
}

const strategyLoopStartpoint = <Data>(game: GenericGame<Data>, strategy: Map<VertexId, VertexId>) => {
    const visitedVertices = new Set<VertexId>()
    let currentState = game.currentState

    while (true) {
        if (visitedVertices.has(currentState.id))
            return currentState.id

        visitedVertices.add(currentState.id)

        currentState = nextState(game, strategy, currentState)
    }
}

const loopStates = <D, G extends GenericGame<D>>(game: G, strategy: Map<VertexId, VertexId>): Vertex<D>[] => {
    const ret: Set<Vertex<D>> = new Set()

    let currentState = game.arena.get(strategyLoopStartpoint(game, strategy))

    while (true) {
        if (ret.has(currentState)) return Array.from(ret)

        ret.add(currentState)

        currentState = nextState(game, strategy, currentState)
    }
}

export type BuchiData = ReachabilityData
export type BuchiGame = GenericGame<BuchiData>

export const createBuchiGame = (
    a: GenericArena<BuchiData>) => {

    const arena = a.compile()
    const { vertices: v } = arena

    function winCondition<G extends BuchiGame>(this: G, h: typeof this.history) {
        const strategy = generateStrategyFromHistory(h)
        const loop = loopStates<ReachabilityData, G>(this, strategy)

        return loop.some(s => s.data?.accepting) ? 0 : 1
    }

    const game = new Game(arena, v[0].id)

    game.winCondition = winCondition

    return game

}

export type ParityData = { color: number }
export type ParityGame = GenericGame<ParityData>

export const createParityGame = (
    a: GenericArena<ParityData>) => {
    const arena = a.compile()
    const { vertices: v } = arena

    function winCondition<G extends ParityGame>(this: G, h: typeof this.history) {
        const strategy = generateStrategyFromHistory(h)
        const loop = loopStates<ParityData, G>(this, strategy)

        return Math.min(...loop.map(s => s.data?.color ?? Infinity)) % 2 as Player
    }

    const game = new Game<ParityData, Vertex<ParityData>[], Edges>(arena,
        v[0].id,
    )
    game.winCondition = winCondition

    return game
}