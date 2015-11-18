var NUMBER_OF_POINTS = 101;
var PROPERTIES_PER_AGENT = 8;
var TIE_FIGHTER = 0;
var A_WING = 1;
var STAR_DESTROYER = 2;
var LASER = 3;
var ARRAY_SIZE = NUMBER_OF_POINTS * PROPERTIES_PER_AGENT;
//var dynamicsArray =  new Array((NUMBER_OF_POINTS * 6));
var fighterArray = new Array();
var forceArray = new Array();
var stateArray = new Array(ARRAY_SIZE);

function magnitude(sylvVect){
	var mag = Math.sqrt(Math.pow(sylvVect.e(1), 2) + Math.pow(sylvVect.e(2), 2)  + Math.pow(sylvVect.e(3), 2)); 
	return mag;
}

function sameSign(a, b){
	if(a*b >= 0){
		return true;
	}
	else{
		return false;
	}
}

function RigidArray(p, m, r, a){
	this.p = p
	this.momentum = m
	this.orientation = r;
	this.angularMomentum = a
}

RigidArray.prototype.init = function(){
	this.p = $V([0,0,0])
	this.momentum = $V([0,0,0]);
	this.orientation = new THREE.Quaternion();
	this.orientation.setFromAxisAngle (new THREE.Vector3(0, 1,0), 0);
	this.angularMomentum = $V([0, .1, .1]);

}

function RigidDynamics(v, omegaR, lf, af){
	this.v = v;
	this.omegaR = omegaR;
	this.lf = lf;
	this.af = af;
}


function stateMultScalar(state, scalar){
	var s = new RigidArray();
	s.p = state.p.dup();
	s.momentum = state.momentum.dup()
	s.orientation = state.orientation.clone();
	s.orientation.multiply(scalar);
	s.angularMomentum = state.angularMomentum.dup();
	s.p = s.p.multiply(scalar);
	s.momentum = s.momentum.multiply(scalar);
	s.angularMomentum = s.angularMomentum.multiply(scalar);
	return s;
}

function stateAddState(a, b){
	var s = new RigidArray();
	s.p = a.p.add(b.p);
	s.momentum = a.momentum.add(b.momentum);
	s.orientation = a.orientation.clone();
	s.orientation = s.orientation.multiply(b.orientation);
	s.orientation.normalize();
	s.angularMomentum = a.angularMomentum.add(b.angularMomentum);
	
	return s;
}




function stateAddDynamics(a, d){
	var s = new RigidArray();

	s.p = a.p.add(d.v);
	s.momentum = a.momentum.add(d.lf);
	s.angularMomentum = a.angularMomentum.add(d.af);
	//qaut stuff here
	s.orientation = a.orientation.clone();
	//s.orientation.multiply(d.omegaR);
	s.orientation.x = d.omegaR.x + s.orientation.x; 
		s.orientation.y = d.omegaR.y + s.orientation.y; 
	s.orientation.z = d.omegaR.z + s.orientation.z; 
	s.orientation.w = d.omegaR.w + s.orientation.w; 
	s.orientation.normalize();
	return s;
}
function dynamicsAddDynamics(a, b){
	var s = new RigidDynamics();
	s.v = a.v.add(b.v);
	s.af = a.af.add(b.af);
	s.lf = a.lf.add(b.lf);
	s.omegaR = new THREE.Quaternion();
	s.omegaR.x = a.omegaR.x + b.omegaR.x; 
	s.omegaR.y = a.omegaR.y + b.omegaR.y; 
	s.omegaR.z = a.omegaR.z + b.omegaR.z; 
	s.omegaR.w = a.omegaR.w + b.omegaR.w; 

	return s;
}

function dynamicsMultScalar(a, scalar){

	var s = new RigidDynamics();
	s.v = a.v.multiply(scalar);
	s.af = a.af.multiply(scalar);
	s.lf = a.lf.multiply(scalar);
		//orientation
	s.omegaR = a.omegaR.clone();
	s.omegaR.x = s.omegaR.x * scalar;
	s.omegaR.y = s.omegaR.y * scalar;
	s.omegaR.z = s.omegaR.z * scalar;
	s.omegaR.w = s.omegaR.w * scalar;

	return s;
}

