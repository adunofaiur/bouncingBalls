var NUMBER_OF_AGENTS = 100;
var PROPERTIES_PER_AGENT = 8;
var TIE_FIGHTER = 0;
var A_WING = 1;
var STAR_DESTROYER = 2;
var LASER = 3;
var ARRAY_SIZE = NUMBER_OF_AGENTS * PROPERTIES_PER_AGENT;
var stateArray = new Array(ARRAY_SIZE);
var dynamicsArray =  new Array((NUMBER_OF_AGENTS * 6));
var fighterArray = new Array();
var forceArray = new Array();




function force(objectindex, t, objectName){
	var k = 1;
	var actualIndex = objectindex / PROPERTIES_PER_AGENT;
	var acceleration = $V([0, 0, 0]);
	for(var j = 0; j < NUMBER_OF_AGENTS; j++){

		if(j != actualIndex){
			var xij = $V([ (-stateArray[objectindex] + stateArray[j*PROPERTIES_PER_AGENT]),
						   (-stateArray[objectindex+1] + stateArray[j*PROPERTIES_PER_AGENT+1]),
						   (-stateArray[objectindex+2] + stateArray[j*PROPERTIES_PER_AGENT+2])
				]);
			var distance = magnitude(xij);
			var direction = xij.toUnitVector();
			var avoidance = direction.multiply((-0/distance));
			var matching = $V([
				(-stateArray[objectindex+3] + stateArray[j*PROPERTIES_PER_AGENT+3]),
				(-stateArray[objectindex+4] + stateArray[j*PROPERTIES_PER_AGENT+4]),
				(-stateArray[objectindex+5] + stateArray[j*PROPERTIES_PER_AGENT+5])
				]);
			matching = matching.multiply(0);
			var centering = xij.multiply(0);
			acceleration = acceleration.add(avoidance);
			acceleration = acceleration.add(matching);
			acceleration = acceleration.add(centering);
		}
	}
	return acceleration;

}


function numericallyIntegrate(h){
	var sNew = new Array(ARRAY_SIZE);
	for (var i = 0; i < NUMBER_OF_AGENTS; i++){
		var objectindex = i*PROPERTIES_PER_AGENT;
		var dynamicsIndex = i*6;

		sNew[objectindex] = stateArray[objectindex] + (dynamicsArray[dynamicsIndex] * (h/1000));
		sNew[objectindex+1] = stateArray[objectindex] + (dynamicsArray[dynamicsIndex+1] * (h/1000));
		sNew[objectindex+2] = stateArray[objectindex] + (dynamicsArray[dynamicsIndex+2] * (h/1000));

		sNew[objectindex+3] = stateArray[objectindex] + (dynamicsArray[dynamicsIndex+3] * (h/1000));
		sNew[objectindex+4] = stateArray[objectindex] + (dynamicsArray[dynamicsIndex+4] * (h/1000));
		sNew[objectindex+5] = stateArray[objectindex] + (dynamicsArray[dynamicsIndex+5] * (h/1000));
		sNew[objectindex+6] = stateArray[objectindex+6];
		sNew[objectindex+7] = stateArray[objectindex+7];

	}
	return sNew;
}

function calculateStateDynamics(t){
	
	for (i = 0; i < NUMBER_OF_AGENTS; i++){
		var objectindex = i*PROPERTIES_PER_AGENT;
		var dynamicsIndex = i*6;
		dynamicsArray[dynamicsIndex] = stateArray[objectindex+3];
		dynamicsArray[dynamicsIndex+1] = stateArray[objectindex+4];
		dynamicsArray[dynamicsIndex+2] = stateArray[objectindex+5];

		var acceleration = force(i, t, stateArray[objectindex+7]).multiply(1/stateArray[objectindex+6]);
		dynamicsArray[dynamicsIndex+3] = acceleration.e(1);
		dynamicsArray[dynamicsIndex+4] = acceleration.e(2);
		dynamicsArray[dynamicsIndex+5] = acceleration.e(3);

	}
}




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
	var pg = new ConstantPosition($V([0, 0, 0]));
	var dg = new DirectionGenGeyser($V([-1, .5, 0]), .2);
	var sg = new SpeedGenN(0, .01);
	var gen = new FlockGenerator(pg, dg, sg, NUMBER_OF_AGENTS);
	var fighters = gen.generate(10000, 0);
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



