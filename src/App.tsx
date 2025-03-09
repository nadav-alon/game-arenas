import { useState } from 'react'
import './App.css'
import { Arena } from './games/arena'

function App() {
  const [arena, setArena] = useState(new Arena())

  return (
    <>
      <form action={(v) => {
          setArena(prev => {
            const vertexName = v.get('vertex')
            const player = Number(v.get('player'))
            if (![0,1].includes(player)) {
              console.error('Player is either 0 or 1');
              return prev
            }
            try {
              const newArena = prev.add({v:vertexName, p:player})
              return newArena
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
            const v1 = v.get('v1')
            const v2 = v.get('v2')
            
            if (!arena.get(v1)) {
              console.error(`Option ${v1} is not in the arean`);
              return prev
            }
            if (!arena.get(v2)) {
              console.error(`Option ${v2} is not in the arean`);
              return prev
            }
            
            try {
              const newArena = prev.addEdge(v1, v2)
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
      <div className='bg-red-500'>
        {'hello '}
        {arena.toString()}
      </div>
    </>
  )
}

export default App
