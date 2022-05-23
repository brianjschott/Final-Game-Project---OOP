/* Mr Schott OOP Final Spring 2022

Using a multitide of classes, objects, and functions, I am recreating a Zelda-like topdown 2D game. The basic features are:
- Moving enemies toward the player every frame
- Moving the player around the screen to collect powerups
- Dropping coins when an enemy is defeated
- Spawning new enemies every frame
- Attacking enemies with a sword weapon

The logic of the game will be split up into multiple files; you can find information on how the enemies work in src/enemies.js
*/




//Player object. Defines the rules for how my player operates
let player = {
	x: 200,
	y: 200,
	width: 25,
	height: 25,
	speed: 25,
	sprites: [],
	spriteFrame: 0,
	//displays a different sprite image every set # of frames
	display: function() {
		if (this.sprites.length > 0) { //ensures no runtime errors if images fail to load
			image(this.sprites[this.spriteFrame], this.x, this.y, this.width, this.height)	
		}

		if (frameCount % ANIMATION_FRAME_COUNT == 0) {
		//advance sprite frame if not at end of array
			if (this.spriteFrame < this.sprites.length-1) {
				this.spriteFrame++
			}
			//otherwise set back to 0
			else {
				this.spriteFrame = 0
			}
		}
	},
	move: function(inputKeyCode) {
		if (inputKeyCode == UP_ARROW) {
			this.y -= this.speed
		}
		else if (inputKeyCode == DOWN_ARROW) {
			this.y += this.speed
		}
		if (inputKeyCode == LEFT_ARROW) {
			this.x -= this.speed
		}
		else if (inputKeyCode == RIGHT_ARROW) {
			this.x += this.speed
		}
	},
	attack: function() {
		
		

		
	}
}
//thanks geeksforgeeks.org
//returns a number (num) rounded to the nearest multiple (mult). useful for getting players to show up in a grid space every 25 pixels
function roundToNearest(num, mult) {
	return Math.ceil(num/mult) * mult
}


//Collectible class to go here

//Global variables
let gameover = false
let enemyController = new EnemyController()

//Constants
const BUFFER = 25
const ANIMATION_FRAME_COUNT = 30

//background images
let grassTile

function preload() {
	//adds each frame of character animation to an array
	player.sprites.push(loadImage("assets/img/character_0000.png"))
	player.sprites.push(loadImage("assets/img/character_0001.png"))
	enemyController.enemySprites.push(loadImage("assets/img/character_0024.png"))
	enemyController.enemySprites.push(loadImage("assets/img/character_0025.png"))
	enemyController.enemySprites.push(loadImage("assets/img/character_0026.png"))

	//background
	grassTile = loadImage("assets/img/tile_0038.png")

}
function setup() {
	createCanvas(400,400)
	//adds initial enemy set to the world by pushing enemies into the enemyList
	//will likely move this code into EnemyController class
	for (let i = 0; i < MAX_ENEMIES; i++) {
		enemyController.enemyList.push(new Enemy(enemyController.enemySprites))
	}
}

function draw() {
	//draws background
	drawBackground()
	//displays Player
	player.display()
	//displays each Enemy in enemyList
	for (enemy of enemyController.enemyList) {
		enemy.display()
		enemy.move()
	}
}

//draws background by tiling an image across the canvas
function drawBackground() {
	tileImages(grassTile, 25, 0, 0, width, height)
}

//tiles a given image (imageToTile) of size tileSize starting at (x,y) and extending for a given w and h value
function tileImages(imageToTile, tileSize, x,y,w,h) {
	for (let i = x; i <= w - tileSize; i += tileSize)  {
		for (let j = y; j <= h - tileSize; j++) {
			image(imageToTile, i, j, tileSize, tileSize)
		}
	}
}

//add in mousePressed functionality here
function mousePressed() {
	
}

//keyboard controls
function keyPressed() {
	if (keyCode >= 37 && keyCode <= 40) {
		player.move(keyCode)
	}
}

//This code prevents the scrolling of the window using the Space bar or arrow keys
window.addEventListener("keydown", function(e) {
    if(["Space","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].indexOf(e.code) > -1) {
        e.preventDefault();
    }
}, false);