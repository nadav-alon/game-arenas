import { useEffect, useRef } from "react";
import { VisEdge, VisNode } from "vis-network/declarations/network/gephiParser";
import * as vis from "vis-network";
import { GenericArena } from "../games/arena";

export function Graph(props: {
  id: string;
  className?: string;
  nodes: VisNode[];
  edges: VisEdge[];
}) {
  const { id, className, edges, nodes } = props;
  const graphRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const data = { nodes, edges };
    const options = {};
    const network = new vis.Network(graphRef.current!, data, options);

    return () => {
      network.destroy();
    };
  }, [edges, nodes]);

  return <div ref={graphRef} id={id} className={className}></div>;
}

export function ArenaGraph(props: { arena: GenericArena }) {
  const { arena } = props;

  return (
    <Graph
      className="h-full"
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
    />
  );
}
