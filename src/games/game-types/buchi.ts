import { Vertex, Edges, Arena } from "../arena";
import { Game } from "../game";
import { ReachabilityData } from "./reachability";
import { generateStrategyFromHistory, loopStates } from "./utils";



export const createBuchiGame = (v: Vertex<ReachabilityData>[], e: Edges) => {
    const arena = new Arena<ReachabilityData, Vertex<ReachabilityData>[], Edges>(v, e).compile();

    function winCondition<G extends Game<ReachabilityData, Vertex<ReachabilityData>[]>>(this: G, h: typeof this.history) {
        const strategy = generateStrategyFromHistory(h);
        const loop = loopStates<ReachabilityData, G>(this, strategy);

        return loop.some(s => s.data?.accepting) ? 0 : 1;
    }

    const game = new Game<ReachabilityData, Vertex<ReachabilityData>[]>(arena,
        v[0].id
    );
    game.winCondition = winCondition;

    return game;

};
