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
			
			// ab.animationBuilder(frameCount, 15, {
			// 	name: "weapon_arc",
			// 	x: player.x + player.width/2,
			// 	y: player.y + player.height/2,
			// 	w: 75,
			// 	h: 15,
			// 	angleDegs: dir,
			// 	numArcs: 10,
			// 	totalDegrees: 90,
			// 	weaponSprite: swordImg
			// })
			
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