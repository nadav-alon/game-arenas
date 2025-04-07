import { Vertex, Edges, Arena } from "../arena";
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

export const solveReachabilityGame = (game: ReachabilityGame): Strategy => {
    throw new Error('unimplemented')
}