import { useEffect, useRef } from "react"
import vis from "vis-network/declarations/index-legacy-bundle"
import { VisEdge, VisNode } from "vis-network/declarations/network/gephiParser"

export function Graph(props:{id:string, className:string, nodes: VisNode[], edges: VisEdge[]}) {
    const {id, className, edges, nodes} = props
    const graphRef = useRef<HTMLDivElement>(null)

    useEffect(()=>{
        const data = {nodes, edges}
        const options = {}
        const network = new vis.Network(graphRef.current!,  data, options)

        return ()=>{
            network.destroy()
        }
    }, [edges, nodes])

    return <div ref={graphRef} id={id} className={className}></div>

}