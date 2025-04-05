import { describe, expect, expectTypeOf, it } from "vitest"
import { Arena } from "../arena"
import { createReachabilityGame, ReachabilityData } from "./reachability"

describe('Reachability', () => {
    it('Plays correctly', () => {
        const arena = new Arena<ReachabilityData>().addP0('1', { accepting: false }).addP1('2', { accepting: true }).addEdge('1', '2')

        const game = createReachabilityGame(arena)
        expect(game.getCurrentWinner()).toBe(1)

        const game_ = game.play('2')
        expectTypeOf(game_.play).parameter(0).toBeNever()
        expect(game_.currentState).toMatchObject({ player: 1, id: '2', data: { accepting: true } })

        expect(game_.getCurrentWinner()).toBe(0)
    })
    it.todo('Correct winning strategy', () => { })
})