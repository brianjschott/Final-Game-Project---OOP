//Constants
const MAX_ENEMIES = 3
const ENEMY_MOVEMENT_FRAME_COUNT = 120
const ENEMY_SIZE = 25
//Enemy class
class Enemy {
	constructor(_sprites) {
		this.x = roundToNearest(random(0, width - BUFFER), 25)
		this.y = roundToNearest(random(0, height - BUFFER), 25)
		print(this.x + " " + this.y)
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
		//gets location of Player and moves it toward player
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

			//only moves the player if the move is valid
			if (enemyController.checkIfValidSwarmMovement(this)) {
				this.x += this.speedx
				this.y += this.speedy
				//print("Moved to (" + this.x + ", " + this.y + ")")
			}
		}
	}

}

//EnemyController class that controls where the Enemies spawn and how often
class EnemyController {
	constructor() {
		this.enemyList = []
		this.enemySprites = []
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
	}
	
}