//units: 1 px = 1m



var GRAVITY = $V([0, -9.8, 0]);

var ELASTIC_COEF = .8;
var FRICTION_COEF = .1;

function initCollidables(){
	var p1 = $P($V([18, 0, 0]), $V([-1, 0, 0]));
	
	var p2 = Plane.create($V([-16, 0, 0]), $V([1, 0, 0]));

	var p3 = Plane.create($V([0, 16, 0]), $V([0, -1, 0]));

	var p4 = Plane.create($V([0, -16, 0]), $V([0, 1, 0]));

	var p5 = Plane.create($V([0, 0, 16]), $V([0, 0, -1]));

	var p6 = Plane.create($V([0, 0, -16]), $V([0, 0, 1]));
	var vals =  [p1, p2, p3, p4, p5, p6];
	for (v in vals){
		vals[v].col_type = 'plane';
	}
	return vals;

}

var collidables = initCollidables();



function State(initialAcceleration, priorState){

	if(priorState){
		this.acceleration = priorState.acceleration.dup();
		
		this.velocity = priorState.velocity.dup();

	}else{
		this.acceleration = $V([0, -9.8, 0]);
		this.velocity = $V([10, 0, 0])

	}
}
//
function calculateAcceleration(currentAccel, priorAccel, newVelocity, oldVelocity){
	
	//forces, of which there are presently none
	var air = oldVelocity.multiply(-0.02);
	currentAccel = GRAVITY.add(air);
	return currentAccel;
	//oldAccel.add(GRAVITY);
}
function calculateVelocity(currentAccel, priorAccel, oldVelocity, ts){
	var accelerator = priorAccel.multiply(ts/1000);
	var newVel = oldVelocity.add(accelerator);

	return newVel;
}

function calculatePosition(sphereArg, oldVel, newVel, ts){
	var finalMove = oldVel.add(newVel);
	finalMove = finalMove.multiply(.5);
	finalMove = finalMove.multiply(ts/1000);

	var i = sphereArg.position.x + finalMove.e(1);
	var j = sphereArg.position.y + finalMove.e(2);
	var k = sphereArg.position.z + finalMove.e(3);
	return $V([i, j, k]);
}


function sameSign(a, b){
	if(a*b >= 0){
		return true;
	}
	else{
		return false;
	}
}
function didCollide(collidable, collidableType, pos1, pos2){

	if(collidableType == 'plane'){
		var pointInPlane1 = pos1.subtract(collidable.anchor);
		var dist1 = pointInPlane1.dot(collidable.normal);
		var pointInPlane2 = pos2.subtract(collidable.anchor);
		var dist2 = pointInPlane2.dot(collidable.normal);
		if(sameSign(dist1, dist2)){
			return -1;
		}
		else{
			var fract = dist1 / (dist1 - dist2);

			return fract;
		}

	}
	else{
		return -1;
	}
}
function collisionDetect(sphere, pos1, pos2){
	//dummy right now, if pos2 is out of bounds we've collided. do it right later

	for(var i = 0; i < collidables.length; i++){
		var fract = didCollide(collidables[i], collidables[i].col_type, pos1, pos2);
		if (fract > -1){
			return {time: fract, normal: collidables[i].normal};
		}	
	}
	return -1;
}

function distancePointPlane(point, plane){
	var distance = Math.abs(plane.e(1) + plane.e(2) + plane.e(3) + plane.e(4));
	distance = distance / Math.sqrt(Math.pow(point.e(1)) + Math.pow(point.e(2))  + Math.pow(point.e(3)));
	return distance; 
}

function magnitude(sylvVect){
	var mag = Math.sqrt(Math.pow(sylvVect.e(1), 2) + Math.pow(sylvVect.e(2), 2)  + Math.pow(sylvVect.e(3), 2)); 
	return mag;
}

function collideVelcoity(oldVel, planeNormal){
	var normalVel = oldVel.dot(planeNormal);
	normalVel = planeNormal.multiply(normalVel);
	var tangVel = oldVel.subtract(normalVel);
	var elasticResp = normalVel.multiply(-ELASTIC_COEF);
	var interimTerm = Math.max(magnitude(normalVel.multiply(1-FRICTION_COEF), magnitude(tangVel)));
	var frictResp = tangVel.subtract(tangVel.multiply(interimTerm));
	var finalVel = elasticResp.add(frictResp); 
	return finalVel;

}
function isResting(state, sphere){
	if(magnitude(state.velocity) < .25 && sphere.position.y < -17.95){
		console.log('stahp')
		return true;
	}
	console.log("a: " + magnitude(state.acceleration) + " b: "  + magnitude(state.velocity));

	return false;
}
function eulerStep(priorState, sphere){
	var t = 0;
	var timeStepRemaining =  timeStep - t;
	var ts = timeStep;
	var updatedState;

	while(timeStepRemaining > 0){
			updatedState = new State(GRAVITY, priorState);
			var priorPos = $V([sphere.position.x, sphere.position.y, sphere.position.z]);


			updatedState.acceleration = calculateAcceleration(updatedState.acceleration, priorState.acceleration, updatedState.velocity, priorState.velocity);
			updatedState.velocity = calculateVelocity(updatedState.acceleration, priorState.acceleration, priorState.velocity, ts);
			calculatePosition(sphere, priorState.velocity, updatedState.velocity, ts);
			var priorPos = $V([sphere.position.x, sphere.position.y, sphere.position.z]);
			var newPos = calculatePosition(sphere, priorState.velocity, updatedState.velocity, ts);
			updatedState.pos = newPos;

			var fractTime = collisionDetect(sphere, priorPos, newPos);
			if(fractTime.time > -1){
				ts = fractTime.time * timeStep;
				var collisionState = new State(GRAVITY, priorState);

				var priorPos = $V([sphere.position.x, sphere.position.y, sphere.position.z]);


				collisionState.acceleration = calculateAcceleration(collisionState.acceleration, priorState.acceleration, collisionState.velocity, priorState.velocity);
				collisionState.velocity = calculateVelocity(collisionState.acceleration, priorState.acceleration, priorState.velocity, ts);
				
				collisionState.velocity = collideVelcoity(collisionState.velocity, fractTime.normal);
				var priorPos = $V([sphere.position.x, sphere.position.y, sphere.position.z]);
				var newPos = calculatePosition(sphere, priorState.velocity, collisionState.velocity, ts);

				priorState = collisionState;
				updatedState = collisionState;
				timeStepRemaining = timeStepRemaining - ts


			}else{
				timeStepRemaining = 0;
			}

	}

	if(isResting(updatedState, sphere)){
		updatedState.velocity = $V([0, 0, 0]);
		updatedState.acceleration = $V([0, 0, 0]);
	}
	sphere.position.x =  updatedState.pos.e(1);
	sphere.position.y =  updatedState.pos.e(2);

	sphere.position.z =  updatedState.pos.e(3);

	return updatedState;

}