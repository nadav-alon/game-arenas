import { assert, expect } from "vitest"
import { GenericGame } from "../game"
import { Strategy } from "./utils"
import { otherPlayer, Player } from "../arena"

export const assertWinningStrategy = <T>(game: GenericGame<T>, strategy: Strategy, player: Player) => {
    // TODO: generate all possible strategies for the opposing player
    const otherPlayerVertices = game.arena.compiledData[`v${otherPlayer(player)}`]

    const otherPlayerVerticesWithChoices = otherPlayerVertices.filter(v => game.arena.getNeighbors(v.id).length > 1)

    const strategies: Strategy[] = []

    for (const choices of bitIndexGenerator(otherPlayerVerticesWithChoices.length)) {

        // each chosen vertex's switch options
        const optionsToCombine = choices.map(i => {
            const currentVertex = otherPlayerVerticesWithChoices[i].id
            const currentChoice = strategy.get(currentVertex)
            // cannot be switched to the same choice
            return { id: currentVertex, options: game.arena.getNeighbors(currentVertex).filter(n => n !== currentChoice) }
        })

        // get all combinations of swappings
        const waysToCombineOptions = optionsCombinations(optionsToCombine)

        // add each combination to the strategies
        waysToCombineOptions.forEach(optionCombination => {
            const newStrat = new Map(strategy)
            optionCombination.forEach(option => {
                newStrat.set(option.id, option.option)
            })
            strategies.push(newStrat)
        })
    }


    strategies.forEach(strat => {
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

// Generator that yields the indices of bits that are 1
function* bitIndexGenerator(n: number): Generator<number[]> {
    const total = 1 << n // 2^n

    for (let i = 0; i < total; i++) {
        const indices: number[] = []
        for (let bitIndex = 0; bitIndex < n; bitIndex++) {
            if ((i >> (n - bitIndex - 1)) & 1) {
                indices.push(bitIndex)
            }
        }
        yield indices
    }
}
export const optionsCombinations = <I, T>(optionsToCombine: { id: I; options: T[] }[]): { id: I, option: T }[][] => {
    const [first, ...rest] = optionsToCombine
    const firstOptions = first.options.map(option => ([{ id: first.id, option }]))
    if (rest.length === 0) return firstOptions

    const restCombinations = optionsCombinations(rest)

    return restCombinations.flatMap(restCombination => {
        return firstOptions.map(firstOption => ([...firstOption, ...restCombination]))
    })

}