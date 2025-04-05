import { IsTuple } from "./type-utils";

export type Player = 0 | 1;
export function isPlayer(i: unknown): i is Player {
  return i === 0 || i === 1
}

export function otherPlayer(i: Player): Player {
  return 1 - i as Player
}

export type VertexId = string
export type Vertex<Data = unknown> = { id: VertexId, player: Player, data?: Data }
export type VertexIds = readonly VertexId[]
export type Edge = [VertexId, VertexId]
export type Edges = readonly Edge[]

export type GenericArena<Data = unknown> = Arena<Data, Vertex<Data>[], Edges, boolean>
export type GenericCompiledArena<Data = unknown> = Arena<Data, Vertex<Data>[], Edges, true>

type CompiledData<Data, V extends readonly Vertex<Data>[] = [],
  // E extends Edges = [],
  C extends boolean = false> = C extends false ? null : {
    v0: V[number][]
    v1: V[number][]
  }

export class Arena<Data, V extends readonly Vertex<Data>[] = [], E extends Edges = [], C extends boolean = false> {
  compiled: C
  vertices: V;
  edges: E;
  map: C extends true ? Map<V[number]['id'], V[number]> : never
  adjacencyList: C extends true ? Map<V[number]['id'], V[number]['id'][]> : never
  compiledData: CompiledData<Data, V, C>;

  constructor(vertices: V = [] as unknown as V, edges: E = [] as unknown as E) {
    this.vertices = vertices
    this.edges = edges
    this.compiled = false as C
    this.map = { get() { throw new Error('No Map') } } as never
    this.adjacencyList = { get() { throw new Error('No Adjacency List') } } as never
    this.compiledData = null as CompiledData<Data, V, C>
  }

  toString() {
    return `Vertices: ${this.vertices.map(v => `${v.id} - p${v.player}`)} Edges: ${this.edges.map(e => `${e[0]} -> ${e[1]}`)}`
  }

  /** returns new arena with the new vertex */
  add<NewV extends Vertex<Data>>(newVertex: NewV) {
    if (this.compiled) throw new Error('already compiled')
    if (this.vertices.find(v => v.id === newVertex.id)) throw new Error('Vertex already exists')

    type NewVerticesType = IsTuple<V> extends true ? [...V, NewV] : V
    const newVertices: NewVerticesType = [...this.vertices, newVertex] as NewVerticesType
    const ret = new Arena<Data, NewVerticesType, E, C>(newVertices, this.edges)
    return ret
  }

  /** returns new arena with a new p0 vertex */
  addP0<NewV extends VertexId>(newVertex: NewV, data?: Data) {
    return this.add({ id: newVertex, player: 0, data })
  }

  /** returns new arena with a new p1 vertex */
  addP1<NewV extends VertexId>(newVertex: NewV, data?: Data) {
    return this.add({ id: newVertex, player: 1, data })
  }

  /** returns new arean with a new edge */
  addEdge<NewE extends [V[number]['id'], V[number]['id']]>(...newEdge: NewE)//: Arena<Data, V, [...E, NewE], C> 
  {
    if (this.compiled) throw new Error('already compiled')

    const [from, to] = newEdge;
    if (!this.vertices.some(v => v.id === from) || !this.vertices.some(v => v.id === to)) {
      throw new Error(`Cannot add edge ${from} → ${to}: One or both vertices do not exist`);
    }

    type NewEdgesType = IsTuple<E> extends true ? [...E, NewE] : E
    const newEdges: NewEdgesType = [...this.edges, [...newEdge]] as NewEdgesType

    return new Arena<Data, V, NewEdgesType, C>(this.vertices, newEdges);
  }

  /** returns neighbors of a vertex */
  getNeighbors<Vert extends V[number]['id']>(vertex: Vert): NeighborsOf<Vert, V, E> {
    if (this.compiled) {
      return (this.adjacencyList.get(vertex) ?? []) as NeighborsOf<Vert, V, E>;
    }

    return this.edges.filter(e => e[0] === vertex).map(e => e[1]) as NeighborsOf<Vert, V, E>;
  }


  _setMap(m: typeof this.map) {
    this.map = m
  }

  /** freezes arena and adds map and adjecency list for more optimized queries */
  compile() {
    this.compiled = true as C;
    const map = new Map<V[number]['id'], V[number]>(this.vertices.map(v => [v.id, v]));

    const adjacencyList = new Map<V[number]['id'], V[number]['id'][]>();
    this.edges.forEach(([from, to]) => {
      if (!adjacencyList.has(from)) adjacencyList.set(from, []);
      adjacencyList.get(from)!.push(to);
    });

    const ret = this as Arena<Data, V, E, true>;
    ret._setMap(map);
    ret.adjacencyList = adjacencyList;


    ret.compiledData = {
      v0: ret.vertices.filter(v => v.player === 0),
      v1: ret.vertices.filter(v => v.player === 1)
    }
    return ret;
  }

