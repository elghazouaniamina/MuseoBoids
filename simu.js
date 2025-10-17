import * as THREE from 'three';


import {Visu} from './visu.js';

class Simu extends Visu {

    constructor(){
        super();
        this.annuaire = {};
        this.acteurs = [];
    }

    act(dt){
	    this.acteurs.forEach(a => {
					a.composants.forEach(c => {c.executer();})
				   }) ; 
				   
	    this.acteurs.forEach(a => a.act(dt)) ; 	
    }

    creerActeur(nom,typeActeur,params){
        const acteur = new typeActeur(nom, params, this);
        this.acteurs.push(acteur);
        this.enregistrer(nom, acteur);     
        return acteur ;    
    }

    enregistrer(nom,entite){this.annuaire[nom] = entite;}
    chercher(nom){return this.annuaire[nom] || null ; }

}



export  {Simu} ; 
