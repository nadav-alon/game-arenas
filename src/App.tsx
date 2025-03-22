import {
  CSSProperties,
  MouseEventHandler,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import "./App.css";
import {
  Arena,
  GenericArena,
  GenericCompiledArena,
  Vertex,
} from "./games/arena";
import { z, ZodFormattedError } from "zod";
import VertexComponent from "./vertex";
import Xarrow from "react-xarrows";
import { Graph } from "./vis-network/graph";

const edgeSchema = z.tuple([z.string(), z.string()]);

function App() {
  const [arena, setArena] = useState<GenericCompiledArena>(new Arena());

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
  finish: (completeArena: GenericCompiledArena) => void;
}) {
  const [arena, setArena] = useState<GenericArena>(new Arena());

  return (
    <div className="p-5 flex flex-col">
      <VertexForm setArena={setArena} arena={arena} />
      <EdgeForm setArena={setArena} arena={arena} />
      <button
        type="button"
        className="bg-red-500 rounded"
        onClick={() => props.finish(arena.compile())}
      >
        Finish Arena
      </button>
      Preview:
      <ArenaPreview arena={arena} />
    </div>
  );
}

function EdgeForm(props: {
  setArena: (value: React.SetStateAction<GenericArena>) => void;
  arena: GenericArena;
}) {
  const { arena, setArena } = props;
  return arena.vertices.length == 0 ? (
    <div>No vertices to connect</div>
  ) : (
    <form
      className="flex flex-col gap-2"
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
      <div className="flex gap-2">
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
      </div>
      <button type="submit" className="bg-blue-500 rounded">
        Add Edge
      </button>
    </form>
  );
}

function VertexForm(props: {
  setArena: (value: React.SetStateAction<GenericArena>) => void;
  arena: GenericArena;
}) {
  const { setArena, arena } = props;

  const vertexSchema = useMemo(
    () =>
      z
        .object({
          id: z
            .string()
            .min(1, "Required")
            .refine((val) => !Boolean(arena.get(val)), "Choose another name"),
          player: z.union([z.literal(0), z.literal(1)]),
        })
        .refine((data) => {
          console.log({ data });
          return true;
        }),
    [arena],
  );

  const [error, setError] = useState<
    ZodFormattedError<z.infer<typeof vertexSchema>> | undefined
  >();

  return (
    <form
      className="flex-col flex gap-2"
      action={(form) => {
        setArena((prev) => {
          const formVertex = {
            player: Number(form.get("submit")),
            id: form.get("vertex"),
          };
          const parsed = vertexSchema.safeParse(formVertex);

          try {
            if (parsed.success) {
              const newArena = prev.add(parsed.data);
              setError(undefined);
              return newArena;
            } else {
              setError(parsed.error.format());
              return prev;
            }
          } catch (e) {
            console.error(e);
            return prev;
          }
        });
      }}
    >
      <label htmlFor="vertex">Add Vertex to arena:</label>
      <input
        type="text"
        name="vertex"
        id="vertex"
        className="border border-white rounded"
      />
      <Errors errors={error?.id?._errors} />
      <div className="flex gap-1">
        <button type="submit" name="submit" value="0">
          Add Player 0 Vertex
        </button>
        <button type="submit" name="submit" value="1">
          Add Player 1 Vertex
        </button>
      </div>
      <Errors errors={error?._errors} />
    </form>
  );
}

function Errors(props: { errors?: string[] }) {
  const { errors } = props;
  return (
    <div className="min-h-4 text-red-300">
      {errors ? errors.join(", ") : null}
    </div>
  );
}

function ArenaPreview(props: { arena: GenericArena }) {
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
