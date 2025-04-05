import { Vertex, Edges, Arena, Player } from "./arena";
import { Game } from "./game";
import { generateStrategyFromHistory, loopStates } from "./game-types/utils";

type ParityData = { color: number; };

export const createParityGame = (v: Vertex<ParityData>[], e: Edges) => {
    const arena = new Arena<ParityData, Vertex<ParityData>[], Edges>(v, e).compile();

    function winCondition<G extends Game<ParityData, Vertex<ParityData>[]>>(this: G, h: typeof this.history) {
        const strategy = generateStrategyFromHistory(h);
        const loop = loopStates<ParityData, G>(this, strategy);

        return Math.min(...loop.map(s => s.data?.color ?? Infinity)) % 2 as Player;
    }

    const game = new Game<ParityData, Vertex<ParityData>[]>(arena,
        v[0].id
    );
    game.winCondition = winCondition;

    return game;
};
