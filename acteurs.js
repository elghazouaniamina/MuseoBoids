

import * as THREE from 'three';

function removeArrayElement(array,x){
	const ndx = array.indexOf(x) ; 
	if(ndx >= 0){
		array.splice(ndx,1) ; 
	}
}

class Acteur {

    constructor(nom, params,simu){
        this.nom     = nom  ; 
        this.simu    = simu ;
        this.objet3d = null;  
        this.composants = [];
    }

    incarnePar(obj){
	    this.objet3d = obj ; 
        this.simu.scene.add(obj);
	    return this ; 
    }

    placeEn(x,y,z){
	    if(this.objet3d){
		    this.objet3d.position.set(x,y,z) ; 
	    }
    }

    setPosition(v){
        if(this.objet3d != null){
            this.objet3d.position.copy(v) ; 
        }
    }

    getPosition(pos){
        if(this.objet3d != null){
            pos.copy(this.objet3d.position) ; 
        }
    }

    orienteSelon(rx,ry,rz){
	    if(this.objet3d){
		    this.objet3d.rotation.set(rx,ry,rz) ; 	
        }
	}

    attacheA(autreEntite){
	    if(this.objet3d && autreEntite.objet3d){
		    autreEntite.objet3d.add(this.objet3d) ; 
	    } ; 
	    return this ; 
}

    ajouterComposant(typeComposant,params){
        const comp = new typeComposant(params,this);
        return this ; 
    }

    enleverComposant(composant){
	    removeArrayElement(this.composants, composant) ; 
    }

// Renvoie la référence sur la première instance de la classe TypeComposant retrouvée dans la liste des composants

    chercherComposant(TypeComposant){
	    return this.composants.find(c => {c instanceof TypeComposant;}) ;
    }

    act(dt){}
}


class Newton extends Acteur {

    constructor(nom, params, simu){
        super(nom, params, simu);
        this.masse = params.masse || 1.0 ; 
        this.vitesse = new THREE.Vector3(0,0,0);
        this.acceleration   = new THREE.Vector3(0,0,0);
    }

    appliquerForce(f){
        this.acceleration.addScaledVector(f,1.0/this.masse);
    }

    act(dt){
        if(this.objet3d != null){
            this.objet3d.position.addScaledVector(this.vitesse,dt) ; 
            this.vitesse.addScaledVector(this.acceleration,dt) ; 
            this.acceleration.set(0,0,0);
        }
    }

}





const ACTEURS = {
    newton : Newton,
    acteur : Acteur
} ; 

export {ACTEURS};
