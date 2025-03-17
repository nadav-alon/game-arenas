import {
  CSSProperties,
  MouseEventHandler,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import "./App.css";
import { Arena, Vertex } from "./games/arena";
import { z } from "zod";
import VertexComponent from "./vertex";
import Xarrow from "react-xarrows";
import { Graph } from "./vis-network/graph";

const vertexSchema = z.object({
  id: z.string(),
  player: z.union([z.literal(0), z.literal(1)]),
});

const edgeSchema = z.tuple([z.string(), z.string()]);

function App() {
  const [arena, setArena] = useState(
    new Arena<unknown, Vertex<unknown>[], [string, string][]>(),
  );

  return (
    <>
      <ArenaForm finish={setArena}></ArenaForm>
      <div className="bg-red-500">
        {"hello "}
        {arena.toString()}
      </div>
      <Graph
        id="graph"
        nodes={arena.vertices.map((v) => ({
          id: v.id,
          title: v.id,
          fixed: false,
          label: v.id,
        }))}
        edges={arena.edges.map(([from, to]) => ({
          id: `${from}-${to}`,
          from,
          to,
          arrows: "to",
        }))}
      ></Graph>
    </>
  );
}

function ArenaForm(props: {
  finish: (
    completeArena: Arena<unknown, Vertex<unknown>[], [string, string][]>,
  ) => void;
}) {
  const [arena, setArena] = useState(
    new Arena<unknown, Vertex<unknown>[], [string, string][]>(),
  );

  return (
    <div className="flex flex-col">
      <form
        action={(form) => {
          setArena((prev) => {
            const formVertex = {
              player: Number(form.get("player")),
              id: form.get("vertex"),
            };
            const parsed = vertexSchema.parse(formVertex);

            try {
              const newArena = prev.add(parsed as Vertex<unknown>);
              return newArena as unknown as typeof arena;
            } catch (e) {
              console.error(e);
              return prev;
            }
          });
        }}
      >
        <input
          type="text"
          name="vertex"
          className="border border-white rounded"
        />
        <select name="player" className="border border-white rounded">
          <option>0</option>
          <option>1</option>
        </select>
        <button type="submit" className="bg-blue-500 rounded">
          {" "}
          submit{" "}
        </button>
      </form>
      <form
        action={(v) => {
          setArena((prev) => {
            const edge = [v.get("v1"), v.get("v2")];

            const parsedEdge = edgeSchema.parse(edge);

            try {
              const newArena = prev.addEdge(...parsedEdge);
              return newArena;
            } catch (e) {
              console.error(e);
              return prev;
            }
          });
        }}
      >
        <select name="v1" className="border border-white rounded">
          {arena.vertices.map((v) => (
            <option key={v.id}>{v.id}</option>
          ))}
        </select>
        <select name="v2" className="border border-white rounded">
          {arena.vertices.map((v) => (
            <option key={v.id}>{v.id}</option>
          ))}
        </select>
        <button type="submit" className="bg-blue-500 rounded">
          {" "}
          submit{" "}
        </button>
      </form>
      <button
        type="button"
        className="bg-red-500 rounded"
        onClick={() => props.finish(arena)}
      >
        {" "}
        finish{" "}
      </button>
      Preview:
      <ArenaPreview arena={arena} />
    </div>
  );
}

function ArenaPreview(props: { arena: Arena }) {
  const { arena } = props;
  const { vertices, edges } = arena;

  const verticesRefs = useRef<
    Record<(typeof vertices)[number]["id"], { current: HTMLDivElement | null }>
  >({});

  const [pinged, setPinged] = useState(
    edges.map((e) => ({ e, ping: new Date() })),
  );

  useEffect(() => {
    setPinged(edges.map((e) => ({ e, ping: new Date() })));
  }, [edges]);

  return (
    <div className="">
      {vertices.map((v) => (
        <DraggableVertex
          key={v.id}
          verticesRefs={verticesRefs}
          vertex={v}
          ping={(v) => {
            setPinged((prev) => {
              return prev.map(({ e, ping: prevPing }) => {
                if (e.includes(v.id)) return { e, ping: new Date() };
                return { e, ping: prevPing };
              });
            });
          }}
        />
      ))}

      {edges.map(([v1, v2], i) => {
        const ref1 = verticesRefs.current[v1];
        const ref2 = verticesRefs.current[v2];
        if (!ref1 || !ref2) return null;

        return (
          <Xarrow
            key={`${v1}${v2}${pinged[i]?.ping.getTime()}`}
            start={ref1}
            end={ref2}
          />
        );
      })}
    </div>
  );
}

function useDragMousePosition() {
  const [wasDragged, setWasDragged] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [pos, setPos] = useState({ x: NaN, y: NaN });

  const style = useMemo<CSSProperties>(
    () =>
      wasDragged
        ? { position: "absolute", left: pos.x, top: pos.y, cursor: "grab" }
        : { cursor: "grab" },
    [wasDragged, pos],
  );

  const onMouseDown: MouseEventHandler<HTMLDivElement> = (_e) => {
    setWasDragged(true);
    setDragging(true);
  };

  const onMouseMove: MouseEventHandler<HTMLDivElement> = (e) => {
    if (dragging) {
      console.log("aaa", e);

      setPos({ x: e.clientX - 50, y: e.clientY - 50 }); // Center the box
    }
  };

  const onMouseUp: MouseEventHandler<HTMLDivElement> = (_e) => {
    setDragging(false);
  };

  return { style, onMouseDown, onMouseMove, onMouseUp };
}

function DraggableVertex(props: {
  vertex: Vertex;
  verticesRefs: React.RefObject<
    Record<
      string,
      {
        current: HTMLDivElement | null;
      }
    >
  >;
  ping?: (v: Vertex) => void;
}) {
  const { vertex, ping, verticesRefs } = props;
  const { onMouseMove, ...dragProps } = useDragMousePosition();

  const wrappedOnMouseMove: typeof onMouseMove = (e) => {
    onMouseMove(e);
    ping?.(vertex);
  };

  return (
    <div
      className="m-5 w-fit bg-white"
      {...dragProps}
      onMouseMove={wrappedOnMouseMove}
      ref={(el) => {
        verticesRefs.current[vertex.id] = { current: el };
      }}
    >
      <VertexComponent className="m-5" vertex={vertex} />
    </div>
  );
}

export default App;
