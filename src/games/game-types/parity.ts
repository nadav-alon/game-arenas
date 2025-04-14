import { Vertex, Edges, Player, GenericArena } from "../arena";
import { Game, GenericGame } from "../game";
import { generateStrategyFromHistory, Strategy, strategyLoopStates } from "./utils";

export type ParityData = { color: number }
export type ParityGame = GenericGame<ParityData>

export const createParityGame = (
    a: GenericArena<ParityData>) => {
    const arena = a.compile()
    const { vertices: v } = arena

    function winCondition<G extends ParityGame>(this: G, h: typeof this.history) {
        const strategy = generateStrategyFromHistory(h)
        const loop = strategyLoopStates<ParityData, G>(this, strategy)

        return Math.min(...loop.map(s => s.data?.color ?? Infinity)) % 2 as Player
    }

    const game = new Game<ParityData, Vertex<ParityData>[], Edges>(arena,
        v[0].id,
    )
    game.winCondition = winCondition

    return game
}

export const solveParityGame = (game: ParityGame): Strategy => {
    throw new Error('unimplemented')
}