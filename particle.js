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

function stateMultScalar(stateVector, scalar){
	var s = new Array(ARRAY_SIZE);

	for(var i = 0; i < NUMBER_OF_POINTS; i++){
		
		var objectIndex = i * PROPERTIES_PER_AGENT;
		s[objectIndex] = stateVector[objectIndex]*scalar;
		s[objectIndex+1] = stateVector[objectIndex+1]*scalar;
		s[objectIndex+2] = stateVector[objectIndex+2]*scalar;
		s[objectIndex+3] = stateVector[objectIndex+3]*scalar;
		s[objectIndex+4] = stateVector[objectIndex+4]*scalar;
		s[objectIndex+5] = stateVector[objectIndex+5]*scalar;


	}

	return s;
}

function stateAddState(a, b){
	var s = new Array(ARRAY_SIZE);

	for(var i = 0; i < NUMBER_OF_POINTS; i++){
		
		var objectIndex = i * PROPERTIES_PER_AGENT;
		s[objectIndex] = a[objectIndex] +b[objectIndex];
		s[objectIndex+1] = a[objectIndex+1] +b[objectIndex+1];
		s[objectIndex+2] = a[objectIndex+2] +b[objectIndex+2];
		s[objectIndex+3] = a[objectIndex+3] +b[objectIndex+3];
		s[objectIndex+4] = a[objectIndex+4] +b[objectIndex+4];
		s[objectIndex+5] = a[objectIndex+5] +b[objectIndex+5];


	}

	return s;
}

