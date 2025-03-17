import { describe, expect, it } from 'vitest'
import { Arena } from './arena'

describe('Arena', () => {
    describe('Build Arena', () => {
        it('Adding Vertices', () => {
            const arena = new Arena().addP0('a').addP1('b')
            expect(arena.vertices.length).toBe(2)
        })

        it('Adding Edges', () => {
            const arena = new Arena().addP0('a').addP1('b').addEdge('a', 'b').addEdge('a', 'a')
            expect(arena.edges.length).toBe(2)
        })

        it('Neighbors', () => {
            const arena = new Arena().addP0('a').addP1('b').addEdge('a', 'b').addEdge('a', 'a')

            const aNeighbors = arena.getNeighbors('a')
            expect(aNeighbors).toEqual(expect.arrayContaining(['a', 'b']))

            const bNeighbors = arena.getNeighbors('b')
            expect(bNeighbors.length).toBe(0)
        })

        it('Subarena', () => {
            const arena = new Arena().
                addP0('0').
                addP0('1').
                addP0('2').
                addP0('3').
                addP0('4').
                addP0('5').
                addP0('6').
                addP0('7').
                addP0('8').
                addP0('9').
                addP0('10').
                addEdge('0', '1').
                addEdge('0', '2').
                addEdge('0', '3').
                addEdge('0', '4').
                addEdge('0', '5').
                addEdge('0', '6').
                addEdge('0', '7').
                addEdge('0', '8').
                addEdge('0', '9').
                addEdge('0', '10').
                addEdge('1', '0').
                addEdge('2', '0').
                addEdge('3', '0').
                addEdge('4', '0').
                addEdge('5', '0').
                addEdge('6', '0').
                addEdge('7', '0').
                addEdge('8', '0').
                addEdge('9', '0').
                addEdge('10', '0').compile()

            const subArena = arena.subArena(['0', '1'] as ['0', '1'])

            expect(subArena.vertices.map(v => v.v)).toEqual(expect.arrayContaining(['0', '1']))

            expect(subArena.edges).toEqual(expect.arrayContaining([['0', '1'], ['1', '0']]))
            expect(subArena.edges.length).toBe(2)


        })

    })
    describe('Type Tests', () => {
        describe('Constant', () => {
            it.todo('Building', () => { })
            it.todo('Get', () => { })
            it.todo('Neighbors', () => { })
            it.todo('Subarena', () => { })
        })

        describe('Variable', () => {
            it.todo('Building', () => { })
            it.todo('Get', () => { })
            it.todo('Neighbors', () => { })
            it.todo('Subarena', () => { })
        })
    })
})