/* Mr Schott OOP Final Spring 2022

Using a multitide of classes, objects, and functions, I am recreating a Zelda-like topdown 2D game. The basic features are:
- Moving enemies toward the player every frame
- Moving the player around the screen to collect powerups
- Dropping coins when an enemy is defeated
- Spawning new enemies every frame
- Attacking enemies with a sword weapon

The logic of the game will be split up into multiple files; you can find information on how the enemies work in src/enemies.js

Attack with WASD
Move with the Arrow Keys
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
				////print(`(${e.x},${e.y}) checking against arc of ${a.x}, ${a.y}, ${a.w}, ${a.h}, with angles ${a.startAngle} to ${a.endAngle}`)
				//collidePointArc uses radius, and the arc() function uses the diameter, so we need to halve it
				const HIT_OFFSET = a.w/2
				if (collidePointArc(e.x + e.width/2, e.y, a.x, a.y, a.w-HIT_OFFSET, a.startAngle, a.endAngle)) {
					//print("A top hit")
					enemyController.enemyKill(i)
				}
				//bottom
				else if  (collidePointArc(e.x + e.width/2, e.y + e.height, a.x, a.y, a.w-HIT_OFFSET, a.startAngle, a.endAngle)) {
					//print("A bottom hit")
					enemyController.enemyKill(i)
				}
				//left
				else if  (collidePointArc(e.x, e.y + e.height/2, a.x, a.y, a.w-HIT_OFFSET, a.startAngle, a.endAngle)) {
					//print("A left hit")
					enemyController.enemyKill(i)
				}
				//right
				else if  (collidePointArc(e.x + e.width, e.y + e.height/2, a.x, a.y, a.w-HIT_OFFSET, a.startAngle, a.endAngle)) {
					//print("A right hit")
					enemyController.enemyKill(i)
				}
			}
		}
	}
	
	
}

let ui = {
	displayPlayerLives() {
		for (let i = 1; i <= player.lives; i++) {
			image(heartImg, 20 * i, 10, 15, 15)
		}
	}
}

//Player object. Defines the rules for how my player operates

const INVUL_FRAMES_LENGTH = 120
let player = {
	x: 200,
	y: 200,
	width: 25,
	height: 25,
	lives: 3,
	speed: 25,
	sprites: [],
	invulSprites: [],
	spriteFrame: 0,
	attackFrame: 0,
	invulFrame: 0,
	isInvul: true,
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
		const ATTACK_COOLDOWN_FRAMES = 20
		if (this.attackFrame == 0 || frameCount > this.attackFrame + ATTACK_COOLDOWN_FRAMES) {
			this.attackFrame = frameCount
			
			random(swordSlashSounds).play()
			
			ab.animationBuilder(frameCount, 15, {
				name: "weapon_arc",
				x: player.x + player.width/2,
				y: player.y + player.height/2,
				w: 75,
				h: 15,
				angleDegs: dir,
				numArcs: 10,
				totalDegrees: 90,
				weaponSprite: swordImg
			})
			
		ab.animationBuilder(frameCount,  15, {
				name: "arc_fan_fade",
				x: player.x+player.width/2,
				y: player.y+player.height/2,
				w: 150,
				h: 150,
				angleDegs: dir,
				startColor: color(200, 200,255),
				numArcs: 10,
				totalDegrees: 90
				
			})
		}
	},
	takeDamage() {
		if (!this.isInvul) {
			this.lives--
			this.resetPosition()
			this.isInvul = true
			this.invulFrame = frameCount
			failSound.play()
		}
		if (this.lives <= 0) {
			gameOver()
		}
	},
	updatePlayerStatus() {
		//invul frames check
		if (frameCount  > this.invulFrame + INVUL_FRAMES_LENGTH) {
			this.isInvul = false
		}
	},
	resetPosition() {
		while (true) {
			let x = random(0, width)
			let y = random(0, height)
			if (enemyController.checkIfValidSwarmMovement({x: x, y: y, width: this.width, height: this.height})) {
			this.x = x
			this.y = y
				break; 
			}
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
				////print("Calling animation func when " + this.animations[i].start + " < " + frameCount + " < " + this.animations[i].end)
				this.animations[i].animationFunc()
			}
			else if (this.animations[i].end < frameCount) {
				// //print("Removing animation")
				// //print("Start frame is " + this.animations[i].start)
				// //print("Current frame is " + frameCount)
				// //print("End frame is " + this.animations[i].end)
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
			case "weapon_arc":
				//print("Showing weapon arc")
				for (let i = 1; i < animation.numArcs; i++) {
					this.animations.push(
						{
							x: animation.x,
							y: animation.y,
							w: animation.w,
							h: animation.h,
							start: int(startFrame+((animationLength/animation.numArcs)*(i-1))),
							end: startFrame + ((animationLength/animation.numArcs)*i)-1 + BUFFER,
							startAngle: (animation.angleDegs)+(i*animation.totalDegrees/animation.numArcs)-50 ,
								
							animationFunc: function() {
								angleMode(DEGREES)
								push()
								//print(`Translating ${animation.w/2} and ${animation.h}`)								
								translate(animation.x, animation.y)

								
								rotate(this.startAngle)
								//print("Rotating " + this.startAngle)
								//print(`Translating ${animation.x} and ${animation.y}`)
								image(animation.weaponSprite, 0, 0, animation.w, animation.h)
								pop()
							}
						}
					)
				}
			break;
			case "arc_fade":
				//adds an arc that will fade out over a series of frames by adding 5 different arcs at a specific location. Each will run for NUM_FRAMES_PER_STEP frames
				//console.log("adding arc_fade in animationBuilder")
				for (let i = 1; i < animation.numArcs; i++) {
					this.animations.push(
						{
							start: startFrame+((animationLength/animation.numArcs)*(i-1)),
							end: startFrame + ((animationLength/animation.numArcs)*i)-1 + BUFFER,
							animationFunc: function() {
								angleMode(DEGREES)
								let c = animation.startColor
								c.setAlpha(255-(i*(255/animation.numArcs))) 
								//print(alpha(c))
								noStroke()
								fill(c)
								arc(animation.x, animation.y, animation.w, animation.h, animation.angleDegs - 45, animation.angleDegs + 45)
								
							}
						}
					)
				}
				break;
			case "arc_fan_fade":
				//console.log("adding arc_fan_fade in animationBuilder")

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
								noStroke()
								fill(c)
								arc(animation.x, animation.y, animation.w, animation.h,this.startAngle, this.endAngle)

							}
						}
					)
				}
				break;
		}
	}
}




//animationType must contain:
//A string specifying the type
//A boolean specifying if isCollidable
//All the other properties necessary to call the shape
//I know there is a way to do this using object prototypes, but I need to do more research



//Global variables
let gameover = false
let enemyController = new EnemyController()
let ab = new AnimationEngine()
let col = new CollisionManager()
let isPaused = false, isGameOver = false
let lastKeyPressed
//Constants
const BUFFER = 25
const ANIMATION_FRAME_COUNT = 30

//background images
let grassTile
//sprites
let swordImg, heartImg

//sounds
let swordSlashSounds = []
let crowSpawnSound, crowKillSound
let bgMusic,failSound, gameOverSound
//fonts
let dakotaFont
function preload() {
	dakotaFont = loadFont("assets/fonts/Dakota-Regular.ttf")	
		player.sprites.push(loadImage("assets/img/character_0000.png"))
	player.sprites.push(loadImage("assets/img/character_0001.png"))
	enemyController.enemySprites.push(loadImage("assets/img/character_0024.png"))
	enemyController.enemySprites.push(loadImage("assets/img/character_0025.png"))
	enemyController.enemySprites.push(loadImage("assets/img/character_0026.png"))

	//background
	grassTile = loadImage("assets/img/tile_0038.png")

	swordSlashSounds.push(loadSound("assets/sound/sword_swing_1.mp3"))
	swordSlashSounds.push(loadSound("assets/sound/sword_swing_2.mp3"))
	swordSlashSounds.push(loadSound("assets/sound/sword_swing_3.mp3"))

	crowSpawnSound = loadSound("assets/sound/crow_spawn.ogg")
	crowKillSound = loadSound("assets/sound/poof.wav")

	pauseSound = loadSound("assets/sound/pause.wav")
	swordImg = loadImage("assets/img/swordSilver.png")

	heartImg = loadImage("assets/img/heart.png")

	bgMusic = loadSound("assets/sound/infiltration.wav")
	failSound = loadSound("assets/sound/fail.wav")
	gameOverSound = loadSound("assets/sound/game_over.wav")
	
}
function setup() {
	angleMode(DEGREES)
	createCanvas(400, 400)
	//adds initial enemy set to the world by pushing enemies into the enemyList
	//will likely move this code into EnemyController class


	for (const s of swordSlashSounds) {
		s.setVolume(.5)
	}
	crowSpawnSound.setVolume(.1)
	bgMusic.setVolume(.3)
}

function draw() {
	frameRate(60)
	drawBackground()
	player.display()
	player.updatePlayerStatus()
	for (enemy of enemyController.enemyList) {
		enemy.display()
		enemy.move()
	}
	ab.animationDraw()
	if (col.playerEnemyCollisions()) {
		player.takeDamage()
	}
	col.enemyAnimationCollisions()
	enemyController.spawnController()
	pauseMenuCheck()

	ui.displayPlayerLives()

}

function pauseMenuCheck() {
		if (isPaused) {
			fill('gold')
			textFont(dakotaFont)
			textSize(48)
			textAlign(CENTER)
			text("PAUSED", width/2, height/2)
	}
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

function gameOver() {
	gameOverSound.play()
	fill('gold')
	textFont(dakotaFont)
	textSize(48)
	textAlign(CENTER)
	text("GAME OVER!", width/2, height/2)
	noLoop()
	isGameOver = true
}

//keyboard controls
function keyPressed() {

	if (!bgMusic.isPlaying()) {
		bgMusic.loop()
	}
	
	const UP_ATTACK_DEG = 270
	const LEFT_ATTACK_DEG = 180
	const DOWN_ATTACK_DEG = 90
	const RIGHT_ATTACK_DEG = 0

	//P for pause
	if (keyCode == 80) {
		isPaused = !isPaused
		pauseSound.play()
	}
	if (isPaused || isGameOver) {
		noLoop()
		return;
	}
	else {
		loop()
	}
	
	if (keyCode >= 37 && keyCode <= 40) {
		player.move(keyCode)
	}

	//up
	if (keyIsDown(87)) {
		player.attack(UP_ATTACK_DEG)
	}
	//right
	else if (keyIsDown(68)) {
		player.attack(RIGHT_ATTACK_DEG)
	}
	//down
	else if (keyIsDown(83)) {
		player.attack(DOWN_ATTACK_DEG)
	}
	//left
	else if (keyIsDown(65)) {
	  player.attack(LEFT_ATTACK_DEG)		
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

