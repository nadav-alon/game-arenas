
import { describe, expect, it } from "vitest";
import { Arena } from "../arena";
import { BuchiData, createBuchiGame } from "./buchi";

describe('Buchi', () => {
    it('Plays correctly', () => {
        const arena = new Arena<BuchiData>().addP0('1', { accepting: false }).addP1('2', { accepting: true }).addEdge('1', '2').addEdge('2', '1').addEdge('1', '1')

        const game = createBuchiGame(arena)
        expect(game.getCurrentWinner(), 'Game is not complete yet, winner should be 1 by default').toBe(1)

        const game_ = game.play('2')
        expect(game_.currentState, 'Not in correct state').toMatchObject({ player: 1, id: '2', data: { accepting: true } })

        const game__ = game_.play('1')

        expect(game__.getCurrentWinner(), '0 should be winning').toBe(0)

        const losing_game = game.play('1')
        expect(losing_game.currentState, 'Not in correct state').toMatchObject({ player: 0, id: '1', data: { accepting: false } })
        expect(losing_game.getCurrentWinner(), '1 should be winning').toBe(1)

    })
    it.todo('Correct winning strategy', () => { })
})