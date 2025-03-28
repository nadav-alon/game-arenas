import React, { ComponentProps, useMemo, useState } from "react";
import "./App.css";
import { Arena, GenericArena, GenericCompiledArena } from "./games/arena";
import { z, ZodFormattedError } from "zod";
import { ArenaGraph } from "./vis-network/graph";
import { twMerge } from "tailwind-merge";

const edgeSchema = z.tuple([z.string(), z.string()]);

function App() {
  const [arena, setArena] = useState<GenericCompiledArena>(new Arena());

  return (
    <div className="h-screen w-screen p-5">
      {!arena.compiled ? (
        <ArenaForm finish={setArena}></ArenaForm>
      ) : (
        <ArenaGraph arena={arena} />
      )}
    </div>
  );
}

function ArenaForm(props: {
  finish: (completeArena: GenericCompiledArena) => void;
}) {
  const [arena, setArena] = useState<GenericArena>(new Arena());

  return (
    <div className="flex w-full h-full">
      <div className="p-5 flex flex-col gap-2 h-full">
        <VertexForm key="vertex-form" setArena={setArena} arena={arena} />
        <EdgeForm key="edge-form" setArena={setArena} arena={arena} />
        <button
          type="button"
          className="bg-blue-500! hover:bg-blue-600!"
          onClick={() => props.finish(arena.compile())}
        >
          Finish Arena
        </button>
      </div>
      <div className="flex-grow flex flex-col">
        Preview:
        <div className="flex-grow-2 border-4 border-blue-900 rounded-2xl">
          <ArenaGraph arena={arena} />
        </div>
      </div>
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
    <label htmlFor="edge-form" className="flex flex-col gap-2">
      Add Edge to arena
      <form
        id="edge-form"
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
          <VertexSelect arena={arena} name="v1" />
          <div className="flex-1 text-center">{"------------------>"}</div>
          <VertexSelect arena={arena} name="v2" />
        </div>
        <button type="submit" className="bg-blue-500 rounded">
          Add Edge
        </button>
      </form>
    </label>
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

  const [isChildOf, setIsChildOf] = useState(false);
  const [chosenParent, setChosenParent] = useState<string>();
  const [lastSubmit, setLastSubmit] = useState(new Date().getTime());

  const formAction = (form: FormData) => {
    setLastSubmit(new Date().getTime());
    const formVertex = {
      player: Number(form.get("submit")),
      id: form.get("vertex"),
    };

    const parsed = vertexSchema.safeParse(formVertex);

    try {
      if (parsed.success) {
        let newArena = arena.add(parsed.data);
        setError(undefined);
        const parent = form.get("parent");

        if (parent && typeof parent === "string")
          newArena = newArena.addEdge(parent, parsed.data.id);

        setArena(newArena);
      } else {
        setError(parsed.error.format());
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <form className="flex-col flex gap-2" action={formAction} key={lastSubmit}>
      <label htmlFor="vertex" className="flex gap-1">
        Add Vertex to arena:
        <input
          type="text"
          name="vertex"
          key="vertex"
          id="vertex"
          className="border border-white rounded"
        />
      </label>
      <Errors errors={error?.id?._errors} />
      <div className="flex gap-1">
        <button type="submit" name="submit" value="0">
          Add Player 0 Vertex
        </button>
        <button type="submit" name="submit" value="1">
          Add Player 1 Vertex
        </button>
      </div>

      {arena.vertices.length > 0 ? (
        <>
          <label className="flex gap-2" htmlFor="childOf">
            Is child of:
            <input
              key={isChildOf ? "checked" : "unchecked"}
              id="childOf"
              type="checkbox"
              checked={isChildOf}
              onChange={(e) => {
                setIsChildOf(e.target.checked);
              }}
            />
            {isChildOf && (
              <VertexSelect
                key={chosenParent ?? "unchosen"}
                arena={arena}
                onChange={(v) => {
                  setChosenParent(v.target.value);
                }}
                name="parent"
                value={chosenParent}
              />
            )}
          </label>
        </>
      ) : null}
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

function VertexSelect(props: {
  arena: GenericArena;
  name: string;
  value?: string;
  onChange?: ComponentProps<"select">["onChange"];
  className?: string;
}) {
  const { arena, name, onChange, className, value: value } = props;

  return (
    <select
      key={value ?? "unchosen"}
      name={name}
      id={name}
      value={value}
      onChange={onChange}
      className={twMerge("border border-white rounded", className)}
    >
      {arena.vertices.map((v) => (
        <option key={v.id}>{v.id}</option>
      ))}
    </select>
  );
}

export default App;
