import * as THREE from 'three';
// ======================================================================================================================
// Implémentation de la classe qui permet un contrôle interactif de la caméra virtuelle
// ======================================================================================================================

//import * as THREE from './frameworks/three/r120/build/three.module.js' ;
//import {PRIMS3D} from './prims3d.js' ;
var PI_2 = Math.PI / 2.0 ;

var ControleurCamera = function(simulateur,object){

	this.simulateur      = simulateur ;
	this.object          = object ;
	this.container       =  document.getElementById('container') ;
	this.blocker         =  document.getElementById('blocker') ;
	this.controlsEnabled = false ;
	// this.nombre_elem_servante = 0;

	this.current_position="";
	// this.list_cables= new Array();
	// this.first_borne=null;
	// this.second_borne=null;
	// Le repère de l objet
	this.position  = new THREE.Vector3(6,1.7,9) ;
	this.right     = new THREE.Vector3() ;
	this.up        = new THREE.Vector3() ;
	this.at        = new THREE.Vector3() ;

	this.euler      = new THREE.Euler(0.0,0.0,0.0,'YXZ') ;
	this.quaternion = new THREE.Quaternion() ;

	this.object.matrix.extractBasis(this.right, this.up, this.at) ;

	this.angle     = 0.0 ;
	this.direction = new THREE.Vector3(1,0,0) ;
	this.cible     = new THREE.Vector3(2,1.7,5) ;

	this.angle1 = PI_2;
	this.angle2 = - PI_2;

	this.vitesse   = 5.0 ;

	this.vitesseAngulaireMax = 0.05 ;
	this.tauxRotation        = 0.0  ;
	this.controlActif        = false ;


	this.plusHaut  = false ;
	this.plusBas   = false ;
	this.enAvant   = false ;
	this.enArriere = false ;
	this.aGauche   = false ;
	this.aDroite   = false ;

	this.mouseClicked = false ;
	this.mouse     = new THREE.Vector2() ;
	this.raycaster = new THREE.Raycaster() ;

	this.world = null ;
	this.origin = new THREE.Vector3() ;
	this.ext = new THREE.Vector3() ;

	this.getPointerLock() ;

	this.activerClavier() ;

}

ControleurCamera.prototype.getPointerLock = function(){
	console.log("FOO : getPointerLock") ;
	var that = this ;
	document.addEventListener('pointerlockchange',function(){that.lockChange();}, false) ;
	document.addEventListener('mousemove',function(e){that.onMouseMove(e);}, false);
	document.onclick = function(e){
				// container.requestPointerLock();
				console.log("mouseClicked")
				document.body.requestPointerLock() ;

				//call the method that catch objects ?
				that.mouseDown(e);
	}
}

ControleurCamera.prototype.lockChange = function(){

    if (document.pointerLockElement === document.body) {
        // Hide blocker and instructions
        //this.blocker.style.display = "none";
        this.controlsEnabled = true;
    // Turn off the controls
    } else {
      // Display the blocker and instruction
      //  this.blocker.style.display = "";
      this.controlsEnabled = false;
    }
}

ControleurCamera.prototype.onMouseMove = function(e){
	if(this.controlsEnabled==false) return ;

	//console.log("MOUSE MOVE") ;

	var dx = e.movementX || e.mozMovementX || e.webkitMovementX || 0 ;
	var dy = e.movementY || e.mozMovementY || e.webkitMovementY || 0 ;

	//console.log(dx, ' - ', dy) ;

 	this.angle1 -= dx*0.002 ;

	if (this.angle2 - dy * 0.002 <= 0 && this.angle2 - dy * 0.002 > -3.0) {
		this.angle2 -= dy * 0.002 ;
	}
}


