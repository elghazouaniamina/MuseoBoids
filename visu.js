

import * as THREE from 'three';

import {ControleurCamera} from './controleur.js' ; 

class Visu {

	constructor(){
	    this.scene    = this.creationScene({}) ; 
	    this.camera   = this.creationCamera({}) ;
	    this.renderer = this.creationRenderer({});
	
	    this.horloge = 0.0;
	    this.chrono = new THREE.Clock();	
	}

    animation(){
	    const dt = this.chrono.getDelta();
	    this.horloge += dt ; 
        this.control.update(dt);
	    this.act(dt);
	    this.renderer.render(this.scene, this.camera);
    }

    act(dt){}

    debutSimulation(){
	    window.addEventListener('resize', ()=>{this.onResize();}, false);
	    this.renderer.setAnimationLoop(()=>{this.animation();});
	    this.onResize();
	    this.chrono.start();
    }

    onResize(){
		this.camera.aspect = window.innerWidth / window.innerHeight ;
	    this.camera.updateProjectionMatrix() ; 
        this.renderer.setSize(window.innerWidth,window.innerHeight) ; 
    }

    creationRenderer(data){
        const rd  = new THREE.WebGLRenderer({antialias:true, alpha:true}) ;

        rd.setSize(window.innerWidth, window.innerHeight) ; 
        document.body.appendChild(rd.domElement) ; 

        rd.physicallyCorrectLights = true ; 
        rd.toneMappingExposure = Math.pow(0.68,5) ; 

        return rd ;
    }

    creationScene(data){
    	const scn = new THREE.Scene() ; 
	    scn.background = new THREE.Color('skyblue') 
    	return scn ; 
    }



    creationCamera(data){
    	data           = data     || {} ; 
    	const fov      = data.fov || 45 ;
    	const aspect   = window.innerWidth / window.innerHeight ;
    	const near     = data.near || 0.1 ;
    	const far      = data.far  || 500 ; 
    	const position = data.position || new THREE.Vector3(5.0,1.7,5.0) ;  

    	const cam = new THREE.PerspectiveCamera(fov, aspect, near, far) ; 
    	cam.position.set(position.x, 1.7, position.z) ; 

    	const ctl = new ControleurCamera(this, cam) ; 

    	this.control  = ctl ; 

    	return cam ; 
    }

}



export {Visu} ; 
