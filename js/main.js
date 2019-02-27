"use strict";
//
// Inspired by the classic Space Invaders game, with a genetic algorithm.
//
// Display settings
var width = 600;
var height = 800;
var nbGenerationsPosX = 5;
var nbGenerationsPosY = 20;
var nbInvadersAliveX = 5;
var nbInvadersAliveY = 40;
var nbLivesPosX = 5;
var nbLivesPosY = height - 10;
var sizeText = 20;
var colorText = '#42AC86';
var colorBackground = '#0D0D0D';
var colorStars = '#FFFFFF';
var colorPlayer = '#8476D4';
var colorInvader = '#24A2A6';
var colorBullet = '#FF4654';
// Star
var Star = /** @class */ (function () {
    function Star(x, y, size, velocity) {
        this.posX = x;
        this.posY = y;
        this.size = size;
        this.velocity = velocity;
    }
    return Star;
}());
// Starfield
var Starfield = /** @class */ (function () {
    function Starfield() {
        this.stars = [];
        this.nbStars = 10;
        this.minVelocity = 5;
        this.maxVelocity = 20;
    }
    // Initialize starfield
    Starfield.prototype.init = function () {
        this.stars = [];
        for (var i = 0; i < this.nbStars; i++) {
            this.stars.push(new Star(Math.random() * width, Math.random() * height, 1 + Math.random(), (Math.random() * (this.maxVelocity - this.minVelocity)) + this.minVelocity));
        }
    };
    // Update starfield
    Starfield.prototype.update = function () {
        for (var i = 0; i < this.stars.length; i++) {
            this.stars[i].posY += this.stars[i].velocity;
            if (this.stars[i].posY > height) {
                this.stars[i] = new Star(Math.random() * width, 0, Math.random() * 3 + 1, (Math.random() * (this.maxVelocity - this.minVelocity)) + this.minVelocity);
            }
        }
    };
    // Draw starfield
    Starfield.prototype.draw = function (game) {
        this.update();
        game.ctx.fillStyle = colorBackground;
        game.ctx.fillRect(0, 0, width, height);
        game.ctx.fillStyle = colorStars;
        for (var i = 0; i < this.stars.length; i++) {
            game.ctx.fillRect(this.stars[i].posX, this.stars[i].posY, this.stars[i].size, this.stars[i].size);
        }
    };
    return Starfield;
}());
// Game
var Game = /** @class */ (function () {
    function Game() {
        this.canvas = document.createElement('Canvas');
        this.canvas.width = width;
        this.canvas.height = height;
        this.ctx = this.canvas.getContext('2d', { alpha: false });
        this.starfield = new Starfield();
        this.player = new Player();
        this.invaders = new Evolution();
        this.nbKill = 0;
        this.timeStart = 0;
        this.timeEnd = 0;
        document.body.appendChild(this.canvas);
        window.addEventListener('keydown', this.onKeyDown.bind(this), false);
        window.addEventListener('keyup', this.onKeyUp.bind(this), false);
    }
    // Start game
    Game.prototype.start = function () {
        this.starfield.init();
        this.invaders.createFirstPopulation();
        this.timeStart = performance.now();
        this.running = true;
        this.loop();
    };
    // Stop game
    Game.prototype.stop = function () {
        this.timeEnd = performance.now();
        this.running = false;
    };
    // Main loop
    Game.prototype.loop = function () {
        // If game if running
        if (this.running == true) {
            // Draw starfield
            this.starfield.draw(this);
            // Draw player
            this.player.draw(this);
            // Draw invaders
            for (var i = 0; i < this.invaders.population.length; i++) {
                this.invaders.population[i].draw(this);
            }
            // Count number of invaders in population
            this.invaders.countPopulation();
            // Check number of invaders alive
            if (this.invaders.nbAlive == 0) {
                // Keep invader with best performance
                this.invaders.keepBestOfGeneration();
                // Check number of generations
                if (this.invaders.nbGenerations % 7 == 0) {
                    // Select elite every 7 generations
                    this.invaders.selectElite();
                }
                else {
                    // Create next generation
                    this.invaders.createNextGeneration();
                }
                this.invaders.nbGenerations++;
            }
            // Display informations
            this.displayInfos();
            // Check if player is alive
            if (this.player.isAlive == false) {
                this.stop();
                this.gameOver();
            }
            // Refresh frame
            requestAnimationFrame(this.loop.bind(this));
        }
    };
    // Display generation, invaders and lives counters
    Game.prototype.displayInfos = function () {
        this.ctx.fillStyle = colorText;
        this.ctx.font = sizeText + 'px ' + 'Arial';
        this.ctx.fillText('Generation: ' + this.invaders.nbGenerations, nbGenerationsPosX, nbGenerationsPosY);
        this.ctx.fillText('Invaders: ' + this.invaders.nbAlive, nbInvadersAliveX, nbInvadersAliveY);
        this.ctx.fillText('Lives: ' + this.player.nbLives, nbLivesPosX, nbLivesPosY);
    };
    // Game over
    Game.prototype.gameOver = function () {
        var timeElapsed = (this.timeEnd - this.timeStart) / 1000;
        var minutesElapsed = Math.floor(timeElapsed / 60);
        var secondsElapsed = Math.floor(timeElapsed % 60);
        var txt1 = 'GAME OVER';
        var txt2 = 'You reached generation ' + this.invaders.nbGenerations;
        var txt3 = 'You killed ' + this.nbKill + ' invaders in ' + minutesElapsed + 'min' + secondsElapsed + 's';
        var txt4 = 'Press <F5> to start playing again';
        this.ctx.fillStyle = colorBackground;
        this.ctx.fillRect(0, 0, width, height);
        this.ctx.fillStyle = colorText;
        this.ctx.fillText(txt1, (width - this.ctx.measureText(txt1).width) / 2, height / 3);
        this.ctx.fillText(txt2, (width - this.ctx.measureText(txt2).width) / 2, (height / 3) + 40);
        this.ctx.fillText(txt3, (width - this.ctx.measureText(txt3).width) / 2, (height / 3) + 80);
        this.ctx.fillText(txt4, (width - this.ctx.measureText(txt4).width) / 2, height - 20);
    };
    // Listen keyboard events on key down
    Game.prototype.onKeyDown = function (event) {
        switch (event.key) {
            case 'ArrowLeft':
                event.preventDefault();
                this.player.startMove('Left');
                break;
            case 'ArrowRight':
                event.preventDefault();
                this.player.startMove('Right');
                break;
            case ' ':
                event.preventDefault();
                this.player.shoot();
                break;
        }
    };
    // Listen keyboard events on key up
    Game.prototype.onKeyUp = function (event) {
        switch (event.key) {
            case 'ArrowLeft':
                event.preventDefault();
                this.player.stopMove('Left');
                break;
            case 'ArrowRight':
                event.preventDefault();
                this.player.stopMove('Right');
                break;
        }
    };
    return Game;
}());
// Player
var Player = /** @class */ (function () {
    function Player() {
        this.shape = [0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 1, 1, 1, 1];
        this.posX = width / 2;
        this.posY = height - this.shape.length * 2;
        this.size = 8;
        this.speed = 8;
        this.nbLives = 5;
        this.isAlive = true;
        this.isShooting = false;
        this.isMovingLeft = false;
        this.isMovingRight = false;
        this.bullet = new Bullet(0, 0);
    }
    // Start move
    Player.prototype.startMove = function (direction) {
        if (direction == 'Left') {
            this.isMovingLeft = true;
        }
        if (direction == 'Right') {
            this.isMovingRight = true;
        }
    };
    // Stop move
    Player.prototype.stopMove = function (direction) {
        if (direction == 'Left') {
            this.isMovingLeft = false;
        }
        if (direction == 'Right') {
            this.isMovingRight = false;
        }
    };
    // Update player and bullet
    Player.prototype.update = function () {
        if (this.nbLives == 0) {
            this.isAlive = false;
        }
        if (this.isMovingLeft == true && this.posX > 0) {
            this.posX -= this.speed;
        }
        if (this.isMovingRight == true && this.posX < width - this.size * (this.shape.length / 4)) {
            this.posX += this.speed;
        }
        if (this.isShooting == true) {
            this.bullet.posY -= this.bullet.speed;
            if (this.bullet.posY < 0) {
                this.isShooting = false;
            }
        }
    };
    // Draw player and bullet
    Player.prototype.draw = function (game) {
        if (this.isAlive == true) {
            this.update();
            game.ctx.fillStyle = colorPlayer;
            for (var i = 0; i < this.shape.length; i++) {
                if (this.shape[i] == 1) {
                    game.ctx.fillRect(this.posX + ((i % 4) * this.size), this.posY + ((i >> 2) * this.size), this.size, this.size);
                }
            }
        }
        if (this.isShooting == true) {
            game.ctx.fillStyle = colorBullet;
            game.ctx.fillRect(this.bullet.posX, this.bullet.posY, this.bullet.size, this.bullet.size);
        }
        else {
            game.player.bullet = new Bullet(0, 0);
        }
    };
    // Shoot a bullet
    Player.prototype.shoot = function () {
        if (this.isShooting == false) {
            this.bullet = new Bullet(this.posX + (this.size * 2), this.posY);
            this.isShooting = true;
        }
    };
    return Player;
}());
// Bullet
var Bullet = /** @class */ (function () {
    function Bullet(x, y) {
        this.posX = x;
        this.posY = y;
        this.size = 8;
        this.speed = 25;
    }
    return Bullet;
}());
// Invader
var Invader = /** @class */ (function () {
    function Invader(shape) {
        this.shape = shape;
        this.direction = Math.random() < 0.5 ? -1 : 1;
        this.posX = width / 2 + (this.direction * width / 4 * Math.random());
        this.posY = -(width / 4) - ((width / 4) * Math.random());
        this.size = 8;
        this.speedX = 1.5;
        this.speedY = 1.5;
        this.fitness = 0;
        this.i = 0;
        this.frame = 0;
        this.maxFrame = 32 + Math.floor((Math.random() * 16));
        this.isAlive = true;
    }
    // Update invader
    Invader.prototype.update = function (game) {
        // Check if invader reach bottom
        if (this.posY > height) {
            this.isAlive = false;
            game.player.nbLives -= 1;
        }
        // Move invader horizontally
        if (this.shape[this.i] == 1) {
            var val = this.direction * this.speedX;
            if (this.posX + val > 0 && (this.posX + val) < width - this.size * (this.shape.length / 4)) {
                this.posX += val;
            }
        }
        // Move invader vertically
        this.posY += this.speedY;
        // Update fitness
        this.fitness = Math.floor(this.posY);
        // Check frame frame counter
        if (this.frame == 0) {
            // Inverse direction
            this.direction = -this.direction;
            // Update shape index counter
            this.i = (this.i + 1) % this.shape.length;
        }
        // Update frame counter
        this.frame = (this.frame + 1) % this.maxFrame;
        // Check collision
        if (Math.sqrt(Math.pow((game.player.bullet.posX - (this.posX + this.shape.length)), 2) + Math.pow((game.player.bullet.posY - (this.posY + this.shape.length)), 2)) < 20) {
            this.isAlive = false;
            game.player.isShooting = false;
            game.nbKill++;
        }
    };
    // Draw invader
    Invader.prototype.draw = function (game) {
        if (this.isAlive == true) {
            this.update(game);
            game.ctx.fillStyle = colorInvader;
            for (var i = 0; i < this.shape.length; i++) {
                if (this.shape[i] == 1) {
                    game.ctx.fillRect(this.posX + ((i % 4) * this.size), this.posY + ((i >> 2) * this.size), this.size, this.size);
                }
            }
        }
    };
    return Invader;
}());
// Evolution
var Evolution = /** @class */ (function () {
    function Evolution() {
        this.population = [];
        this.sizePopulation = 6;
        this.nbGenerations = 0;
        this.nbAlive = 0;
        this.nbFeatures = 16;
        this.nbBest = 2;
        this.nbRandom = 2;
        this.nbChild = 3;
        this.mutationRate = 0.1;
    }
    // Create a first population of invaders
    Evolution.prototype.createFirstPopulation = function () {
        this.population = [];
        for (var i = 0; i < this.sizePopulation; i++) {
            var randShape = [];
            for (var j = 0; j < this.nbFeatures; j++) {
                randShape.push(Math.random() < 0.5 ? 1 : 0);
            }
            // Add a new invader to population
            this.population.push(new Invader(randShape));
        }
    };
    // Count number of invaders alive in population
    Evolution.prototype.countPopulation = function () {
        this.nbAlive = 0;
        for (var i = 0; i < this.population.length; i++) {
            if (this.population[i].isAlive == true) {
                this.nbAlive++;
            }
        }
    };
    // Compare fitness between two invaders
    Evolution.prototype.compareFitness = function (invaderA, invaderB) {
        return (invaderB.fitness - invaderA.fitness);
    };
    // Select a portion of existing population to breed a new generation
    Evolution.prototype.selectFromPopulation = function (population, nbBest, nbRandom) {
        // Compute performance of population
        var sorted = population.sort(this.compareFitness);
        // Get some best invaders from population
        var bestFromPopulation = sorted.slice(0, nbBest);
        // Get some random invaders from population
        var randomFromPopulation = this.population.slice(0, nbRandom);
        // Put them together
        return bestFromPopulation.concat(randomFromPopulation);
    };
    // Keep invader with best performance
    Evolution.prototype.keepBestOfGeneration = function () {
        var bestFit = 0;
        for (var i = 0; i < this.population.length; i++) {
            if (this.population[i].fitness > bestFit)
                this.bestOfGeneration = this.population[i];
        }
    };
    // Recombine information of two parents to generate a new child
    Evolution.prototype.crossover = function (parentA, parentB) {
        var prob = Math.random();
        var child = new Invader(parentA.shape.slice());
        // 1st half horizontal part of parentA + 2nd half horizontal part of parentB
        if (prob >= 0 && prob < 0.25) {
            for (var i = child.shape.length / 2; i < child.shape.length; i++) {
                child.shape[i] = parentB.shape[i];
            }
        }
        // 1st half horizontal part of parentB + 2nd half horizontal part of parentA
        if (prob >= 0.25 && prob < 0.5) {
            for (var i = 0; i < child.shape.length / 2; i++) {
                child.shape[i] = parentB.shape[i];
            }
        }
        // 1st half vertical part of parentA + 2nd half vertical part of parentB
        if (prob >= 0.5 && prob < 0.75) {
            for (var i = 2; i < child.shape.length; i += 4) {
                child.shape[i] = parentB.shape[i];
                child.shape[i + 1] = parentB.shape[i + 1];
            }
        }
        // 1st half vertical part of parentB + 2nd half vertical part of parentA
        if (prob >= 0.75 && prob <= 1) {
            for (var i = 0; i < child.shape.length; i += 4) {
                child.shape[i] = parentB.shape[i];
                child.shape[i + 1] = parentB.shape[i + 1];
            }
        }
        return child;
    };
    // Create next population from parents
    Evolution.prototype.createNextPopulation = function (parents, nbChild) {
        var nextPopulation = [];
        for (var i = 0; i < parents.length / 2; i++) {
            for (var j = 0; j < nbChild; j++) {
                var child = this.crossover(parents[i], parents[parents.length - i - 1]);
                nextPopulation.push(child);
            }
        }
        return nextPopulation;
    };
    // Mutate randomly one feature of each invaders
    Evolution.prototype.mutatePopulation = function (nextGeneration) {
        for (var i = 0; i < nextGeneration.length; i++) {
            var rand = Math.random();
            if (rand <= this.mutationRate) {
                var j = Math.round(this.nbFeatures * Math.random());
                nextGeneration[i].shape[j] == 1 ? 0 : 1;
            }
        }
        return nextGeneration;
    };
    // Allow the best invader from past generations to carry over to next generation, unaltered
    Evolution.prototype.selectElite = function () {
        var i = Math.round(this.population.length * Math.random());
        var elite = new Invader(this.bestOfGeneration.shape.slice());
        this.createFirstPopulation();
        this.population[i] = elite;
    };
    // Create next generation of invaders
    Evolution.prototype.createNextGeneration = function () {
        var parents = this.selectFromPopulation(this.population, this.nbBest, this.nbRandom);
        var nextPopulation = this.createNextPopulation(parents, this.nbChild);
        var nextGeneration = this.mutatePopulation(nextPopulation);
        this.population = nextGeneration;
    };
    return Evolution;
}());
// Start game
window.focus();
new Game().start();
