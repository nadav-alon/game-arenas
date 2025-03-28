import { describe, expect, expectTypeOf, it } from 'vitest'
import { Arena, GenericArena, GenericCompiledArena, Vertex, VertexId } from './arena'

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

            expect(subArena.vertices.map(v => v.id)).toEqual(expect.arrayContaining(['0', '1']))

            expect(subArena.edges).toEqual(expect.arrayContaining([['0', '1'], ['1', '0']]))
            expect(subArena.edges.length).toBe(2)


        })

    })
    describe('Type Tests', () => {
        describe('Constant', () => {
            describe('Building', () => {
                it('Empty Arena', () => {
                    const emptyArena = new Arena().compile()
                    expectTypeOf(emptyArena).toEqualTypeOf<Arena<unknown, [], [], true>>()
                })

                it('Simple Arena', () => {
                    const simpleArena = new Arena().addP0('a').addP1('b').compile()
                    expectTypeOf(simpleArena).toEqualTypeOf<Arena<unknown, [{
                        id: "a";
                        player: 0;
                        data: unknown,
                    }, {
                        id: "b";
                        player: 1;
                        data: unknown,
                    }], [], true>>()
                })

                it('Arena With Edges', () => {
                    const arenaWithEdges = new Arena().addP0('a').addP1('b').addEdge('a', 'b').addEdge('a', 'a').compile()

                    expectTypeOf(arenaWithEdges).toEqualTypeOf<Arena<unknown, [{
                        id: "a";
                        player: 0;
                        data: unknown,
                    }, {
                        id: "b";
                        player: 1;
                        data: unknown,
                    }], [['a', 'b'], ['a', 'a']], true>>()
                })
            })
            describe('Get', () => {
                describe('Parameters Types', () => {
                    it('Empty Arena', () => {
                        const emptyArena = new Arena().compile()
                        expectTypeOf(emptyArena.get).parameter(0).toBeNever()
                    })

                    it('Non Empty Arena', () => {
                        const arena = new Arena().addP0('a').addP1('b').compile()
                        expectTypeOf(arena.get).parameter(0).toEqualTypeOf<'a' | 'b'>()
                    })
                })

                it('Result Type', () => {
                    const arena = new Arena().addP0('a').addP0('b').addEdge('a', 'b').compile()

                    expectTypeOf(arena.get('a')).toEqualTypeOf<{ id: 'a', player: 0, data: unknown }>()
                })
            })
            describe('Neighbors', () => {
                describe('Parameters Types', () => {
                    it('Empty Arena', () => {
                        const emptyArena = new Arena().compile()
                        expectTypeOf(emptyArena.getNeighbors).parameter(0).toBeNever()
                    })

                    it('Non Empty Arena', () => {
                        const arena = new Arena().addP0('a').addP1('b').compile()
                        expectTypeOf(arena.getNeighbors).parameter(0).toEqualTypeOf<'a' | 'b'>()
                    })
                })

                it('Result Type', () => {
                    const arena = new Arena().addP0('a').addP0('b').addEdge('a', 'b').addEdge('a', 'a').compile()

                    expectTypeOf(arena.getNeighbors('a')).toEqualTypeOf<["b", 'a']>()
                })
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

                expectTypeOf(arena.subArena).parameter(0).toEqualTypeOf<ReadonlyArray<typeof arena.vertices[number]['id']>>()

                const subArena = arena.subArena(['0', '1'] as ['0', '1'])

                expectTypeOf(subArena).toEqualTypeOf<Arena<unknown, [{
                    id: "0";
                    player: 0;
                    data: unknown
                }, {
                    id: "1";
                    player: 0;
                    data: unknown
                }], [["0", "1"], ["1", "0"]], true>
                >()
            })
        })

        describe('Variable', () => {
            it('Building', () => {
                let arena: GenericArena = new Arena()
                arena = arena.addP0('0').addP1('1').compile()

                expectTypeOf(arena.add).returns.toEqualTypeOf<GenericArena>()
                expectTypeOf(arena.addEdge).returns.toEqualTypeOf<GenericArena>()
            })
            describe('Get', () => {
                it('Parameters Types', () => {
                    let arena: GenericArena = new Arena()
                    arena = arena.addP0('0').addP1('1').compile()

                    expectTypeOf(arena.get).parameter(0).toEqualTypeOf<VertexId>()
                })
                it('Return Type', () => {
                    let arena: GenericArena = new Arena()
                    arena = arena.addP0('0').addP1('1').compile()

                    expectTypeOf(arena.get).returns.toEqualTypeOf<Vertex<unknown>>()
                })

            })
            describe('Neighbors', () => {
                it('Parameters Types', () => {
                    let arena: GenericArena = new Arena()
                    arena = arena.addP0('0').addP1('1').compile()

                    expectTypeOf(arena.getNeighbors).parameter(0).toEqualTypeOf<VertexId>()
                })
                it('Return Type', () => {
                    let arena: GenericArena = new Arena()
                    arena = arena.addP0('0').addP1('1').compile()

                    expectTypeOf(arena.getNeighbors).returns.toEqualTypeOf<Vertex<unknown>[]>()
                })

            })
            describe('Subarena', () => {

                it('Parameter Types', () => {
                    let arena: GenericArena = new Arena()
                    arena = arena.addP0('0').addP1('1').compile()

                    expectTypeOf(arena.subArena).parameter(0).toEqualTypeOf<readonly VertexId[]>()
                })

                it('Return Types', () => {
                    let arena: GenericArena = new Arena()
                    arena = arena.addP0('0').addP1('1').compile()

                    expectTypeOf(arena.subArena).returns.toEqualTypeOf<GenericCompiledArena>()
                })

            })
        })
    })
})