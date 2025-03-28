import { useEffect, useRef } from "react";
import * as vis from "vis-network";
import { GenericArena } from "../games/arena";
import { twMerge } from "tailwind-merge";

export function Graph(props: {
  id: string;
  className?: string;
  nodes: vis.NodeOptions[];
  edges: vis.EdgeOptions[];
}) {
  const { id, className, edges, nodes } = props;
  const graphRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const data = { nodes, edges };
    const options: vis.Options = {};
    const network = new vis.Network(graphRef.current!, data, options);

    return () => {
      network.destroy();
    };
  }, [edges, nodes]);

  return <div ref={graphRef} id={id} className={className}></div>;
}

type PlayerTheme = Partial<vis.NodeOptions>;

type ArenaTheme = {
  player0: PlayerTheme;
  player1: PlayerTheme;
};

export function ArenaGraph(props: {
  arena: GenericArena;
  className?: string;
  options?: ArenaTheme;
}) {
  const {
    arena,
    className,
    options = {
      player0: { color: "oklch(0.715 0.143 215.221)", shape: "circle" },
      player1: {
        color: "oklch(0.508 0.118 165.612)",
        shape: "box",
      },
    },
  } = props;

  return (
    <Graph
      id="graph"
      className={twMerge("h-full", className)}
      nodes={arena.vertices.map((v) => ({
        id: v.id,
        title: v.id,
        fixed: false,
        label: v.id,
        ...options[`player${v.player}`],
      }))}
      edges={arena.edges.map(([from, to]) => ({
        id: `${from}-${to}`,
        from,
        to,
        arrows: "to",
      }))}
    />
  );
}
