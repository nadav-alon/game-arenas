import { describe, expect, it } from "vitest";
import { optionsCombinations } from "./test-utils";

describe('Game Utils', () => {
    it.todo('Strategy From History')
    it.todo('Next Step')
    it.todo('Strategy Loop Start Point')
    it.todo('Loop States')
    it.todo('Play Game According To Strategy')
    it('Options Combinations', () => {
        const options = [{ id: '1', options: [1, 2] }, { id: '2', options: [4, 5] }]
        const combinations = optionsCombinations(options)
        const expected = [
            [{ id: '1', option: 1 }, { id: '2', option: 4 },],
            [{ id: '1', option: 2 }, { id: '2', option: 4 },],
            [{ id: '1', option: 1 }, { id: '2', option: 5 },],
            [{ id: '1', option: 2 }, { id: '2', option: 5 },]
        ]
        expect(combinations).toEqual(expect.arrayContaining(expected))
        expect(combinations).toHaveLength(expected.length)

    })
})