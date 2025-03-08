
class Arena<V extends readonly string[] = [], E extends readonly [string, string][] = []> {
    vertices: V;
    edges: E;
    player: Map<V[number], 0|1>
    // constructor(vertices: Vertex = [] as unknown as Vertex, edges: Edge = [] as unknown as Edge) {
    //     this.vertices = vertices
    //     this.edges = edges
    // }
    constructor(vertices: V = [] as unknown as V, edges: E = [] as unknown as E) {
        this.vertices = vertices
        this.edges = edges
    }

    add<NewV extends string>(newVertex: NewV) {
        const ret = new Arena<[...V, NewV], E>([...this.vertices, newVertex], this.edges)
        return ret
    }

    addEdge<NewE extends [V[number], V[number]]>(...newEdge: NewE): Arena<V, [...E, NewE]> {
        const ret = new Arena<V, [...E, NewE]>(this.vertices, [...this.edges, [...newEdge]])
        return ret
    }

    getNeighbors<Vert extends V[number]>(vertex: Vert): NeighborsOf<Vert, V, E> {
        return this.edges.filter(e => e[0] === vertex).map(e => e[1]) as NeighborsOf<typeof vertex, V, E>
    }
}

type NeighborsOf<
  Vertex extends string,
  Vertices extends readonly string[],
  Edges extends readonly [string, string][]
> =
  Vertex extends Vertices[number] // Ensure Vertex exists in Vertices
    ? Edges extends [[infer Source extends string, infer Target extends string], ...infer Rest extends [string, string][]]
      ? Vertex extends Source
        ? [Target, ...NeighborsOf<Vertex, Vertices, Rest>]
        : NeighborsOf<Vertex, Vertices, Rest>
      : [] // If no more edges, return an empty array
    : never;



const hello = new Arena().add('q1').add('q2').addEdge("q1", "q2").addEdge("q1", 'q1').addEdge('q2', 'q2')

const x = hello.getNeighbors('q2')