function calculateStateDynamics(a, t){
	var dsSize = 20;
	var dsDist = 30;
	var dsCent = $V([0, 100, 0]);
	var dynamicsArray = new Array((NUMBER_OF_POINTS * 6));
	//gravity to start with
	for (i = 0; i < NUMBER_OF_POINTS; i++){
		var objectindex = i*PROPERTIES_PER_AGENT;
		var dynamicsIndex = i*6;
		dynamicsArray[dynamicsIndex] = a[objectindex+3];
		dynamicsArray[dynamicsIndex+1] = a[objectindex+4];
		dynamicsArray[dynamicsIndex+2] = a[objectindex+5];

		var acceleration = force(i, t, a[objectindex+7], a).multiply(1/a[objectindex+6]);
	
		
		dynamicsArray[dynamicsIndex+3] = acceleration.e(1);
		dynamicsArray[dynamicsIndex+4] = acceleration.e(2);
		dynamicsArray[dynamicsIndex+5] = acceleration.e(3);

	}
	//strut your stuff
	for (var i = 0; i < struts.length; i++){
		var sForce = $V([0, 0, 0]);
		var vi = vertices[struts[i].vertices[0]];
		var vj = vertices[struts[i].vertices[1]];
		var xij = vj.p.subtract(vi.p);
		var magxij = magnitude(xij);
		var dirxji = xij.toUnitVector();
		var distance = magxij - (struts[i].l);
		var withK = distance * struts[i].k;
		var sForce = dirxji.multiply(withK);
		var iIndex = struts[i].vertices[0] * 6;
		var jIndex = struts[i].vertices[1] * 6;

		var velDist = vj.v.subtract(vi.v);
		var ineerTerm = (velDist).dot(dirxji);
		ineerTerm = ineerTerm * struts[i].d;
		var dampForce = dirxji.multiply(ineerTerm);
		var a1 = sForce.add(dampForce);
		var a2 = a1.multiply(-1);
		a1 = a1.multiply((1/7));
		a2 = a2.multiply((1/7));
/*
		if(magnitude(a1) > 5){
			a1 = a1.toUnitVector().multiply(5);
			a2 = a2.toUnitVector().multiply(5);

		}*/

		dynamicsArray[iIndex+3] = dynamicsArray[iIndex+3] + a1.e(1);
		dynamicsArray[iIndex+4] = dynamicsArray[iIndex+4] + a1.e(2);
		dynamicsArray[iIndex+5] = dynamicsArray[iIndex+5] + a1.e(3);
		dynamicsArray[jIndex+3] = dynamicsArray[jIndex+3] + a2.e(1);
		dynamicsArray[jIndex+4] = dynamicsArray[jIndex+4] + a2.e(2);
		dynamicsArray[jIndex+5] = dynamicsArray[jIndex+5] + a2.e(3);


	}
	for(var i = 0; i < torsions.length; i++){
		var x0 = vertices[torsions[i].x0].p;
		var x0i = torsions[i].x0;
		var x1 = vertices[torsions[i].x1].p;
		var x1i = torsions[i].x1;

		var x2 = vertices[torsions[i].x2].p;
		var x2i = torsions[i].x2;

		var x3 = vertices[torsions[i].x3].p;
		var x3i = torsions[i].x3;

		var v1 = vertices[x1i].v;
		var v0 = vertices[x0i].v;
		var v2 = vertices[x2i].v;
		var v3 = vertices[x3i].v;


		var x02 = x2.subtract(x0);
		var x03 = x3.subtract(x0);
		var x01 = x1.subtract(x0)
		var h = x1.subtract(x0);
		var hhat = h.toUnitVector();
		var d02 = x02.dot(hhat);
		var d03 = x03.dot(hhat);
		var rl = hhat.multiply(d02);
		rl = x02.subtract(rl);
		var rr = hhat.multiply(d03);
		rr = x03.subtract(rr)
		var x12 = x2.subtract(x1);
		var x13 = x3.subtract(x1);
		var nl = x01.cross(x12).toUnitVector();
		var nr = x01.cross(x13).toUnitVector().multiply(-1);
		var theta = Math.atan((nl.cross(nr)).dot(hhat)/(nl.dot(nr)));
		var thetal = v2.dot(nl)/magnitude(rl);
		var thetar = v3.dot(nr)/magnitude(rr);
		var roe = hhat.multiply(torsions[i].k*(theta - torsions[i].rest) - torsions[i].d*(thetal+thetar))
		var f3 = nr.multiply(roe.dot(hhat)/magnitude(rr)).multiply(1/7);
		var f2 = nl.multiply(roe.dot(hhat)/magnitude(rl)).multiply(1/7);
		var f1 = f2.multiply(d02).add((f3.multiply(d03)));
		f1 = f1.multiply(-1/magnitude(x01)).multiply(1/7);



		//∂(f2.multiply(d02).add(f3.multiply(d03))).multiply(1/magnitude(x01)).multiply(-1/7);
		var f0 = f1.add(f2).add(f3).multiply(-1/70);
		if(magnitude(f0) > 10){
			f0 = a1.toUnitVector().multiply(10);

		}
if(magnitude(f1) > 10){
			f1 = a1.toUnitVector().multiply(10);

		}if(magnitude(f2) > 10){
			f2 = a1.toUnitVector().multiply(10);

		}if(magnitude(f3) > 10){
			f3 = a1.toUnitVector().multiply(10);

		}
		var xindex = x0i * 6;
		dynamicsArray[xindex+3] = dynamicsArray[xindex+3] + f0.e(1);
		dynamicsArray[xindex+4] = dynamicsArray[xindex+4] + f0.e(2);
		dynamicsArray[xindex+5] = dynamicsArray[xindex+5] + f0.e(3);

		var xindex = x1i * 6;
		dynamicsArray[xindex+3] = dynamicsArray[xindex+3] + f1.e(1);
		dynamicsArray[xindex+4] = dynamicsArray[xindex+4] + f1.e(2);
		dynamicsArray[xindex+5] = dynamicsArray[xindex+5] + f1.e(3);

		var xindex = x2i * 6;
		dynamicsArray[xindex+3] = dynamicsArray[xindex+3] + f2.e(1);
		dynamicsArray[xindex+4] = dynamicsArray[xindex+4] + f2.e(2);
		dynamicsArray[xindex+5] = dynamicsArray[xindex+5] + f2.e(3);

		var xindex = x3i * 6;
		dynamicsArray[xindex+3] = dynamicsArray[xindex+3] + f3.e(1);
		dynamicsArray[xindex+4] = dynamicsArray[xindex+4] + f3.e(2);
		dynamicsArray[xindex+5] = dynamicsArray[xindex+5] + f3.e(3);



	}
	return dynamicsArray;
}

function force(objectindex, t, objectName, a){
	var acceleration = $V([0, 0, 0]);
	var amax = 10;
	var ar = 10;
	
	if(objectName == 0 || objectName == 2){
		acceleration = acceleration.add($V([0, -20.8, 0]));
	}
	

	return acceleration;

}





