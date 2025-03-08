# Game Arenas

A demo to demonstrate the theoretical concept of [Games](https://en.wikipedia.org/wiki/Parity_game).
It mostly exists for me to practice the concept and try to gain a better intuition, as well as to try to visualize them.


## What are games?

Games are computational object that allow 2 participants to participate in a match, in which there is a winner.
They are used to model reactive systems and other similar multi-agent activities. The games are infinite, which means they can model systems that dont nessecerily terminate.

## Definitions

### Arena
Arenas are graphs that are seperated to 2 disjoint groups of vertices, $V_1, V_2$ such that $V_1 \cup V_2 = V$

$V_0$ are the vertices of player 0 and $V_1$ are the vertices of player 1, i.e. they are the ones whos move it is when the game is at that state.

The game proceeds like an automaton, with each player deciding their moves, and trying to win based on their winning conditions

Code defined in [here](src/games/arena.ts)

A sub-arena $A|V'$ of $A$ is the arena defined by restricting $A$ to vertices in $V'$. It is only valid if every vertex in $V'$ has a successor vertex in $V'$.

### Play
A 'play' in the game of an arena is an infinite sequence of vertices, such that each subsequent vertex is a successor of the previous according to the arena.

More formally:

$p = p_{0}p_{1}...\in V^{\omega}$

$(p_n, p_{n+1}) \in E \text{ for every } n \in \N$


Of course in my implementation a play will be finite, and i choose an arbitrary number of steps for a play to end.

### Conditions
### Strategies
#### Positional Strategies
### Types of games
#### Reachability and Safety
#### Buchi and co-Buchi
#### Parity
### Solving games
#### Attractors