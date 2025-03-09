import { Vertex as VertexType } from "./games/arena";
import {twMerge} from 'tailwind-merge'

const btnClass = ''

export function Vertex(props:{vertex: VertexType}) {
    const {vertex : {p: player, v: name}} = props
    return <div className={twMerge("rounded", '')}> {name} </div>
}


export default Vertex