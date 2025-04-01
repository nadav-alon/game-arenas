import { Arena, Edges, GenericCompiledArena, NeighborsOf, Player, Vertex, VertexId } from "./arena";

type History<V extends readonly Vertex[]> = V[number][]

type GenericGame<Data> = Game<Data, Vertex<Data>[]>

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


type ReachabilityData = { accepting: boolean }
type ReachabilityGame = Game<ReachabilityData, Vertex<ReachabilityData>[]>
export const createReachabilityGame = (v: Vertex<ReachabilityData>[], e: Edges): ReachabilityGame => {
    const arena = new Arena<ReachabilityData, Vertex<ReachabilityData>[], Edges>(v, e).compile()

    const game = new Game<ReachabilityData, Vertex<ReachabilityData>[]>(arena, v[0].id)

    game.winCondition = (h) =>
        h.some(s => s.player === 0) ? 0 : 1

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


export const createBuchiGame = (v: Vertex<ReachabilityData>[], e: Edges) => {
    const arena = new Arena<ReachabilityData, Vertex<ReachabilityData>[], Edges>(v, e).compile()

    function winCondition<G extends Game<ReachabilityData, Vertex<ReachabilityData>[]>>(this: G, h: typeof this.history) {
        const strategy = generateStrategyFromHistory(h)
        const loop = loopStates<ReachabilityData, G>(this, strategy)

        return loop.some(s => s.data?.accepting) ? 0 : 1
    }

    const game = new Game<ReachabilityData, Vertex<ReachabilityData>[]>(arena,
        v[0].id,
    )
    game.winCondition = winCondition

    return game

}

type ParityData = { color: number }

export const createParityGame = (v: Vertex<ParityData>[], e: Edges) => {
    const arena = new Arena<ParityData, Vertex<ParityData>[], Edges>(v, e).compile()

    function winCondition<G extends Game<ParityData, Vertex<ParityData>[]>>(this: G, h: typeof this.history) {
        const strategy = generateStrategyFromHistory(h)
        const loop = loopStates<ParityData, G>(this, strategy)

        return Math.min(...loop.map(s => s.data?.color ?? Infinity)) % 2 as Player
    }

    const game = new Game<ParityData, Vertex<ParityData>[]>(arena,
        v[0].id,
    )
    game.winCondition = winCondition

    return game
}