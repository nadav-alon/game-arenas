import { Vertex, VertexId } from "../arena";
import { History, GenericGame } from "../game";

export const generateStrategyFromHistory = <V extends Vertex<unknown>[]>(h: History<V>) => {
    const strategy: Map<VertexId, VertexId> = new Map()

    h.slice(0, h.length).forEach((s, i) => {
        strategy.set(s.id, h[i + 1].id)
    })

    return strategy
}

export const nextState = <Data>(game: GenericGame<Data>, strategy: Map<VertexId, VertexId>, currentState: Vertex) => {

    const nextState = strategy.get(currentState.id)

    if (!nextState)
        throw new Error('Incomplete strategy')

    return game.arena.get(nextState)
}

export const strategyLoopStartpoint = <Data>(game: GenericGame<Data>, strategy: Map<VertexId, VertexId>) => {
    const visitedVertices = new Set<VertexId>()
    let currentState = game.currentState

    while (true) {
        if (visitedVertices.has(currentState.id))
            return currentState.id

        visitedVertices.add(currentState.id)

        currentState = nextState(game, strategy, currentState)
    }
}

export const loopStates = <D, G extends GenericGame<D>>(game: G, strategy: Map<VertexId, VertexId>): Vertex<D>[] => {
    const ret: Set<Vertex<D>> = new Set()

    let currentState = game.arena.get(strategyLoopStartpoint(game, strategy))

    while (true) {
        if (ret.has(currentState)) return Array.from(ret)

        ret.add(currentState)

        currentState = nextState(game, strategy, currentState)
    }
}
