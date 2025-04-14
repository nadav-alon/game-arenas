import { Arena, Edges, Vertex } from "../arena";
import { Game, GenericGame } from "../game";
import { ReachabilityData } from "./reachability";
import { generateStrategyFromHistory, INCOMPLETE_STRATEGY_ERROR, Strategy, strategyLoopStates } from "./utils";


export type BuchiData = ReachabilityData
export type BuchiGame = GenericGame<BuchiData>

export const createBuchiGame = <V extends Vertex<BuchiData>[], E extends Edges>(
    a: Arena<BuchiData, V, E>) => {

    const arena = a.compile()
    const { vertices: v } = arena

    function winCondition<G extends BuchiGame>(this: G, h: typeof this.history) {
        const strategy = generateStrategyFromHistory(h)
        try {
            const loop = strategyLoopStates<ReachabilityData, G>(this, strategy)
            return loop.some(s => s.data?.accepting) ? 0 : 1
        } catch (e) {
            if (e instanceof INCOMPLETE_STRATEGY_ERROR) {
                return 1
            }
            throw e
        }
    }

    const game = new Game(arena, v[0].id)

    game.winCondition = winCondition

    return game

}

export const solveBuchiGame = (game: BuchiGame): Strategy => {
    throw new Error('unimplemented')
}