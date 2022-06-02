//Constants
const ENEMY_MOVEMENT_FRAME_COUNT = 120
const ENEMY_SIZE = 25
//Enemy class
class Enemy {
	constructor(_sprites) {
		this.x = roundToNearest(random(0, width - BUFFER), 25)
		this.y = roundToNearest(random(0, height - BUFFER), 25)
		//print(this.x + " " + this.y)
		this.width = ENEMY_SIZE
		this.height = ENEMY_SIZE
		this.speedx = 25 //moves at half of the player's speed
		this.speedy = 25
		this.sprites = _sprites
		this.spriteFrame = 0

		//images must be included in preload() so it is not here
	} 

	display() {
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
	}

	move() {
		//gets location of Player and moves enemy toward player
		if (frameCount % ENEMY_MOVEMENT_FRAME_COUNT == 0) {
		if (player.x > this.x) {
			this.speedx = Math.abs(this.speedx)
		}
		else {
			this.speedx = -Math.abs(this.speedx)
		}

		if (player.y > this.y) {
			this.speedy = Math.abs(this.speedy)
		}
		else {
			this.speedy = -Math.abs(this.speedy)
		}

			//only moves the enemy if the move is valid
			if (enemyController.checkIfValidSwarmMovement(this)) {
				this.x += this.speedx
				this.y += this.speedy
				////print("Moved to (" + this.x + ", " + this.y + ")")
			}
		}
	}

}
const ENEMY_SPAWN_FRAME_INTERVAL = 240
const MAX_ENEMIES = 12

//EnemyController class that controls where the Enemies spawn and how often
class EnemyController {
	constructor() {
		this.enemyList = []
		this.enemySprites = []
		this.enemySpawnFrame = 0
		this.enemyWaveSpawnNumber = 3
	}

	spawnController() {
		if (this.enemyList.length < MAX_ENEMIES && (this.enemySpawnFrame == 0 || this.enemySpawnFrame + ENEMY_SPAWN_FRAME_INTERVAL < frameCount)) {
			this.spawnWave(this.enemyWaveSpawnNumber)
			this.enemySpawnFrame = frameCount
			crowSpawnSound.play()
		}
	}
	
	// if spot would be empty next frame, add an enemy there
	spawnWave(numEnemies) {
		for (let i = 0; i < numEnemies; i++) {
			if (this.enemyList.length < MAX_ENEMIES) {
				let triesToPlace  = 1
				while (triesToPlace < 10) {
					let e = new Enemy(this.enemySprites)
					if (this.checkIfValidSwarmMovement(e)) {
						this.enemyList.push(e)
						break;
					}
					triesToPlace++
				}
			}
		}
	}
	//given an Enemy's position next frame , check all the other Enemies' CURRENT positions. If its new position would stand in the next frame's position, return false. If the move is OK, retun true
	//added in a collision buffer so that it doesn't detect the edges of other images
	//this function does mean that some sprites will not move every frame. I can update this later to give them some optional movement choices
	checkIfValidSwarmMovement(e) {
		const collisionBuffer = 1
		for (let otherEnemy of this.enemyList) {
			if (otherEnemy != e && collideRectRect(e.x + e.speedx + collisionBuffer,e.y + e.speedy + collisionBuffer,ENEMY_SIZE - collisionBuffer, ENEMY_SIZE - collisionBuffer, otherEnemy.x + collisionBuffer, otherEnemy.y + collisionBuffer, ENEMY_SIZE - collisionBuffer, ENEMY_SIZE - collisionBuffer)) {
				return false
			}
		}
		return true
	}

	//removes enemy at that spot in the list and plays sound
	//also drops a coin at that location
	enemyKill(i) {
		this.enemyList.splice(i, 1)
		crowKillSound.play()
	}
	
}