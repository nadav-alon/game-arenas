import { assert, expect } from "vitest"
import { GenericGame } from "../game"
import { Strategy } from "./utils"
import { Player } from "../arena"

export const assertWinningStrategy = <T>(game: GenericGame<T>, strategy: Strategy, player: Player) => {
    // TODO: generate all possible strategies for the opposing player
    const possibleStrategies = [strategy]

    possibleStrategies.forEach(strat => {
        const gameAfterPlayingStrategy = playGameAccordingToStrategy(game, strat)
        expect(gameAfterPlayingStrategy.getCurrentWinner(), `Strategy ${strat} is not winning`).toBe(player)
    })
}

export const playGameAccordingToStrategy = <T>(game: GenericGame<T>, strategy: Strategy): GenericGame<T> => {
    let clone = game.clone()

    for (let i = 0; i < game.arena.vertices.length; i++) {
        const choice = strategy.get(clone.currentState.id)
        assert(choice !== undefined, "No choice from strategy")
        clone = clone.play(choice)
    }

    return clone
}