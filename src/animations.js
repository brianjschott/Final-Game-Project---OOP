
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

