# space-invaders

Inspired by the classic Space Invaders game, with a [genetic algorithm](https://en.wikipedia.org/wiki/Genetic_algorithm).

[>>> PLAY HERE <<<](https://zenoxygen.github.io/space-invaders/)

## The game

You went to explore a planet to extract precious minerals. But on the way back to your base, you have to go through dangerous areas where evil invaders try to take your resources. If 5 invaders successfully reach you, you lose everything !

## Usage

You can play directly by opening the `index.html` file in your favorite web browser.

If you want to compile the project, you have to install the TypeScript compiler. Use npm, type `npm install -g typescript`.

Then, you only need to run `tsc`. The compiler will search for the `tsconfig.json` file that specifies the root files and the compiler options.

## How it works ?

A first population of invaders with random shapes is generated.

The steps for creating a new generation of invaders are:
- select a portion of existing population to breed a new generation
- create a new population by crossing individuals of this selection:
  - 1st half horizontal part of parentA + 2nd half horizontal part of parentB (1/4)
  - 1st half horizontal part of parentB + 2nd half horizontal part of parentA (1/4)
  - 1st half vertical part of parentA + 2nd half vertical part of parentB (1/4)
  - 1st half vertical part of parentB + 2nd half vertical part of parentA (1/4)
- mutate randomly one feature of each invaders of the new population with a rate of 10%

After 7 generations, allow the best invader from past generations to carry over to next generation, unaltered.

## Music

The music is a remixed version of https://soundcloud.com/sovate/sovate-dave-powell-going-on.
