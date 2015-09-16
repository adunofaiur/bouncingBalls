//units: 1 px = 1m



function collideableWalls(){
	var p1 = $P($V([8, 0, 0]), $V([-1, 0, 0]));
	
	var p2 = Plane.create($V([-8, 0, 0]), $V([1, 0, 0]));

	var p3 = Plane.create($V([0, 8, 0]), $V([0, -1, 0]));

	var p4 = Plane.create($V([0, -8, 0]), $V([0, 1, 0]));

	var p5 = Plane.create($V([0, 0, 8]), $V([0, 0, -1]));

	var p6 = Plane.create($V([0, 0, -8]), $V([0, 0, 1]));
	var vals =  [p1, p2, p3, p4, p5, p6];
	for (v in vals){
		vals[v].col_type = 'plane';
	}
	return vals;

}




function accelerate(moveable, oldmoveable, forces){
	
	moveable.acceleration = $V([0, 0, 0])
	//generic forces
	for(var i = 0; i < forces.length; i++){
		var force = forces[i];
		if(force.forceType == 'vector'){
			moveable.acceleration = moveable.acceleration.add(force.force);
		}else if(force.forceType == "columb"){
			var cNormal = moveable.position.subtract(force.anchor).toUnitVector();
			var dist = magnitude(moveable.position.subtract(force.anchor)) - 2;
			if((dist*dist < .0001)){
				dist = .01;
			}
			var cForce = cNormal.multiply(force.constant / (dist*dist));
			moveable.acceleration = moveable.acceleration.add(cForce);
		}
	}
	//air res, hardcoded
	moveable.acceleration = moveable.acceleration.subtract(moveable.velocity.multiply(AIR_RESISTANCE));

}
function velocerate(moveable, oldmoveable, ts){
	
	var oldAccel = oldmoveable.acceleration.multiply(ts/1000);
	moveable.velocity = oldmoveable.velocity.add(oldAccel);

}

function reposition(moveable, oldmoveable, ts){
	
	var finalMove = oldmoveable.velocity.add(moveable.velocity);
	finalMove = finalMove.multiply(.5);
	finalMove = finalMove.multiply(ts/1000);

	moveable.position = moveable.position.add(finalMove);
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
			return {time: -1};
		}
		else{
			var fract = dist1 / (dist1 - dist2);

			return {time: fract, normal: collidable.normal}
		}

	}
	else if (collidableType == 'ball'){
		var dist1 = magnitude(collidable.position.subtract(pos1));
		var dist2 = magnitude(collidable.position.subtract(pos2));
		if(dist2 < 4){
			var fract = (dist1-4)/ (dist1-4 - dist2-4)
			var n = pos1.subtract(collidable.position).multiply(1);
			return {time: fract, normal: n.toUnitVector(), ctype: 'ball'}
		}else{
			return {time: -1}
		}
	}
	else{
		return {time: -1};
	}
}
function detectCollision(moveable, oldmoveable, collidables){
	var responses = [];
	for(var i = 0; i < collidables.length; i++){
		if((collidables[i].rendering && collidables[i].rendering != moveable.rendering) || !collidables[i].rendering){
			var fract = didCollide(collidables[i], collidables[i].col_type, moveable.position, oldmoveable.position);
		
			if (fract.time > -1){
				responses.push(fract);
			}	

		}
	}
	if(responses.length > 0){
		return responses;
	}


	return [];
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

function collisionVelocerate(moveable, planeNormal){
	
	var ELASTIC_COEFFICIENT = moveable.elasticity;

	var normalVel = moveable.velocity.dot(planeNormal);
	normalVel = planeNormal.multiply(normalVel);
	
	var tangVel = moveable.velocity.subtract(normalVel);
	var elasticResp = normalVel.multiply(-ELASTIC_COEFFICIENT);
	var frictResp = tangVel.multiply(1-FRICTION_COEFFICIENT);

	var finalVel = elasticResp.add(frictResp);
	moveable.velocity = finalVel;

}
function isResting(sPrime){
	if(magnitude(sPrime.velocity) < .25 && sPrime.position.y < -17.95){
		console.log('stahp')
		return true;
	}

	return false;

}
function eulerStep(state){
	

	for (var k = 0; k < state.moveables.length; k++){

		var t = 0;
		var timeStepRemaining =  timeStep - t;
		var ts = timeStep;

		while(timeStepRemaining > 0){
			
			var sPrime = state.moveables[k];
			var s = state.oldmoveables[k];

			accelerate(sPrime, s, state.forces);
			velocerate(sPrime, s, ts);
			reposition(sPrime, s, ts);
			var collisionDetails = detectCollision(sPrime, s, state.collidables);

			if(collisionDetails.length > 0){
				
				ts = collisionDetails[0].time * timeStep;
				//single response
				if(collisionDetails.length == 1){
					var detail = collisionDetails[0];
					sPrime = s.dup();
					accelerate(sPrime, s, state.forces);
					velocerate(sPrime, s, ts);
					collisionVelocerate(sPrime, detail.normal);
					reposition(sPrime, sPrime, ts);

					
				timeStepRemaining = timeStepRemaining - ts
				if(timeStepRemaining < .1){
					timeStepRemaining = 0;
				}
				state.oldmoveables[k] = sPrime.dup();
				state.moveables[k] = sPrime.dup();
			}

			}else{
				timeStepRemaining = 0;
			}
			
			if(isResting(sPrime)){
				sPrime.velocity = $V([0, 0, 0]);
				sPrime.acceleration = $V([0, 0, 0]);
			}
	
		}

	}


				
}

