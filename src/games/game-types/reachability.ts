import { Vertex, Edges, Arena, VertexIds } from "../arena";
import { Game, GenericGame } from "../game";
import { Strategy } from "./utils";

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

const getReachabilitySet = (game: ReachabilityGame): VertexIds => {
    return game.arena.vertices.filter(v => v.data?.accepting).map(v => v.id)
}

export const solveReachabilityGame = (game: ReachabilityGame): Strategy => {
    const { attractor, distMap } = game.arena.getAttractor(0, getReachabilitySet(game))

    const strategy: Strategy = new Map()

    attractor.forEach(v => {
        const vertex = game.arena.get(v)
        switch (vertex.player) {
            case 0:
                const neighbors = game.arena.getNeighbors(v)
                const neighborsWithDistance = neighbors.map(v => ({ v, weight: distMap.get(v) }))
                const minNeighbor = findMinWeightElement(neighborsWithDistance)

                if (minNeighbor === undefined) throw Error('No successor with distance found')

                strategy.set(v, minNeighbor.v)
                break;
            case 1:
                strategy.set(v, game.arena.getNeighbors(v)[0])
                break;
        }
    })

    return strategy
}

type ElWithWeight<V> = { v: V, weight?: number }
const findMinWeightElement = <V>(arr: ElWithWeight<V>[]) => {
    return arr.reduce((prevMin, currentElement) => {
        if (prevMin === undefined || prevMin.weight === undefined) return currentElement
        if (currentElement.weight === undefined) return prevMin

        if (prevMin.weight > currentElement.weight) return currentElement

        return prevMin
    }, undefined as ElWithWeight<V> | undefined)
}