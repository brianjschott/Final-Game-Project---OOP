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


