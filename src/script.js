/* Mr Schott OOP Final Spring 2022

Using a multitide of classes, objects, and functions, I am recreating a Zelda-like topdown 2D game. The basic features are:
- Moving enemies toward the player every frame
- Moving the player around the screen to collect powerups
- Dropping coins when an enemy is defeated
- Spawning new enemies every frame
- Attacking enemies with a sword weapon

The logic of the game will be split up into multiple files; you can find information on how the enemies work in src/enemies.js
*/

class CollisionManager {
	//uses p5collide2d for all calculations

	//checks for collisions between a player and an enemy. returns true if a hit occurs, false if not
	playerEnemyCollisions() {
		for (const e of enemyController.enemyList) {
			if (collideRectRect(player.x, player.y, player.width, player.height, e.x, e.y, e.width, e.height)) {
				return true
			}
		}
		return false
	}

	//checks for collisions between sword arc and a enemy
	//because collision function for arc only works with points, I check each enemy 4 times, at the midpoint of each side of the rectangle
	//if there is a collision, remove the enemy from the enemyList
	enemyAnimationCollisions() {
		for (const a of ab.animations) {
			for (let i = enemyController.enemyList.length - 1; i >= 0; i--) {
			const e = enemyController.enemyList[i]
				
				//top
				//print(`(${e.x},${e.y}) checking against arc of ${a.x}, ${a.y}, ${a.w}, ${a.h}, with angles ${a.startAngle} to ${a.endAngle}`)
				//collidePointArc uses radius, and the arc() function uses the diameter, so we need to halve it
				const HIT_OFFSET = a.w/2
				if (collidePointArc(e.x + e.width/2, e.y, a.x, a.y, a.w-HIT_OFFSET, a.startAngle, a.endAngle)) {
					print("A top hit")
					enemyController.enemyKill(i)
				}
				//bottom
				else if  (collidePointArc(e.x + e.width/2, e.y + e.height, a.x, a.y, a.w-HIT_OFFSET, a.startAngle, a.endAngle)) {
					print("A bottom hit")
					enemyController.enemyKill(i)
				}
				//left
				else if  (collidePointArc(e.x, e.y + e.height/2, a.x, a.y, a.w-HIT_OFFSET, a.startAngle, a.endAngle)) {
					print("A left hit")
					enemyController.enemyKill(i)
				}
				//right
				else if  (collidePointArc(e.x + e.width, e.y + e.height/2, a.x, a.y, a.w-HIT_OFFSET, a.startAngle, a.endAngle)) {
					print("A right hit")
					enemyController.enemyKill(i)
				}
			}
		}
	}
	
	
}

