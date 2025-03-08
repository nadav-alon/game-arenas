class Arena<Vertex extends string = never, Edge extends [Vertex, Vertex] = never> {
    vertices: Vertex[];
    edges: Edge[];
    constructor(){
        this.vertices = []
        this.edges = []
    }

    add<NewV extends string>(newVertex:NewV) : Arena<Vertex | NewV, Edge> {
        const ret = new Arena< Vertex | NewV, Edge>()
        ret.vertices = [...this.vertices, newVertex] as (Vertex | NewV)[]
        ret.edges = [...this.edges] 
        return ret
    }

    addEdge<NewE extends [Vertex, Vertex]>(newEdge: NewE) : Arena<Vertex, Edge | NewE> {
        const ret = new Arena< Vertex , Edge| NewE>()
        ret.vertices = [...this.vertices]
        ret.edges = [...this.edges, newEdge] as (Edge | NewE)[]
        return ret
    }

}


const hello = new Arena().add('q1').add('q2').addEdge(['q1','q2']).addEdge(["q1",'q1'])

const x = hello.edges[0][0]
