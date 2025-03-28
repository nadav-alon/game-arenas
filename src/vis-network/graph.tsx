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

export function ArenaGraph(props: { arena: GenericArena; className?: string }) {
  const { arena, className } = props;

  return (
    <Graph
      id="graph"
      className={twMerge("h-full", className)}
      nodes={arena.vertices.map((v) => ({
        id: v.id,
        title: v.id,
        fixed: false,
        label: v.id,
        shape: v.player === 0 ? "circle" : "box",
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
