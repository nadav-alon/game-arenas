import { Vertex, Edges, Arena } from "../arena";
import { Game } from "../game";

export type ReachabilityData = { accepting: boolean; };
type ReachabilityGame = Game<ReachabilityData, Vertex<ReachabilityData>[]>;
export const createReachabilityGame = (v: Vertex<ReachabilityData>[], e: Edges): ReachabilityGame => {
    const arena = new Arena<ReachabilityData, Vertex<ReachabilityData>[], Edges>(v, e).compile();

    const game = new Game<ReachabilityData, Vertex<ReachabilityData>[]>(arena, v[0].id);

    game.winCondition = (h) => h.some(s => s.player === 0) ? 0 : 1;

    return game;
};

