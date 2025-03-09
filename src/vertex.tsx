import { MouseEventHandler } from "react";
import { Vertex as VertexType } from "./games/arena";
import { twMerge } from 'tailwind-merge'

const p0Class = 'rounded-4xl'
const p1Class = ''

export function VertexComponent(props: { vertex: VertexType, className?:string, onClick?:MouseEventHandler<HTMLButtonElement> }) {
    const { onClick, vertex: { p: player, v: name } } = props
    return <button type='button'
            onClick={onClick}
            className={twMerge("rounded ",onClick ? "cursor-pointer" : "cursor-auto", player === 0 ? p0Class : p1Class, props.className)}>
            {name}
        </button>
}


export default VertexComponent