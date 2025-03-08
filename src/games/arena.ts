type Vertex = {v: string, p: 0|1}

class Arena<V extends readonly Vertex[] = [], E extends readonly [string, string][] = [], C extends boolean = false> {
    compiled: C
    vertices: V;
    edges: E;
    constructor(vertices: V = [] as unknown as V, edges: E = [] as unknown as E) {
        this.vertices = vertices
        this.edges = edges
        this.compiled = false as C
    }

    add<NewV extends Vertex>(newVertex: NewV) {
      if (this.compiled) throw new Error('already compiled')
        const ret = new Arena<[...V, NewV], E>([...this.vertices, newVertex], this.edges)
        return ret
    }

    addP0<NewV extends string>(newVertex:NewV) {
      return this.add({v: newVertex, p:0})
    }

    addP1<NewV extends string>(newVertex:NewV) {
      return this.add({v: newVertex, p:1})
    }

    addEdge<NewE extends [V[number]['v'], V[number]['v']]>(...newEdge: NewE): Arena<V, [...E, NewE]> {
      if (this.compiled) throw new Error('already compiled')
        const ret = new Arena<V, [...E, NewE]>(this.vertices, [...this.edges, [...newEdge]])
        return ret
    }

    getNeighbors<Vert extends V[number]['v']>(vertex: Vert): NeighborsOf<Vert, V, E> {
        return this.edges.filter(e => e[0] === vertex).map(e => e[1]) as NeighborsOf<Vert, V, E>
    }

    map: C extends true ? Map<V[number]['v'], V[number]> : never

    _setMap(m: typeof this.map) {
      this.map = m
    }

    compile() {
      this.compiled = true as C
      const map = new Map<V[number]['v'], V[number]>(this.vertices.map(v=>[v.v, v]))

      const ret = (this as Arena<V, E, true>)
      ret._setMap(map)

      return ret
    }

    get<Vert extends V[number]['v']>(vertex: Vert):SpecificVertexOf<Vert, V> {
      if (!this.compiled){
        return this.vertices.find(v=>v.v === vertex) as SpecificVertexOf<Vert, V>
      }
      
      return this.map.get(vertex) as SpecificVertexOf<Vert, V>
    }

    subArena<NewVert extends readonly V[number]['v'][]>(newV: NewVert): Arena<SpecificVerticesOf<NewVert, V>, EdgesThatStartAndEndAtVertices<NewVert, E>, true> {
      const newVertices = this.vertices.filter(v=>newV.includes(v.v)) as SpecificVerticesOf<NewVert, V>
      const newEdges = this.edges.filter(e=>newV.includes(e[0]) && newV.includes(e[1])) as EdgesThatStartAndEndAtVertices<NewVert, E>

      const ret = new Arena(newVertices, newEdges).compile()

      // some new Vertex doesnt have a successor
      if (newV.some(v=>ret.getNeighbors(v).length === 0)) throw new Error('Invalid sub-arena')

      return ret
    }

}

type NeighborsOf<
  V extends string,
  Vertices extends readonly Vertex[],
  Edges extends readonly [string, string][]
> =
  V extends Vertices[number]['v'] // Ensure Vertex exists in Vertices
    ? Edges extends [[infer Source extends string, infer Target extends string], ...infer Rest extends [string, string][]]
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
  V extends First['v'] ? First : 
  Rest extends readonly Vertex[] ?
  SpecificVertexOf<V, Rest> 
  : never
  : never
  : never 


type SpecificVerticesOf<
  V extends readonly string[],
  Vertices extends readonly Vertex[]> = 
  V extends [infer First, ...infer Rest]  
  ? First extends string ? 
  (
  Rest extends readonly string[] ?
  [SpecificVertexOf<First, Vertices>, ...SpecificVerticesOf<Rest, Vertices>] : 
  [SpecificVertexOf<First, Vertices>])
  : readonly []
  : readonly []


type EdgesThatContainVertex<
  V extends string,
  Edges extends readonly [string,string][],
  Position extends 0 | 1
  > = 
  Edges extends [infer First, ...infer Rest]  
  ? First extends [string, string] ? 
  V extends First[Position] ?
  Rest extends [string, string][] ?
  [First, ...EdgesThatContainVertex<V,Rest, Position>] :
  [First] 
  : readonly [] 
  : readonly [] 
  : readonly [] 


type EdgesThatContainVertices<
  V extends readonly string[],
  Edges extends readonly [string,string][],
  Position extends 0 | 1
  > = 
  V extends [infer First, ...infer Rest] ?
  First extends string ? 
  Rest extends string[] ? 
  [...EdgesThatContainVertex<First,Edges,Position>, ...EdgesThatContainVertices<Rest, Edges, Position>]
  : [...EdgesThatContainVertex<First,Edges,Position>]
  : readonly []
  : readonly []

type EdgesThatStartAndEndAtVertices<V extends readonly string[], Edges extends readonly [string, string][]> = 
    EdgesThatContainVertices<V, EdgesThatContainVertices<V, Edges, 1>, 0>


const a = new Arena().addP0('q1').addP1('q2').addEdge("q1","q2").addP0('q3').addEdge("q2","q1").addEdge("q2","q3").addEdge("q3","q1").compile()


const aNeighbors = a.getNeighbors('q2')

const subArena = a.subArena(['q1','q2'])