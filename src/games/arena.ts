export type Player = 0 | 1;
export type VertexId = string
export type Vertex<Data = any> = {id: VertexId, player: Player, data?: Data}
export type VertexIds = readonly VertexId[]
export type Edge = [VertexId, VertexId]
export type Edges = readonly Edge[]

export class Arena<Data=any, V extends readonly Vertex<Data>[] = Vertex<Data>[], E extends Edges = Edges, C extends boolean = false> {
    compiled: C
    vertices: V;
    edges: E;
    map: C extends true ? Map<V[number]['id'], V[number]> : never
    adjacencyList: C extends true ? Map<V[number]['id'], V[number]['id'][]> : never

    constructor(vertices: V = [] as unknown as V, edges: E = [] as unknown as E) {
        this.vertices = vertices
        this.edges = edges
        this.compiled = false as C
        this.map = {get() {throw new Error('No Map')}} as never
        this.adjacencyList = {get() {throw new Error('No Adjacency List')}} as never
    }

    toString() {
      return `Vertices: ${this.vertices.map(v=>`${v.id} - p${v.player}`)} Edges: ${this.edges.map(e=> `${e[0]} -> ${e[1]}`)}`
    }

    /** returns new arena with the new vertex */
    add<NewV extends Vertex<Data>>(newVertex: NewV) {
      if (this.compiled) throw new Error('already compiled')
      if (this.vertices.find(v=>v.id === newVertex.id)) throw new Error('Vertex already exists')

      const ret = new Arena<Data, [...V, NewV], E>([...this.vertices, newVertex], this.edges)
      return ret
    }

    /** returns new arena with a new p0 vertex */
    addP0<NewV extends string>(newVertex:NewV) {
      return this.add({id: newVertex, player:0})
    }

    /** returns new arena with a new p1 vertex */
    addP1<NewV extends string>(newVertex:NewV) {
      return this.add({id: newVertex, player:1})
    }

    /** returns new arean with a new edge */
    addEdge<NewE extends [V[number]['id'], V[number]['id']]>(...newEdge: NewE): Arena<Data, V, [...E, NewE]> {
      if (this.compiled) throw new Error('already compiled')

      const [from, to] = newEdge;
      if (!this.vertices.some(v => v.id === from) || !this.vertices.some(v => v.id === to)) {
        throw new Error(`Cannot add edge ${from} → ${to}: One or both vertices do not exist`);
      }
      
      return new Arena<Data, V, [...E, NewE]>(this.vertices, [...this.edges, [...newEdge]]);
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
      return ret;
    }

    /** get a vertex of the arena */
    get<Vert extends V[number]['id']>(vertex: Vert):SpecificVertexOf<Vert, V> {
      return (this.map?.get(vertex) ?? this.vertices.find(v => v.id === vertex)) as SpecificVertexOf<Vert, V>;
    }

    /** limits arena to a subset of vertex. returns new arena */
    subArena<NewVert extends ReadonlyArray<V[number]['id']>>(newV: NewVert): Arena<Data, SpecificVerticesOf<NewVert, V>, EdgesThatStartAndEndAtVertices<NewVert, E>, true> {
      const newVertices = this.vertices.filter(v=>newV.includes(v.id)) as SpecificVerticesOf<NewVert, V>
      const newEdges = this.edges.filter(e=>newV.includes(e[0]) && newV.includes(e[1])) as EdgesThatStartAndEndAtVertices<NewVert, E>

      const ret = new Arena(newVertices, newEdges).compile()

      // some new Vertex doesnt have a successor
      if (newV.some(v=>ret.getNeighbors(v).length === 0)) throw new Error('Invalid sub-arena')

      return ret
    }

}

export type NeighborsOf<
  V extends VertexId,
  Vertices extends readonly Vertex[],
  Edges_ extends Edges
> =
  V extends Vertices[number]['id'] // Ensure Vertex exists in Vertices
    ? Edges_ extends [[infer Source extends string, infer Target extends string], ...infer Rest extends Edges]
      ? V extends Source
        ? [Target, ...NeighborsOf<V, Vertices, Rest>]
        : NeighborsOf<V, Vertices, Rest>
      : [] // If no more edges, return an empty array
    : never;


type SpecificVertexOf<
  V extends string,
  Vertices extends readonly Vertex[]> = 
  Vertices extends [infer First, ...infer Rest]  
  ? First extends Vertex ? 
  V extends First['id'] ? First : 
  Rest extends readonly Vertex[] ?
  SpecificVertexOf<V, Rest> 
  : never
  : never
  : never 


type SpecificVerticesOf<
  V extends VertexIds,
  Vertices extends readonly Vertex[]> = 
  V extends [infer First, ...infer Rest]  
  ? First extends string ? 
  (
  Rest extends VertexIds ?
  [SpecificVertexOf<First, Vertices>, ...SpecificVerticesOf<Rest, Vertices>] : 
  [SpecificVertexOf<First, Vertices>])
  : readonly []
  : readonly []


type EdgesThatContainVertex<
  V extends string,
  Edges_ extends Edges,
  Position extends 0 | 1
  > = 
  Edges_ extends [infer First, ...infer Rest]  
  ? First extends [string, string] ? 
  V extends First[Position] ?
  Rest extends Edges ?
  [First, ...EdgesThatContainVertex<V,Rest, Position>] 
  : [First] 
  : Rest extends Edges ?
  [...EdgesThatContainVertex<V,Rest, Position>] 
  : readonly [] 
  : readonly [] 
  : readonly [] 


type EdgesThatContainVertices<
  V extends VertexIds,
  Edges_ extends Edges,
  Position extends 0 | 1
  > = 
  V extends [infer First, ...infer Rest] ?
  First extends string ? 
  Rest extends VertexIds ? 
  [...EdgesThatContainVertex<First,Edges_,Position>, ...EdgesThatContainVertices<Rest, Edges_, Position>]
  : [...EdgesThatContainVertex<First,Edges_,Position>]
  : readonly []
  : readonly []

type EdgesThatStartAndEndAtVertices<V extends VertexIds, Edges_ extends Edges> = 
    EdgesThatContainVertices<V, EdgesThatContainVertices<V, Edges_, 1>, 0>


const a = new Arena().addP0('q1').addP1('q2').addEdge("q1","q2").addP0('q3').addEdge("q2","q1").addEdge("q2","q3").addEdge("q3","q1").compile()



const aNeighbors = a.getNeighbors('q2')

type h = SpecificVerticesOf<['q1', 'q2'], typeof a.vertices>
//   ^?
type hh = EdgesThatStartAndEndAtVertices<['q1', 'q2'], typeof a.edges>
//   ^?

type xxx = EdgesThatContainVertex<'q2', typeof a.edges, 0>
//   ^?
type xxxx = EdgesThatContainVertex<'q2', typeof a.edges, 1>
//   ^?

type hhh = EdgesThatContainVertices<['q1', 'q2'], typeof a.edges, 0>
//   ^?
type hhhh = EdgesThatContainVertices<['q1', 'q2'], typeof a.edges, 1>
//   ^?


const subArena = a.subArena<['q1','q2']>(['q1','q2'])
const subArena2 = a.subArena(['q1','q2'] as const)