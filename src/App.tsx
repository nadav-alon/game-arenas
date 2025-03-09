import { useState } from 'react'
import './App.css'
import { Arena, Vertex } from './games/arena'
import { z } from 'zod'

const vertexSchema = z.object({
  v: z.string(),
  p: z.union([z.literal(0),z.literal(1)])
})

const edgeSchema = z.tuple([ z.string(),z.string() ])

function App() {
  const [arena, setArena] = useState(new Arena<any, Vertex<any>[], [string, string][]>())

  return (
    <>
      <ArenaForm finish={setArena}></ArenaForm>
      <div className='bg-red-500'>
        {'hello '}
        {arena.toString()}
      </div>
    </>
  )
}

function ArenaForm(props: {finish: (completeArena: Arena<any, Vertex<any>[], [string, string][]>)=>void}) {
  const [arena, setArena] = useState(new Arena<any, Vertex<any>[], [string, string][]>())

    return <>
      <form action={(form) => {
          setArena(prev => {
            const formVertex = {p:Number(form.get('player')), v: form.get('vertex')}
            const parsed = vertexSchema.parse(formVertex)

            try {
              const newArena = prev.add(parsed as Vertex<any>)
              return newArena as unknown as typeof arena
            }
            catch (e) {
              console.error(e);
              return prev
            }
          })
        }}>
        <input type="text" name='vertex' className='border border-white rounded' />
        <select name='player' className='border border-white rounded'>
          <option>0</option>
          <option>1</option>
        </select>
        <button type='submit' className='bg-blue-500 rounded' > submit </button>
      </form>


      <form action={(v) => {
          setArena(prev => {
            const edge = [ v.get('v1'), v.get('v2')]

            const parsedEdge = edgeSchema.parse(edge)
            
            
            try {
              const newArena = prev.addEdge(...parsedEdge)
              return newArena
            }
            catch (e) {
              console.error(e);
              return prev
            }
          })
        }}>
        <select name='v1' className='border border-white rounded'>
          {arena.vertices.map(v=><option key={v.v}>
            {v.v}
          </option>)}
        </select>
        <select name='v2' className='border border-white rounded'>
          {arena.vertices.map(v=><option key={v.v}>
            {v.v}
          </option>)}
        </select>
        <button type='submit' className='bg-blue-500 rounded' > submit </button>
      </form>

        <button type='button' className='bg-red-500 rounded' onClick={()=>props.finish(arena)}> finish </button>
       </>
}

export default App
