



function VectorForce(vector){
	this.force = vector;
	this.forceType = "vector";
}

function ColumbPoint(anchor, constant, rendering){
	this.anchor = anchor;
	this.constant = constant;
	this.charge = -1;
	this.forceType = "columb";
	this.rendering = rendering;
}


function State(forces, generators, time){
	this.forces = forces;
	this.generators = generators;
	this.t = time;
}
function GravityPoint(p, g, r, rendering){
	this.p = p;
	this.g = g;
	this.r = r;
	this.rendering = rendering;
	this.forceType = 'gravp';
}


function accelerate(particle, forces){
	
	particle.a = $V([0, 0, 0])
	//generic forces
	for(var i = 0; i < forces.length; i++){
		var force = forces[i];
		if(force.forceType == 'vector'){
			particle.a = particle.a.add(force.force);
		}else if(force.forceType == 'gravp'){
			var xaihat = particle.p.subtract(force.p);
			var rai = magnitude(xaihat);
			xaihat = xaihat.multiply(1/rai);
			var scalars = -force.g / (Math.pow(rai, force.r));
			particle.a = particle.a.add(xaihat.multiply(scalars));
		}


		/*else if(force.forceType == "columb"){
			var cNormal = moveable.position.subtract(force.anchor).toUnitVector();
			var dist = magnitude(moveable.position.subtract(force.anchor)) - 2;
			if((dist*dist < .0001)){
				dist = .01;
			}
			var cForce = cNormal.multiply(force.constant / (dist*dist));
			moveable.acceleration = moveable.acceleration.add(cForce);
		}*/
	}
	//air res, hardcoded
	var airOverG = AIR_RESISTANCE / particle.mass;
	particle.a = particle.a.subtract(particle.a.multiply(airOverG));

}
function velocerate(particle, ts){
	
	var oldAccel = particle.priorA.multiply(ts/1000);
	particle.v = particle.priorV.add(oldAccel);

}

function reposition(particle, ts, collision){
	
	if(!collision){
		var finalMove = particle.priorV.add(particle.v);
		finalMove = finalMove.multiply(.5);
		finalMove = finalMove.multiply(ts/1000);

		particle.p = particle.p.add(finalMove);
	}else{
		var finalMove = particle.v.multiply(ts/1000);

		particle.p = particle.p.add(finalMove);

	}
	
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
			if(pos2.e(2) < -10 && pos1.e(2) >= -10 && collidable.anchor.e(2) == -10){
				console.log('p1: ' + pos1.e(2) + " p2: " + pos2.e(2) );
			}

			return {time: -1};
		}
		else{
			var fract = dist1 / (dist1 - dist2);

			return {time: fract, normal: collidable.normal, collidable: collidable}
		}

	}

}
function detectCollision(particle, priorP){
	var responses = [];
	for(var i = 0; i < GLOBAL_COLLIDABLES.length; i++){
		
		var fract = didCollide(GLOBAL_COLLIDABLES[i], GLOBAL_COLLIDABLES[i].col_type, particle.p, priorP);
	
		if (fract.time > -1){
			responses.push(fract);
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

function collisionVelocerate(particle, planeNormal){
	
	var ELASTIC_COEFFICIENT = particle.elasticity;

	var normalVel = particle.v.dot(planeNormal);
	normalVel = planeNormal.multiply(normalVel);
	
	var tangVel = particle.v.subtract(normalVel);
	var elasticResp = normalVel.multiply(-ELASTIC_COEFFICIENT);
	var frictResp = tangVel.multiply(1-FRICTION_COEFFICIENT);

	var finalVel = elasticResp.add(frictResp);
	particle.v = finalVel;

}

function isResting(particle){
	if(magnitude(particle.v) < .4 && particle.p.e(2) < -9.95){
		console.log('stahp')
		return true;
	}

	return false;

}

function didItReallyCollide(xHit, edges){

	var pXHit = $V([xHit.e(1), xHit.e(3)]);
	var pEdges = [];
	for(var i = 0; i< edges.length; i++){
		pEdges.push($V([edges[i].e(1), edges[i].e(3)]));
	}
	var pMatDets = [];
	for(var i =0; i< pEdges.length; i++){
		var edge;
		if(i == (pEdges.length-1)){
			edge = pEdges[0].subtract(pEdges[i]);

		}else{
			edge = pEdges[i+1].subtract(pEdges[i]);

		}
		var e2 = pXHit.subtract(pEdges[i]);
		var m = $M([edge.elements, e2.elements]);
		var d = m.det();
		if(d < 0){
			pMatDets.push('+');
		}else{
			pMatDets.push('-');
		}

	}

	var sign = pMatDets[0];	
	for(var i = 0; i < pMatDets.length; i++){
		if(sign != pMatDets[i]){
			return false;
		}
	}
	return true;



}



/*
function eulerStep(state){
	

	for (var i = 0; i < state.generators.length; i++){
		state.generators[i].generate(state.t, timeStep);
	}

	

	for(var i = 0; i < particleList.length; i++){
	
		var t = 0;
		var timeStepRemaining =  timeStep - t;
		var ts = timeStep;
		var particle = particleList[i];
		if(particle.killme <= state.t){
			particle.resting = true;
			particle.p.elements[0] = -12000;
			particle.v = $V([0, 0, 0]);
			particle.a = $V([0, 0, 0]);
		}
		while(timeStepRemaining > 0 && !particle.resting){

			var priorP = particle.p.dup();

			accelerate(particle, state.forces);
			velocerate(particle, ts);
			reposition(particle, ts);
			particle.priorA = particle.a;
			particle.priorV = particle.v;
			var collisionDetails = detectCollision(particle, priorP);

			if(collisionDetails.length == 1){
					ts = collisionDetails[0].time * timeStep;
					//single response
					var detail = collisionDetails[0];
					var xHit = particle.priorV.multiply(detail.time*(timeStep/1000)).add(priorP);

					//extra collision stuff
					if(didItReallyCollide(xHit, detail.collidable.verts)){
						particle.a = particle.priorA;
						particle.v = particle.priorV;
						particle.p = priorP;
						accelerate(particle, state.forces);
						velocerate(particle, ts);
						collisionVelocerate(particle, detail.normal);
						reposition(particle, ts, true);

						particle.priorA = particle.a;
						particle.priorV = particle.v;
						points.geometry.colors[particle.rendering] = new THREE.Color(particle.colColor);


						timeStepRemaining = timeStepRemaining - ts
						if(timeStepRemaining < .1){
							timeStepRemaining = 0;
						}
					}
					
				
				
				

			}else if(collisionDetails.length > 1){
				//I'm cheating very grossly for this case. move in the direction of th
				var newNormal = $V([0, 0, 0]);
				for(var k = 0; k < collisionDetails.length; k++){
					newNormal = newNormal.add(collisionDetails[k].normal);
				}
				newNormal = newNormal.toUnitVector();


				points.geometry.colors[particle.rendering] = new THREE.Color(0xFF0000);

			}
			else{
				timeStepRemaining = 0;
			}
			
			if(isResting(particle)){
				particle.v = $V([0, 0, 0]);
				particle.a = $V([0, 0, 0]);
				particle.resting = true;
				timeStepRemaining = 0;
			}

		}

	
	}

	
			state.t += (timeStep/1000);


				
}*/