function stateAddDynamics(a, d){
	var s = new Array(ARRAY_SIZE);

	for(var i = 0; i < NUMBER_OF_POINTS; i++){
		
		var objectIndex = i * PROPERTIES_PER_AGENT;
		var dIndex = i * 6;
		s[objectIndex] = a[objectIndex] + d[dIndex];
		s[objectIndex+1] = a[objectIndex+1] + d[dIndex+1];
		s[objectIndex+2] = a[objectIndex+2] + d[dIndex+2];
		s[objectIndex+3] = a[objectIndex+3] + d[dIndex+3];
		s[objectIndex+4] = a[objectIndex+4] + d[dIndex+4];
		s[objectIndex+5] = a[objectIndex+5] + d[dIndex+5];
		s[objectIndex+6] = a[objectIndex+6]
		s[objectIndex+7] = a[objectIndex+7]

	}

	return s;
}
function dynamicsAddDynamics(a, b){
	var s = new Array((NUMBER_OF_POINTS * 6));

	for(var i = 0; i < NUMBER_OF_POINTS; i++){
		
		var objectIndex = i * 6;
		s[objectIndex] = a[objectIndex] +b[objectIndex];
		s[objectIndex+1] = a[objectIndex+1] +b[objectIndex+1];
		s[objectIndex+2] = a[objectIndex+2] +b[objectIndex+2];
		s[objectIndex+3] = a[objectIndex+3] +b[objectIndex+3];
		s[objectIndex+4] = a[objectIndex+4] +b[objectIndex+4];
		s[objectIndex+5] = a[objectIndex+5] +b[objectIndex+5];


	}

	return s;
}

