import { describe, expect, expectTypeOf, it } from "vitest";
import { createReachabilityGame, ReachabilityData } from "./game-types/reachability";
import { Arena } from "./arena";

describe('Game', () => {
    it('Plays correctly', () => {
        const arena = new Arena<ReachabilityData>().addP0('1', { accepting: false }).addP1('2', { accepting: true }).addEdge('1', '2').addEdge('2', '1')

        const game = createReachabilityGame(arena)
        expect(game.currentState).toMatchObject({ player: 0, id: '1', data: { accepting: false } })
        expectTypeOf(game.play).parameter(0).toEqualTypeOf<'2'>()

        const game_ = game.play('2')
        expectTypeOf(game_.play).parameter(0).toEqualTypeOf<'1'>()
        expect(game_.currentState).toMatchObject({ player: 1, id: '2', data: { accepting: true } })

        expect(game_.history).toMatchObject([{ player: 0, id: '1', data: { accepting: false } }, { player: 1, id: '2', data: { accepting: true } }])
    })
})