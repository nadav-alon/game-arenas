import { Vertex as VertexType } from "./games/arena";
import { twMerge } from 'tailwind-merge'

const p0Class = 'rounded-4xl'
const p1Class = ''

export function Vertex(props: { vertex: VertexType, onClick: () => void }) {
    const { onClick, vertex: { p: player, v: name } } = props
    return <button type='button'
            onClick={onClick}
            className={twMerge("rounded cursor-pointer", player === 0 ? p0Class : p1Class)}>
            {name}
        </button>
}


export default Vertex