function dynamicsMultScalar(a, scalar){

	var s = new Array((NUMBER_OF_POINTS * 6));

	for(var i = 0; i < NUMBER_OF_POINTS; i++){
		
		var objectIndex = i * 6;
		s[objectIndex] = a[objectIndex]*scalar;
		s[objectIndex+1] = a[objectIndex+1]*scalar;
		s[objectIndex+2] = a[objectIndex+2]*scalar;
		s[objectIndex+3] = a[objectIndex+3]*scalar;
		s[objectIndex+4] = a[objectIndex+4]*scalar;
		s[objectIndex+5] = a[objectIndex+5]*scalar;


	}

	return s;
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
			console.log('PARTIAL');

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

function detectCollisions(s, snew, h, t){
	//for all vertices try each face
	var collisions = [];
	for(var i = 0; i < vertices.length; i++){
		for(var j = 0; j < faces.length; j++){
			if(vertices[i].pType == 2){
				var arrayIndex = i * PROPERTIES_PER_AGENT;

				var p = $V([s[arrayIndex], s[arrayIndex+1], s[arrayIndex+2]]);
				var pnew = $V([snew[arrayIndex], snew[arrayIndex+1], snew[arrayIndex+2]]);

				var basicDetails = verticeFaceBasicDetect(p, pnew, faces[j]);
				if(basicDetails.time > -1){
					var ts = basicDetails.time * h;
					var priorV = $V([s[arrayIndex+3], s[arrayIndex+4], s[arrayIndex+5]])
					var xHit = priorV.multiply(basicDetails.time*(h)).add(p);
					if(verticeFaceFullDetect(xHit, basicDetails.face)){
						var collisionVelocity = bounceAway(priorV, basicDetails.normal);
						var velFract = collisionVelocity.multiply((1-(ts/h))).multiply(h/2);
						//var velFract = collisionVelocity.multiply(1).multiply(h/2);
						var newPos = xHit.add(velFract)
						console.log('log here');

						snew[arrayIndex] = newPos.e(1);
						snew[arrayIndex+1] = newPos.e(2);
						snew[arrayIndex+2] = newPos.e(3);
						snew[arrayIndex+3] = collisionVelocity.e(1);
						snew[arrayIndex+4] = collisionVelocity.e(2);
						snew[arrayIndex+5] = collisionVelocity.e(3);
						collisions.push(basicDetails);
					}
				}
			}
				
			//for now only check against static faces 
			
		}
		//if 'easy collision' do full collision test
	}



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
	for(var j =0; j < vertices.length; j++){
	    vertices[j].fromArray(prek2, (j*PROPERTIES_PER_AGENT));

	 }
	//collision detect with prek2
	var collisions = detectCollisions(stateVector, prek2, timestep);

	if(collisions.length < 1 && runge){

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
		/*//minimize kadds
		for (i = 0; i < NUMBER_OF_POINTS; i++){
			var objectindex = i*PROPERTIES_PER_AGENT;
			var dynamicsIndex = i*6;
			var v = $V([kadds[dynamicsIndex], kadds[dynamicsIndex+1], kadds[dynamicsIndex+2]])
			var a = $V([kadds[dynamicsIndex+3], kadds[dynamicsIndex+4], kadds[dynamicsIndex+5]])
			if(magnitude(v) > 5){
				v = v.toUnitVector().multiply(5);
			}
			if(magnitude(a) > 2){
				a = a.toUnitVector().multiply(2);
			}


			kadds[dynamicsIndex] = v.e(1);
			kadds[dynamicsIndex+1] = v.e(2);
			kadds[dynamicsIndex+2] = v.e(3);
			
			kadds[dynamicsIndex+3] = a.e(1);
			kadds[dynamicsIndex+4] = a.e(2);
			kadds[dynamicsIndex+5] = a.e(3);

		}*/

		var sNew = stateAddDynamics(stateVector, kadds);

		for(var j =0; j < vertices.length; j++){
		    vertices[j].fromArray(prek2, (j*PROPERTIES_PER_AGENT));

		 }
		//collision detect with prek2
		//var collisions = detectCollisions(stateVector, sNew, timestep), t;



		return sNew;

	}else{
		return prek2;
	}




}



function initializeAWing(){
	awingFighter = new Particle($V([100, 100, 0]), $V([-30, 1, 0]), awing, 1, 1);
}

/*
function numericallyIntegrate(h){
	var sNew = new Array(ARRAY_SIZE);
	for (var i = 0; i < NUMBER_OF_POINTS; i++){
		var objectindex = i*PROPERTIES_PER_AGENT;
		var dynamicsIndex = i*6;
		sNew[objectindex] = a[objectindex] + (dynamicsArray[dynamicsIndex] * (h/1000));
		sNew[objectindex+1] = a[objectindex+1] + (dynamicsArray[dynamicsIndex+1] * (h/1000));
		sNew[objectindex+2] = a[objectindex+2] + (dynamicsArray[dynamicsIndex+2] * (h/1000));

		sNew[objectindex+3] = a[objectindex+3] + (dynamicsArray[dynamicsIndex+3] * (h/1000));
		sNew[objectindex+4] = a[objectindex+4] + (dynamicsArray[dynamicsIndex+4] * (h/1000));
		sNew[objectindex+5] = a[objectindex+5] + (dynamicsArray[dynamicsIndex+5] * (h/1000));
		var vel = $V([sNew[objectindex+3], sNew[objectindex+4], sNew[objectindex+5]]);
		if(magnitude(vel) > 100 && a[objectindex+7]==0){
			vel = vel.toUnitVector().multiply(100);
		}
		sNew[objectindex+3] = vel.e(1);
		sNew[objectindex+4] = vel.e(2);
		sNew[objectindex+5] = vel.e(3);

		sNew[objectindex+6] = a[objectindex+6];
		sNew[objectindex+7] = a[objectindex+7];

	}
	return sNew;
}*/





function Particle(position, velocity, rendering, mass, name){
	this.p = position;
	this.v = velocity;
	this.rendering = rendering;
	this.mass = mass;
	this.pName = name;
}

Particle.prototype.copyToStateArray = function(initIndex, vector){
	vector[initIndex] = this.p.e(1);
	vector[initIndex+1] = this.p.e(2);
	vector[initIndex+2] = this.p.e(3);

	vector[initIndex+3] = this.v.e(1);
	vector[initIndex+4] = this.v.e(2);
	vector[initIndex+5] = this.v.e(3);
	vector[initIndex+6] = this.mass;
	vector[initIndex+7] = this.pName;
}
Particle.prototype.copyFromStateArray = function(initIndex, vector){
	this.p.elements[0] = vector[initIndex];
	this.p.elements[1] = vector[initIndex+1];
	this.p.elements[2] = vector[initIndex+2];

	this.v.elements[0] = vector[initIndex+3];
	this.v.elements[1] = vector[initIndex+4];
	this.v.elements[2] = vector[initIndex+5];


	this.mass = vector[initIndex+6];
	this.pName = vector[initIndex+7];
}



function initializeTieFighters(){
	
	var forces = [];
	var generators = [];
	var pg = new PositionGensSphere(20);
	var dg = new DirectionGenSphere($V([-1, .5, 0]), .2);
	var sg = new SpeedGenN(0, .01);
	var gen = new FlockGenerator(pg, dg, sg, (NUMBER_OF_POINTS-1));
	var fighters = gen.generate(1, 0);
	for (var i = 0; i < fighters.length; i++){
		fighterArray.push(fighters[i]);
	}
}
function FlockGenerator(positionGen, directionGen, velocityGen, count){
	this.pg = positionGen;
	this.dg = directionGen;
	this.vg = velocityGen;
	this.count = count;
	this.t = 0;
}
FlockGenerator.prototype.generate = function(mass, type){
	var plist = [];	
		for(var i = 0; i < this.count; i++){
			var p = this.pg.generate(this.t);
			var d = this.dg.generate(this.t);
			var s = this.vg.generate(this.t);
			var v = d.multiply(s);
			p = offset(p, v, this.t);



			var rendering = makeSprite(p);
			var particle = new Particle(p, v, rendering, mass, type);
			plist.push(particle);
		}
	return plist;
}




function makeSprite(p){
	var j = pointsIndex;
	if(pointsIndex >= MAX_PARTS){
		pointsIndex = 0;
		j = 0;
	}
	pointsIndex++;
	points.geometry.vertices[j].x = p.e(1); 
	points.geometry.vertices[j].y = p.e(2); 

	points.geometry.vertices[j].z = p.e(3); 
	return j;
}

function UniformDist(min, max){
	this.min = min;
	this.max = max;
}

//taken from MDNS
function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}

