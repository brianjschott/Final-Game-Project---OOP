let ui = {
	displayPlayerLives() {
		for (let i = 1; i <= player.lives; i++) {
			image(heartImg, 20 * i, 10, 15, 15)
		}
	}
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


//This code prevents the scrolling of the window using the Space bar or arrow keys
window.addEventListener("keydown", function(e) {
	if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].indexOf(e.code) > -1) {
		e.preventDefault();
	}
}, false);
