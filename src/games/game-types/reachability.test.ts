import { describe, expect, expectTypeOf, it } from "vitest"
import { Arena } from "../arena"
import { createReachabilityGame, ReachabilityData, ReachabilityGame, solveReachabilityGame } from "./reachability"
import { assertWinningStrategy } from "./test-utils"

describe('Reachability', () => {
    it('Plays correctly', () => {
        const arena = new Arena<ReachabilityData>().addP0('1', { accepting: false }).addP1('2', { accepting: true }).addEdge('1', '2').addEdge('2', '1')

        const game = createReachabilityGame(arena)
        expect(game.getCurrentWinner()).toBe(1)

        const game_ = game.play('2')
        expectTypeOf(game_.play).parameter(0).toBeNever()
        expect(game_.currentState).toMatchObject({ player: 1, id: '2', data: { accepting: true } })

        expect(game_.getCurrentWinner()).toBe(0)
    })
    it('Correct winning strategy', () => {

        const arena = new Arena<ReachabilityData>().addP0('1').addP1('2').addP1('3').addP0('4').addP1('5', { accepting: true }).addP0('6').addEdge('1', '2').addEdge('1', '3').addEdge('2', '1').addEdge('2', '4').addEdge('3', '5').addEdge('3', '6').addEdge('4', '2').addEdge('5', '1').addEdge('6', '2').addEdge('6', '5')

        const game = createReachabilityGame(arena) as unknown as ReachabilityGame

        const strategy = solveReachabilityGame(game)
        assertWinningStrategy(game, strategy, 1)
    })
})