function DirectionGenSphere(){

}
function SpeedGenN(mean, dev){
	this.m = mean;
	this.d = dev;
	this.guass =  gaussian(mean, dev);
}
SpeedGenN.prototype.generate = function(){
	return this.guass.ppf(Math.random());
}
DirectionGenSphere.prototype.generate = function(){
	var theta = getRandomArbitrary(-Math.PI, Math.PI);
	var height = getRandomArbitrary(-1, 1);
	var r = Math.sqrt((1-(height * height)));
	var x = r * Math.cos(theta);
	var y = height;
	var z = -r*Math.sin(theta);

	var vInit = $V([x, y, z]).toUnitVector();
	return vInit;
}
function PositionGensSphere(range){
	this.range = range;
}
PositionGensSphere.prototype.generate = function(){
	var theta = getRandomArbitrary(-Math.PI, Math.PI);
	var height = getRandomArbitrary(-1, 1);
	var r = Math.sqrt((1-(height * height)));
	var x = r * Math.cos(theta);
	var y = height;
	var z = -r*Math.sin(theta);

	var vInit = $V([x, y, z]).multiply(this.range);
	return vInit;
}
function ConstantPosition(p){
	this.p = p;
}
ConstantPosition.prototype.generate = function(){
	return this.p;
}
function offset(p, v, time){
	var u = Math.random();
	var off = v.multiply(u);
	var newP = p.add(off);
	return newP;

}

function DirectionGenGeyser(initDir, dev){
	this.d = initDir.toUnitVector();
	this.guass =  gaussian(0, dev/3);
	this.dev = dev;
}
DirectionGenGeyser.prototype.generate = function(){
	var a = $V([1, 0, 0]);
	var uz = this.d;
	var ux = (a.cross(uz)).toUnitVector();
	var uy = uz.cross(ux);
	//var m = $M([ux.elements, uy.elements, uz.elements]);
	var m = $M([
		[ux.e(1), uy.e(1), uz.e(1)],
		[ux.e(2), uy.e(2), uz.e(2)],
		[ux.e(3), uy.e(3), uz.e(3)]
		]
		);
	var f = Math.sqrt(Math.abs(this.guass.ppf(Math.random())));
	var ro = f * this.dev;
	var theta = getRandomArbitrary(-Math.PI, Math.PI);
	var vPrime = $V([
		(Math.cos(theta)*Math.sin(ro)),
		(Math.sin(theta)*Math.sin(ro)),
		Math.cos(ro)
		]);
	var v = m.multiply(vPrime);
	return v;
}










function ParticleGenerator(start, end, generationRate, positionGen, directionGen, speedGen, callback, props){
	this.s = start;
	this.end = end;
	this.r = generationRate;
	this.pGen = positionGen;
	this.dGen = directionGen;
	this.sGen = speedGen;
	this.rounded = 0;
	this.callback = callback;
	this.props = props;
	this.props.cocl = 0xFF0000;
}

ParticleGenerator.prototype.generate = function(time, timestep){
	
	if(time >= this.s && time < this.end){
		this.needReset = true;
		var particleNum = Math.floor((timestep/1000) * this.r);
		this.rounded += ((timestep/1000)*this.r) - particleNum;
		if(this.rounded >= 1){
			particleNum += Math.floor(this.rounded);
			this.rounded -= Math.floor(this.rounded);
		}
		for(var i = 0; i < particleNum; i++){
			var p = this.pGen.generate(time);
			var d = this.dGen.generate(time);
			var s = this.sGen.generate(time);
			var v = d.multiply(s);
			p = offset(p, v, time);



			var rendering = makeSprite(p, this.props.lcol);
			var particle = new Particle(p, v, $V([0, 0, 0]), rendering, this.props, time);
			particleList.push(particle);
		}

	}else if(this.needReset){
		this.needReset = false;
		this.callback(this, time);
	}


}



