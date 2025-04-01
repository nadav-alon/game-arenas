import { describe, expect, expectTypeOf, it } from "vitest";
import { createReachabilityGame, ReachabilityData, ReachabilityGame } from "./game";
import { Arena, GenericArena } from "./arena";

describe('Game', () => {
    describe('Reachability', () => {
        it('Plays correctly', () => {
            const arena = new Arena<ReachabilityData>().addP0('1', { accepting: false }).addP1('2', { accepting: false }).addEdge('1', '2')
            const game = createReachabilityGame(arena)

            expectTypeOf(game).toEqualTypeOf<ReachabilityGame>()

            expect(game.currentState).toMatchObject({ player: 0, id: '1', data: { accepting: false } })
            game.play('')

        })
        it.todo('Correct winning strategy', () => { })
    })
    describe('Buchi', () => {
        it.todo('Plays correctly', () => { })
        it.todo('Correct winning strategy', () => { })
    })
    describe('Parity', () => {
        it.todo('Plays correctly', () => { })
        it.todo('Correct winning strategy', () => { })
    })
})