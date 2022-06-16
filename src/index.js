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


//Player object. Defines the rules for how my player operates

const INVUL_FRAMES_LENGTH = 120



//Global variables
gameover = false
enemyController = new EnemyController()
ab = new AnimationEngine()
col = new CollisionManager()
let isPaused = false, isGameOver = false
let lastKeyPressed
//Constants
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

//thanks geeksforgeeks.org
//returns a number (num) rounded to the nearest multiple (mult). useful for getting players to show up in a grid space every 25 pixels
function roundToNearest(num, mult) {
	return Math.ceil(num / mult) * mult
}