//Player object. Defines the rules for how my player operates
let player = {
	x: 200,
	y: 200,
	width: 25,
	height: 25,
	speed: 25,
	sprites: [],
	spriteFrame: 0,
	attackFrame: 0,
	//displays a different sprite image every set # of frames
	display: function() {
		if (this.sprites.length > 0) { //ensures no runtime errors if images fail to load
			image(this.sprites[this.spriteFrame], this.x, this.y, this.width, this.height)
		}

		if (frameCount % ANIMATION_FRAME_COUNT == 0) {
			//advance sprite frame if not at end of array
			if (this.spriteFrame < this.sprites.length - 1) {
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
	attack(dir) {
		const ATTACK_COOLDOWN_FRAMES = 30
		if (this.attackFrame == 0 || frameCount > this.attackFrame + ATTACK_COOLDOWN_FRAMES) {
			this.attackFrame = frameCount
			random(swordSlashSounds).play()
		ab.animationBuilder(frameCount,  15, {
				name: "arc_fan_fade",
				x: player.x+player.width/2,
				y: player.y+player.height/2,
				w: 100,
				h: 100,
				angleDegs: dir,
				startColor: color(255, 0, 0),
				numArcs: 10,
				totalDegrees: 90
				
			})
		}
	}
}

//Animation Engine
class AnimationEngine {

	constructor() {
		this.animations = []
	}

	animationDraw() {
		for (let i = 0; i < this.animations.length; i++) {
			if (this.animations[i].start <= frameCount && this.animations[i].end >= frameCount) {
				//print("Calling animation func when " + this.animations[i].start + " < " + frameCount + " < " + this.animations[i].end)
				this.animations[i].animationFunc()
			}
			else if (this.animations[i].end < frameCount) {
				// print("Removing animation")
				// print("Start frame is " + this.animations[i].start)
				// print("Current frame is " + frameCount)
				// print("End frame is " + this.animations[i].end)
				this.animations.splice(i,1)
				i-- //decrease by one when removing animation - thank you Gavin!
			}
			else {
			}
		}
	}
	animationBuilder(startFrame, animationLength, animation) {
		const BUFFER = 0

		switch (animation.name) {
			case "arc_fade":
				//adds an arc that will fade out over a series of frames by adding 5 different arcs at a specific location. Each will run for NUM_FRAMES_PER_STEP frames
				console.log("adding arc_fade in animationBuilder")
				for (let i = 1; i < animation.numArcs; i++) {
					this.animations.push(
						{
							start: startFrame+((animationLength/animation.numArcs)*(i-1)),
							end: startFrame + ((animationLength/animation.numArcs)*i)-1 + BUFFER,
							animationFunc: function() {
								angleMode(DEGREES)
								let c = animation.startColor
								c.setAlpha(255-(i*(255/animation.numArcs))) 
								print(alpha(c))
								noStroke()
								fill(c)
								arc(animation.x, animation.y, animation.w, animation.h, animation.angleDegs - 45, animation.angleDegs + 45)
								
							}
						}
					)
				}
				break;
			case "arc_fan_fade":
				console.log("adding arc_fan_fade in animationBuilder")

				for (let i = 1; i < animation.numArcs; i++) {
					this.animations.push(
						{
							x: animation.x,
							y: animation.y,
							w: animation.w,
							h: animation.h,
							start: int(startFrame+((animationLength/animation.numArcs)*(i-1))),
							end: int(startFrame + ((animationLength/animation.numArcs)*i)-1 + BUFFER),
							startAngle: (animation.angleDegs - 45)+(i*animation.totalDegrees/animation.numArcs) ,
								endAngle:  (animation.angleDegs - 45)+((i+1)*animation.totalDegrees/animation.numArcs)-1,
							animationFunc: function() {
								angleMode(DEGREES)
								let c = animation.startColor
								c.setAlpha(255-(i*(255/animation.numArcs))) 
								//print(alpha(c))
								noStroke()
								fill(c)
								// print("x is " + animation.x)
								// print("y is " + animation.y)
								// print(animation.angleDegs - 45)
								
								// print(this.startAngle + " to " + this.endAngle)
								// arc(animation.x, animation.y, animation.w, animation.h, (animation.angleDegs - 45)+(i*animation.totalDegrees/animation.numArcs), (animation.angleDegs - 45)+(i*animation.totalDegrees/animation.numArcs)-1)
								arc(animation.x, animation.y, animation.w, animation.h,this.startAngle, this.endAngle)

							}
						}
					)
				}
				break;
		}
	}
}


let ab = new AnimationEngine()
let col = new CollisionManager()


//animationType must contain:
//A string specifying the type
//A boolean specifying if isCollidable
//All the other properties necessary to call the shape
//I know there is a way to do this using object prototypes, but I need to do more research



//Global variables
let gameover = false
let enemyController = new EnemyController()
let lastKeyPressed
//Constants
const BUFFER = 25
const ANIMATION_FRAME_COUNT = 30

//background images
let grassTile

//sounds
let swordSlashSounds = []

function preload() {
	//adds each frame of character animation to an array
	player.sprites.push(loadImage("assets/img/character_0000.png"))
	player.sprites.push(loadImage("assets/img/character_0001.png"))
	enemyController.enemySprites.push(loadImage("assets/img/character_0024.png"))
	enemyController.enemySprites.push(loadImage("assets/img/character_0025.png"))
	enemyController.enemySprites.push(loadImage("assets/img/character_0026.png"))

	//background
	grassTile = loadImage("assets/img/tile_0038.png")

	swordSlashSounds.push(loadSound("assets/sound/sword_swing_1.mp3"))
	swordSlashSounds.push(loadSound("assets/sound/sword_swing_2.mp3"))

}
function setup() {
	angleMode(DEGREES)
	createCanvas(400, 400)
	//adds initial enemy set to the world by pushing enemies into the enemyList
	//will likely move this code into EnemyController class
	for (let i = 0; i < MAX_ENEMIES; i++) {
		enemyController.enemyList.push(new Enemy(enemyController.enemySprites))
	}

	for (const s of swordSlashSounds) {
		s.setVolume(.5)
	}
}

function draw() {
	frameRate(60)
	//draws background
	drawBackground()
	//displays Player
	player.display()
	//displays each Enemy in enemyList
	for (enemy of enemyController.enemyList) {
		enemy.display()
		enemy.move()
	}
	ab.animationDraw()
	col.playerEnemyCollisions()
	col.enemyAnimationCollisions()
}

//draws background by tiling an image across the canvas
function drawBackground() {
	tileImages(grassTile, 25, 0, 0, width, height)
}

//tiles a given image (imageToTile) of size tileSize starting at (x,y) and extending for a given w and h value
function tileImages(imageToTile, tileSize, x, y, w, h) {
	for (let i = x; i <= w - tileSize; i += tileSize) {
		for (let j = y; j <= h - tileSize; j++) {
			image(imageToTile, i, j, tileSize, tileSize)
		}
	}
}

//add in mousePressed functionality here
function mousePressed() {

}

const UP_ATTACK_DEG = 270
const LEFT_ATTACK_DEG = 180
const DOWN_ATTACK_DEG = 90
const RIGHT_ATTACK_DEG = 0

//keyboard controls
function keyPressed() {
	if (keyCode >= 37 && keyCode <= 40) {
		player.move(keyCode)
	}
	let dir = 0
	//up
	if (keyIsDown(87)) {
		dir = 270
		player.attack(dir)
	}
	//right
	else if (keyIsDown(68)) {
		dir = 0
		player.attack(dir)
	}
	//down
	else if (keyIsDown(83)) {
		dir = 90
		player.attack(dir)
	}
	//left
	else if (keyIsDown(65)) {
		dir = 180
	  player.attack(dir)		
	}
}

//This code prevents the scrolling of the window using the Space bar or arrow keys
window.addEventListener("keydown", function(e) {
	if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].indexOf(e.code) > -1) {
		e.preventDefault();
	}
}, false);

//thanks geeksforgeeks.org
//returns a number (num) rounded to the nearest multiple (mult). useful for getting players to show up in a grid space every 25 pixels
function roundToNearest(num, mult) {
	return Math.ceil(num / mult) * mult
}

