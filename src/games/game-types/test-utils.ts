import { assert, expect } from "vitest"
import { GenericGame } from "../game"
import { Strategy } from "./utils"
import { GenericCompiledArena, otherPlayer, Player } from "../arena"
import fs from 'fs';
import path from 'path';

const fillEmptyChoicesArbitrarily = <T>(arena: GenericCompiledArena<T>, strategy: Strategy): Strategy => {
    const strat = new Map(strategy)

    // make sure all of the vertices has a strategy
    arena.vertices.forEach(v => {
        if (!strat.has(v.id)) strat.set(v.id, arena.getNeighbors(v.id)[0])
    })

    return strat
}

export const assertWinningStrategy = <T>(game: GenericGame<T>, strategy: Strategy, player: Player) => {
    const otherPlayerVertices = game.arena.compiledData[`v${otherPlayer(player)}`]

    // make sure all of the vertices has a strategy

    const strat = fillEmptyChoicesArbitrarily(game.arena, strategy)

    const otherPlayerVerticesWithChoices = otherPlayerVertices.filter(v => game.arena.getNeighbors(v.id).length > 1)

    const strategies: Strategy[] = []

    for (const choices of bitIndexGenerator(otherPlayerVerticesWithChoices.length)) {

        // each chosen vertex's switch options
        const optionsToCombine = choices.map(i => {
            const currentVertex = otherPlayerVerticesWithChoices[i].id
            const currentChoice = strat.get(currentVertex)
            // cannot be switched to the same choice
            return { id: currentVertex, options: game.arena.getNeighbors(currentVertex).filter(n => n !== currentChoice) }
        })

        // get all combinations of swappings
        const waysToCombineOptions = optionsCombinations(optionsToCombine)

        // add each combination to the strategies
        waysToCombineOptions.forEach(optionCombination => {
            const newStrat = new Map(strat)
            optionCombination.forEach(option => {
                newStrat.set(option.id, option.option)
            })
            strategies.push(newStrat)
        })
    }


    strategies.forEach(strat => {
        const gameAfterPlayingStrategy = playGameAccordingToStrategy(game, strat)
        const winner = gameAfterPlayingStrategy.getCurrentWinner()
        try {
            expect(winner, `Strategy ${strat} is not winning`).toBe(player)
        } catch (error) {
            const dir = path.resolve('failed-cases');
            if (!fs.existsSync(dir)) fs.mkdirSync(dir);

            fs.writeFileSync(
                path.join(dir, `failing-strat.json`),
                JSON.stringify({
                    game,
                    shouldWin: player,
                    actualWinner: winner,
                    strat: Object.fromEntries(strat),
                    error: error instanceof Error ? error.message : String(error),
                }, null, 2)
            );

            throw error; // rethrow to let Vitest know it's a legit failure
        }
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
    if (!first) return []

    const firstOptions = first.options.map(option => ([{ id: first.id, option }]))
    if (rest.length === 0) return firstOptions

    const restCombinations = optionsCombinations(rest)

    return restCombinations.flatMap(restCombination => {
        return firstOptions.map(firstOption => ([...firstOption, ...restCombination]))
    })

}