function mFromQuat(q){
	q.normalize();
	var m = $M([
		[1-(2*q.y*q.y)-(2*q.z*q.z), 2*q.x * q.y  - 2*q.z * q.w, 2* q.x * q.z + 2 * q.y * q.w],
		[2 * q.x * q.y + 2 * q.z * q.w, 1 - 2 * q.x * q.x - 2 * q.z * q.z, 2*q.y*q.z - 2*q.x*q.w],
		[2*q.x*q.z-2*q.y*q.w, 2*q.y*q.z + 2*q.x * q.w, 1 - 2 * q.x * q.x - 2 *q.y * q.y]
		]);
	return m;
}
//Linear force gravity
//Ang force: noooone
var oneAnd = 0;
function calculateStateDynamics(a, t){
	var d = new RigidDynamics();
	d.v = a.momentum.multiply((1/myBody.mass));
	var m4 = new THREE.Matrix4();
	m4.makeRotationFromQuaternion(a.orientation);
	//orientation
	var R = $M([
		[m4.elements[0], m4.elements[1], m4.elements[2]],
		[m4.elements[4], m4.elements[5], m4.elements[6]],
		[m4.elements[8], m4.elements[9], m4.elements[10]]

		]);

	var inverseMoment = myBody.momentOfInertia().transpose();
	var ineg =  R.transpose().multiply(inverseMoment).multiply(R);
	var omegaga = ineg.multiply(a.angularMomentum);
	var omegaQ = new THREE.Quaternion();
	omegaQ.setFromAxisAngle (new THREE.Vector3(omegaga.e(1), omegaga.e(2), omegaga.e(3)), magnitude(omegaga));
	omegaQ.multiply(a.orientation);

	var scalar = (1.0/2.0);
	omegaQ.x = omegaQ.x * scalar;
	omegaQ.y = omegaQ.y * scalar;
	omegaQ.z = omegaQ.z * scalar;
	omegaQ.w = omegaQ.w * scalar;
	d.omegaR = omegaQ;
	d.af = $V([0, 0, 0]); 
	if(t > 2 && t < 3 && (oneAnd == 0)){
		//var impactPoint = $V([-10, -10, -10]);
		var impulse = $V([10, 0, 0]);
		//var r = impactPoint.subtract(a.p);
		//d.af = d.af.add(r.cross(impulse));
		d.af = d.af.add(impulse);
		oneAnd++;
	}

	d.lf = $V([0, -9.8, 0]);

	return d;
}




function verticeFaceBasicDetect(pos1, pos2, face){


	var anchor = vertices[face.vertices[0]].p;
	var a1 = anchor;
	var a3 = vertices[face.vertices[1]].p;
	var a2 = vertices[face.vertices[2]].p;
	/*
	var nx = ((a2.e(2) - a1.e(2)) * (a3.e(3) - a1.e(3))) - ((a3.e(2) - a1.e(2)) * (a2.e(3) - a1.e(3)));
	var ny = ((a2.e(3) - a1.e(3)) * (a3.e(1) - a1.e(1))) - ((a2.e(1) - a1.e(1)) * (a3.e(3) - a1.e(3)));
	var nz = ((a2.e(1) - a1.e(1)) * (a3.e(2) - a1.e(2))) - ((a3.e(1) - a1.e(1)) * (a2.e(2) - a1.e(2)));*/
	var e = a2.subtract(a1);
	var e2 = a3.subtract(a2);

	var normal = e.cross(e2).toUnitVector();

	var pointInPlane1 = pos1.subtract(anchor);
	var dist1 = pointInPlane1.dot(normal);
	var pointInPlane2 = pos2.subtract(anchor);
	var dist2 = pointInPlane2.dot(normal);
	
	if(sameSign(dist1, dist2)){

		return {time: -1};
	}
	else{
		var fract = dist1 / (dist1 - dist2);

		return {time: fract, normal: normal, face: face}
	}

}

