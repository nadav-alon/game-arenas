import { Vertex, VertexId } from "../arena";
import { History, GenericGame } from "../game";

export type Strategy = Map<VertexId, VertexId>

export const generateStrategyFromHistory = <V extends Vertex<unknown>[]>(h: History<V>) => {
    const strategy: Strategy = new Map()

    h.slice(0, h.length).forEach((s, i) => {
        strategy.set(s.id, h[i + 1].id)
    })

    return strategy
}

export const nextStateByStrategy = <Data>(game: GenericGame<Data>, strategy: Strategy, currentState: Vertex) => {

    const nextState = strategy.get(currentState.id)

    if (!nextState)
        throw new Error('Incomplete strategy')

    return game.arena.get(nextState)
}

export const strategyLoopStartpoint = <Data>(game: GenericGame<Data>, strategy: Strategy) => {
    const visitedVertices = new Set<VertexId>()
    let currentState = game.currentState

    while (true) {
        if (visitedVertices.has(currentState.id))
            return currentState.id

        visitedVertices.add(currentState.id)

        currentState = nextStateByStrategy(game, strategy, currentState)
    }
}

export const strategyLoopStates = <D, G extends GenericGame<D>>(game: G, strategy: Strategy): Vertex<D>[] => {
    const ret: Set<Vertex<D>> = new Set()

    let currentState = game.arena.get(strategyLoopStartpoint(game, strategy))

    while (true) {
        if (ret.has(currentState)) return Array.from(ret)

        ret.add(currentState)

        currentState = nextStateByStrategy(game, strategy, currentState)
    }
}
