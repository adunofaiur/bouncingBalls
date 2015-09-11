//units: 1 px = 1m

var GRAVITY = $V([0, -9.8, 0]);

function State(initialAcceleration, priorState){

	this.acceleration = $V([0, -9.8, 0]);
	this.velocity = $V([0, 0, 0])
	if(priorState){
		this.acceleration = priorState.acceleration.dup();
		
		this.velocity = priorState.velocity.dup();

	}
}
//
function calculateAcceleration(currentAccel, priorAccel, newVelocity, oldVelocity){
	//forces, of which there are presently none
	
	//oldAccel.add(GRAVITY);
}
function calculateVelocity(currentAccel, priorAccel, oldVelocity){
	var newVel = oldVelocity.add(priorAccel);
	return newVel;
}

function calculatePosition(sphereArg, oldVel, newVel){
	var finalMove = oldVel.add(newVel);
	finalMove = finalMove.multiply(.5);
	finalMove = finalMove.multiply(timeStep/1000);
	sphereArg.position.x += finalMove.e(1);
	sphereArg.position.y += finalMove.e(2);
	sphereArg.position.z += finalMove.e(3);

}
function eulerStep(priorState, sphere){
	var updatedState = new State(GRAVITY, priorState);
	//
	calculateAcceleration(updatedState.acceleration, priorState.acceleration, updatedState.velocity, priorState.velocity);
	updatedState.velocity = calculateVelocity(updatedState.acceleration, priorState.acceleration, priorState.velocity);
	calculatePosition(sphere, priorState.velocity, updatedState.velocity);
	return updatedState;

}