ControleurCamera.prototype.update = function(dt){

	this.object.matrix.extractBasis(this.right, this.up, this.at) ;

	if(this.plusHaut)
		this.position.y += this.vitesse * dt ;

	if(this.plusBas)
		this.position.y -= this.vitesse * dt ;

	if(this.aGauche)
		//this.angle += 0.05 ;
		this.position.addScaledVector(this.right,-this.vitesse*dt) ;


	if(this.aDroite)
		//this.angle -= 0.05 ;
		this.position.addScaledVector(this.right,this.vitesse*dt) ;

	if(this.enAvant){
		this.position.x +=  this.vitesse * dt * Math.cos(this.angle1) ;
		this.position.z += -this.vitesse * dt * Math.sin(this.angle1) ;
	}

	if(this.enArriere){
		this.position.x -=  this.vitesse * dt * Math.cos(this.angle1) ;
		this.position.z -= -this.vitesse * dt * Math.sin(this.angle1) ;
	}

	this.object.position.copy(this.position) ;

	this.direction.set(Math.cos(this.angle),0.0,-Math.sin(this.angle1)) ;


	if(mouseClicked) {
		this.object.position.set(ext.x,ext.y,ext.z);
		this.position.set(ext.x,ext.y,ext.z);
		this.cible.set(origin.x,origin.y,origin.z);
		this.direction.set(origin.x-ext.x,origin.y-ext.y,origin.z-ext.z) ;
		this.angle = -Math.atan2(this.direction.z,this.direction.x);

		mouseClicked = false ;

	} else {
			this.cible.set(this.position.x + Math.cos(this.angle1),
				this.position.y + Math.cos(this.angle2),
				this.position.z - Math.sin(this.angle1))
		//console.log("angle1: "+this.angle1)
		//console.log("angle2: "+this.angle2)


	} ;

	this.object.lookAt(this.cible) ;


}





ControleurCamera.prototype.keyUp = function(event){
	switch(event.keyCode){
		case 33 : // HAUT
			this.plusHaut = false ;
			break ;
		case 34 : // BAS
			this.plusBas = false ;
			break ;
		case 37 : // GAUCHE
			this.aGauche = false ;
			break ;
		case 38 : // HAUT
			this.enAvant = false ;
			break ;
		case 39 : // DROITE
			this.aDroite = false ;
			break ;
		case 40 : // BAS
			this.enArriere = false ;
			break ;
	}
}



ControleurCamera.prototype.keyDown = function(event){
	//mouseClicked=false;
	console.log("KEYDOWN") ;
	switch(event.keyCode){
		case 33 : // HAUT
			this.plusHaut = true ;
			break ;
		case 34 : // BAS
			this.plusBas = true ;
			break ;
		case 49 :
			//this.goTable();
			break;
		case 50 :
			//this.goEtagere();
			break;
		case 51 :
			//this.goTableau();
			break;
		case 37 : // GAUCHE
		    this.aGauche = true ;
		    break ;
		case 38 : // HAUT
		    this.enAvant = true ;
		    break ;
		case 39 : // DROITE
		    this.aDroite = true ;
		    break ;
		case 40 : // BAS
		    this.enArriere = true ;
		    break ;
	}
}

var mouse     = new THREE.Vector2() ;
var raycaster = new THREE.Raycaster() ;
var mouseClicked = false ;
var world = null ;
var origin = new THREE.Vector3() ;
var ext = new THREE.Vector3() ;



var mx, my, mdx, mdy ;

ControleurCamera.prototype.mouseMove = function(event){



}

ControleurCamera.prototype.mouseDown = function(event){
	event.preventDefault() ;
	this.mouse.x = 0 ;
	this.mouse.y = 0 ;

	this.raycaster.setFromCamera(this.mouse, this.simulateur.camera) ;
	var objects = [];


	var intersects = this.raycaster.intersectObjects(objects,true);

			// 	that.mouse.x = (event.clientX/window.innerWidth)*2-1 ;
			// 	that.mouse.y = (-event.clientY/window.innerHeight)*2+1 ;

			// 	that.raycaster.setFromCamera(that.mouse, that.simulateur.camera) ;
			// 	var raycaster = new THREE.Raycaster()
			// 	var INTERSECTED;
			// 	console.log(that.simulateur.scene.children)


			// 	var intersects = raycaster.intersectObjects(that.simulateur.scene.children,true) ;

			// 	console.log("intersects : " + intersects)


			// 	if ( intersects.length > 0 ) {
			// 			INTERSECTED = intersects[0].object;
			// 			console.log("intercepter : ");
			// 			console.log(INTERSECTED)
			// 	// 	}
			// }


}



ControleurCamera.prototype.activerClavier = function(){
	var that = this ;
	window.addEventListener('keyup',   function(e){that.keyUp(e);},   false) ;
	window.addEventListener('keydown', function(e){that.keyDown(e);}, false) ;
}

export { ControleurCamera } ;
