import { GenericArena } from "../arena";
import { Game, GenericGame } from "../game";
import { ReachabilityData } from "./reachability";
import { generateStrategyFromHistory, loopStates } from "./utils";


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