function verticeFaceFullDetect(xHit, face){

	var pXHit = $V([xHit.e(1), xHit.e(3)]);
	var pEdges = [];
	var edges = face.vertices;

	for(var i = 0; i< edges.length; i++){
		

		pEdges.push($V([vertices[edges[i]].p.e(1), vertices[edges[i]].p.e(3)]));
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

	//manual coding for square intersections
/*	var e1 = pEdges[1].subtract(pEdges[0]);
	var hit0 = pXHit.subtract(pEdges[0]);
	var e2 = pEdges[3].subtract(pEdges[1]);
	var hit1 = pXHit.subtract(pEdges[1]);
	var e3 = pEdges[2].subtract(pEdges[1]);
	var hit2 = pXHit.subtract(pEdges[3]);
	var e4 = pEdges[0].subtract(pEdges[2]);
	var hit3 = pXHit.subtract(pEdges[2]);

	var m = $M([e1.elements, hit0.elements]);
	var d = m.det();
	if(d < 0){
		pMatDets.push('+');
	}else{
		pMatDets.push('-');
	}
	m = $M([e2.elements, hit1.elements]);
	d = m.det();
	if(d < 0){
		pMatDets.push('+');
	}else{
		pMatDets.push('-');
	}
	m = $M([e3.elements, hit2.elements]);
	d = m.det();
	if(d < 0){
		pMatDets.push('+');
	}else{
		pMatDets.push('-');
	}
	m = $M([e4.elements, hit3.elements]);
	d = m.det();
	if(d < 0){
		pMatDets.push('+');
	}else{
		pMatDets.push('-');
	}*/
	var sign = pMatDets[0];	
	for(var i = 0; i < pMatDets.length; i++){
		if(sign != pMatDets[i]){
			return false;
		}
	}
	console.log('FULL');
	return true;

}

function bounceAway(v, planeNormal, t){
		var ELASTIC_COEFFICIENT = .8;

	if(t){
	var ELASTIC_COEFFICIENT = 1;

	}

	var normalVel = v.dot(planeNormal);
	normalVel = planeNormal.multiply(normalVel);
	
	var tangVel = v.subtract(normalVel);
	var elasticResp = normalVel.multiply(-ELASTIC_COEFFICIENT);
	var frictResp = tangVel.multiply(1-FRICTION_COEFFICIENT);

	var finalVel = elasticResp.add(frictResp);
	return finalVel;
}



function sanityChecks(p1, p2, q1, q2){
	if (p1.e(1) < q1.e(1) && p2.e(1) < q2.e(1) && p1.e(1) < q2.e(1) && p2.e(1) < q1.e(1)){
		return false;
	}

	if(p1.e(2) < q1.e(2) && p2.e(2) < q2.e(2) && p1.e(2) < q2.e(2) && p2.e(2) < q1.e(2)){
		return false;		
	}
	if(p1.e(3) < q1.e(3) && p2.e(3) < q2.e(3) && p1.e(3) < q2.e(3) && p2.e(3) < q1.e(3)){
		return false;		
	}

	if (p1.e(1) > q1.e(1) && p2.e(1) > q2.e(1) && p1.e(1) > q2.e(1) && p2.e(1) > q1.e(1)){
		return false;
	}

	if(p1.e(2) > q1.e(2) && p2.e(2) > q2.e(2) && p1.e(2) > q2.e(2) && p2.e(2) > q1.e(2)){
		return false;		
	}
	if(p1.e(3) > q1.e(3) && p2.e(3) > q2.e(3) && p1.e(3) > q2.e(3) && p2.e(3) > q1.e(3)){
		return false;		
	}
	return true;
}

function bestGuessXHit(s, snew, plane, h, t){
	for(var i = 2; i < 5; i++){
		var tslice = h/i;
		var firstDynamics = calculateStateDynamics(s, t);
		var firstHalfState = rungeKutta(s, firstDynamics, (1000*tslice), t, calculateStateDynamics);
		var secondDynamics = calculateStateDynamics(s, (t+tslice));
		var secondHalfState = rungeKutta(firstHalfState, secondDynamics, (1000*tslice), (t+tslice), calculateStateDynamics);
		var firstCol = detectCollisions(s, firstHalfState, (tslice*1000), t);
		var secondCol = detectCollisions(firstHalfState, secondHalfState, (tslice*1000), (t+tslice));
		console.log(firstCol.length);
		console.log(secondCol.length);

	}
}
function detectCollisions(s, snew, h, t){
	//for all vertices try each face
	var collisions = [];

	for(var i = 0; i < myBody.vertices.length; i++){
		for(var j = 0; j < faces.length; j++){
			var arrayIndex = i * PROPERTIES_PER_AGENT;
			var m4 = new THREE.Matrix4();
				m4.makeRotationFromQuaternion(s.orientation);
				//orientation
			var rotateS = $M([
				[m4.elements[0], m4.elements[1], m4.elements[2]],
				[m4.elements[4], m4.elements[5], m4.elements[6]],
				[m4.elements[8], m4.elements[9], m4.elements[10]]

				]);
			var m42 = new THREE.Matrix4();
			m42.makeRotationFromQuaternion(snew.orientation);
			var rotateSN = rotateS = $M([
				[m42.elements[0], m42.elements[1], m42.elements[2]],
				[m42.elements[4], m42.elements[5], m42.elements[6]],
				[m42.elements[8], m42.elements[9], m42.elements[10]]

				]);
			var p = rotateS.multiply(myBody.vertices[i].p).add(s.p);
			var pnew = rotateSN.multiply(myBody.vertices[i].p).add(snew.p);

			var basicDetails = verticeFaceBasicDetect(p, pnew, faces[j]);
			if(basicDetails.time > -1){
				/*var ts = basicDetails.time * h;
				var priorV = $V([s[arrayIndex+3], s[arrayIndex+4], s[arrayIndex+5]])
				var xHit = priorV.multiply(basicDetails.time*(h)).add(p);*/
				console.log('partial');
				if(verticeFaceFullDetect(p, basicDetails.face)){
				//	var collisionVelocity = bounceAway(priorV, basicDetails.normal);
				//	var velFract = collisionVelocity.multiply((1-(ts/h))).multiply(h/2);
					//var velFract = collisionVelocity.multiply(1).multiply(h/2);
				//	var newPos = xHit.add(velFract)
				bestGuessXHit(s, snew, null, h, t);
				/*	console.log('log here');
					
					snew[arrayIndex] = newPos.e(1);
					snew[arrayIndex+1] = newPos.e(2);
					snew[arrayIndex+2] = newPos.e(3);
					snew[arrayIndex+3] = collisionVelocity.e(1);
					snew[arrayIndex+4] = collisionVelocity.e(2);
					snew[arrayIndex+5] = collisionVelocity.e(3);*/
					collisions.push(basicDetails);
				}
			}
			
				
			//for now only check against static faces 
			
		}
		//if 'easy collision' do full collision test
	}

/*

	for(var i = 0; i < edges.length; i++){
		var p1 = vertices[edges[i].start].p;
		var p2 = vertices[edges[i].end].p;
		for (var j = 0; j < edges.length; j++){
			if(i != j){
				var q1 = vertices[edges[j].start].p;
				var q2 = vertices[edges[j].end].p;
				var a = p2.subtract(p1);
				var b = q2.subtract(q1);
				var ahat = a.toUnitVector();
				var bhat = b.toUnitVector();
				var n = q2.subtract(q1).cross(p2.subtract(p1)).toUnitVector();
				var r = q1.subtract(p1);
				var s = (r.dot(bhat.cross(n)))/(a.dot(bhat.cross(n)))
				var t = r.multiply(-1).dot(ahat.cross(n))/(b.dot(ahat.cross(n)));
				var pa = p1.add(a.multiply(s));
				var qa = q1.add(b.multiply(t));

				var m = qa.subtract(pa);
			
					if(edgeColMatrix[i][j] == undefined){
						edgeColMatrix[i][j] = m;
					}else{
						if (edgeColMatrix[i][j].dot(m) < 0){
							if(sanityChecks(p1, p2, q1, q2)){

								//super simple collisions are handles like point-face
								//and i only allow dyanmic:static collisions
								if(vertices[edges[i].start].pType == 0 || vertices[edges[i].start].pType == 2 || vertices[edges[i].start].pType == 3){
									var p1v = vertices[edges[i].start].v;
									var p2v = vertices[edges[i].end].v;
									//ADD MASS YOU PROCSTINATING BLERG HEAD!
									var p1vadd = bounceAway(p1v, n).multiply(1);
									var p2vadd = bounceAway(p2v, n).multiply(1);
									var p1i = edges[i].start * PROPERTIES_PER_AGENT;
									var p2i = edges[i].end * PROPERTIES_PER_AGENT;


									var p1npos = p1.add(p1vadd);
									var p2npos = p2.add(p2vadd);

									snew[p1i] = p1npos.e(1);
									snew[p1i+1] = p1npos.e(2);
									snew[p1i+2] = p1npos.e(3);
									snew[p1i+3] = p1vadd.e(1);
									snew[p1i+4] = p1vadd.e(2);
									snew[p1i+5] = p1vadd.e(3);

									snew[p2i] = p2npos.e(1);
									snew[p2i+1] = p2npos.e(2);
									snew[p2i+2] = p2npos.e(3);
									snew[p2i+3] = p2vadd.e(1);
									snew[p2i+4] = p2vadd.e(2);
									snew[p2i+5] = p2vadd.e(3);

								}else if (vertices[edges[j].start].pType == 0 || vertices[edges[j].start].pType == 2 || vertices[edges[j].start].pType == 3){
									var q1v = vertices[edges[j].start].v;
									var q2v = vertices[edges[j].end].v;
									//ADD MASS YOU PROCSTINATING BLERG HEAD!
									var q1vadd = bounceAway(q1v, n).multiply(1/7);
									var q2vadd = bounceAway(q2v, n).multiply(1/7);
									var q1i = edges[j].start * PROPERTIES_PER_AGENT;
									var q2i = edges[j].end * PROPERTIES_PER_AGENT;


									var q1npos = q1.add(q1vadd);
									var q2npos = q2.add(q2vadd);

									snew[q1i] = q1npos.e(1);
									snew[q1i+1] = q1npos.e(2);
									snew[q1i+2] = q1npos.e(3);
									snew[q1i+3] = q1vadd.e(1);
									snew[q1i+4] = q1vadd.e(2);
									snew[q1i+5] = q1vadd.e(3);

									snew[q2i] = q2npos.e(1);
									snew[q2i+1] = q2npos.e(2);
									snew[q2i+2] = q2npos.e(3);
									snew[q2i+3] = q2vadd.e(1);
									snew[q2i+4] = q2vadd.e(2);
									snew[q2i+5] = q2vadd.e(3);
								}


							collisions.push({});
												edgeColMatrix[i][j] = undefined;

							console.log('edge edge yo')
						}else{
							edgeColMatrix[i][j] = m;

						}
					}
				}
			}
		}
	}


*/

	return collisions;
	//for each edge try each edge 
}

function rungeKutta(stateVector, stateVectorForced, timestep, t, forceFunction){



	
//note: all k's are dynamic arrays
//preK's are states
//forceFunction:: state -> dynamics
	var k1 = stateVectorForced;
	var prek2 = dynamicsMultScalar(k1, (timestep/2.0));
	prek2 = stateAddDynamics(stateVector, prek2);

	//return prek2;

	//collision detect with prek2
	var collisions = detectCollisions(stateVector, prek2, timestep, t);
	if(collisions.length > 1 ){
		console.log('fucking wrecked mate');
	}
	//if(collisions.length < 1 && runge){

		var k2 = forceFunction(prek2, (t+(timestep/2.0)));

		var prek3 = dynamicsMultScalar(k2, (timestep/2.0));
		prek3 = stateAddDynamics(stateVector, prek3);
		var k3 = forceFunction(prek3, (t+(timestep/2.0)));

		var prek4 = dynamicsMultScalar(k3, timestep);
		prek4 = stateAddDynamics(stateVector, prek4);
		var k4 = forceFunction(prek4, (t+timestep));

		var k22 = dynamicsMultScalar(k2, 2);
		var k32 = dynamicsMultScalar(k3, 2);
		var kadds = dynamicsAddDynamics(k1, k22);
		kadds = dynamicsAddDynamics(kadds, k32);
		kadds = dynamicsAddDynamics(kadds, k4);
		kadds = dynamicsMultScalar(kadds, (timestep/6.0));


		var sNew = stateAddDynamics(stateVector, kadds);
		/*collisions = detectCollisions(stateVector, sNew, timestep); 
		if(collisions.length > 0){
			return sNew;*/
		/*}else{
			for(var j =0; j < vertices.length; j++){
		    	vertices[j].fromArray(prek2, (j*PROPERTIES_PER_AGENT));
		 	}
		}*/

		//collision detect with prek2
		//var collisions = detectCollisions(stateVector, sNew, timestep), t;

		sNew.orientation.normalize();

		return sNew;

/*	}else{
		return prek2;
	}*/




}