  /** get a vertex of the arena */
  get<Vert extends V[number]['id']>(vertex: Vert): SpecificVertexOf<Vert, V> {
    if (this.compiled) {
      return this.map.get(vertex) as SpecificVertexOf<Vert, V>;
    }
    return this.vertices.find(v => v.id === vertex) as SpecificVertexOf<Vert, V>;

  }

  /** limits arena to a subset of vertex. returns new arena */
  subArena<NewVert extends ReadonlyArray<V[number]['id']>>(subVertices: NewVert): Arena<Data, SpecificVerticesOf<NewVert, V>, EdgesThatStartAndEndAtVertices<NewVert, E>, true> {
    const newVertices = this.vertices.filter(v => subVertices.includes(v.id)) as SpecificVerticesOf<NewVert, V>
    const newEdges = this.edges.filter(e => subVertices.includes(e[0]) && subVertices.includes(e[1])) as EdgesThatStartAndEndAtVertices<NewVert, E>

    const ret = new Arena<Data, typeof newVertices, typeof newEdges>(newVertices, newEdges).compile()

    // some new Vertex doesnt have a successor
    if (newVertices.some(v => {
      return (ret.getNeighbors(v.id) as unknown[]).length === 0
    })) throw new Error('Invalid sub-arena')

    return ret
  }

  getPlayerVertices(i: Player) {
    return this.compiledData?.[`v${i}`] ?? this.vertices.filter(v => v.player === i)
  }

  getAttractor(i: Player, r: V[number][]) {
    throw new Error('Not implemented')
  }

  controlledPredecessor(i: Player, r: V[number]['id'][]) {
    const vPlayer = this.getPlayerVertices(i)
    const vOtherPlayer = this.getPlayerVertices(otherPlayer(i))

    const playerCanChoose = vPlayer.filter(v => {
      const successors = this.getNeighbors(v.id)
      return successors.some(vTag => r.includes(vTag))
    }
    )

    const otherPlayerMustChoose = vOtherPlayer.filter(v => {
      const successors = this.getNeighbors(v.id)
      return successors.every(vTag => r.includes(vTag))
    }
    )

    return [...playerCanChoose, ...otherPlayerMustChoose].map(v => v.id)
  }

}

export type NeighborsOf<
  V extends VertexId,
  Vertices extends readonly Vertex[],
  Edges_ extends Edges
> =
  V extends Vertices[number]['id'] // Ensure Vertex exists in Vertices
  ? IsTuple<Edges_> extends true
  ? Edges_ extends [[infer Source extends string, infer Target extends string], ...infer Rest extends Edges]
  ? V extends Source
  ? [Target, ...NeighborsOf<V, Vertices, Rest>]
  : NeighborsOf<V, Vertices, Rest>
  : [] // If no more edges, return an empty array
  : Vertices[number]['id'][] // If not a tuple, cannot statically determine neighbors
  : never;


type SpecificVertexOf<
  V extends string,
  Vertices extends readonly Vertex[]> =
  IsTuple<Vertices> extends true ?
  Vertices extends [infer First, ...infer Rest]
  ? First extends Vertex ?
  V extends First['id'] ? First :
  Rest extends readonly Vertex[] ?
  SpecificVertexOf<V, Rest>
  : never
  : never
  : never
  : Vertices[number]


type SpecificVerticesOf<
  V extends VertexIds,
  Vertices extends readonly Vertex[]> =
  IsTuple<Vertices> extends true ?
  V extends [infer First, ...infer Rest]
  ? First extends string ?
  (
    Rest extends VertexIds ?
    [SpecificVertexOf<First, Vertices>, ...SpecificVerticesOf<Rest, Vertices>] :
    [SpecificVertexOf<First, Vertices>])
  : readonly []
  : readonly []
  : Vertices


type EdgesThatContainVertex<
  V extends string,
  Edges_ extends Edges,
  Position extends 0 | 1
> =
  IsTuple<Edges_> extends true ?
  Edges_ extends [infer First, ...infer Rest]
  ? First extends [string, string] ?
  V extends First[Position] ?
  Rest extends Edges ?
  [First, ...EdgesThatContainVertex<V, Rest, Position>]
  : [First]
  : Rest extends Edges ?
  [...EdgesThatContainVertex<V, Rest, Position>]
  : readonly []
  : readonly []
  : readonly []
  : Edges_


type EdgesThatContainVertices<
  V extends VertexIds,
  Edges_ extends Edges,
  Position extends 0 | 1
> =
  IsTuple<V> extends true ?
  V extends [infer First, ...infer Rest] ?
  First extends string ?
  Rest extends VertexIds ?
  [...EdgesThatContainVertex<First, Edges_, Position>, ...EdgesThatContainVertices<Rest, Edges_, Position>]
  : [...EdgesThatContainVertex<First, Edges_, Position>]
  : readonly []
  : readonly []
  : Edges_

type EdgesThatStartAndEndAtVertices<V extends VertexIds, Edges_ extends Edges> =
  IsTuple<Edges_> extends true ?
  EdgesThatContainVertices<V, EdgesThatContainVertices<V, Edges_, 1>, 0> :
  Edges_

