
import * as THREE from 'three';


import {OBJLoader} from '../threejs/r146/examples/jsm/loaders/OBJLoader.js' ; 
import {MTLLoader} from '../threejs/r146/examples/jsm/loaders/MTLLoader.js' ; 


var PRIMS3D = {} ; 

PRIMS3D.materiauBlanc = new THREE.MeshLambertMaterial({color:0xffffff}) ; 
PRIMS3D.filDeFer      = new THREE.MeshBasicMaterial({color:0xff0000,wireframe:true}) ; 

PRIMS3D.creerGroupe = function(nom){
	var groupe = new THREE.Group() ; 
	groupe.name = nom ; 
	return groupe ; 
}


PRIMS3D.creerSphere = function(nom,options){
	var rayon        = options.rayon        || 1.0 ; 
	var subdivisions = options.subdivisions || 16 ; 
	var materiau     = options.materiau     || PRIMS3D.filDeFer ; 
	
	var geo  = new THREE.SphereGeometry(rayon, subdivisions, subdivisions) ; 
	var mesh = new THREE.Mesh(geo, materiau) ; 
	mesh.name = nom ; 
	return mesh ;  
}

PRIMS3D.creerBoite = function(nom,options){
	var largeur    = options.largeur   || 1.0 ; 
	var hauteur    = options.hauteur   || 1.0 ; 
	var epaisseur  = options.epaisseur || 1.0 ; 
	var materiau   = options.materiau  || PRIMS3D.materiauBlanc ; 
	
	var geo  = new THREE.BoxGeometry(largeur, hauteur, epaisseur) ;
	var mesh = new THREE.Mesh(geo, materiau) ; 
	mesh.name = nom ; 
	return mesh ; 
}

PRIMS3D.creerSol = function(nom,options){ 
	var largeur    = options.largeur    || 100.0 ; 
	var profondeur = options.profondeur || largeur ; 
	var materiau   = options.materiau   || PRIMS3D.filDeFer ; 
	
	var geo   = new THREE.PlaneGeometry(
					largeur,profondeur,
					Math.floor(largeur/10.0)+1, Math.floor(profondeur/10)+1) ; 
	var mesh  = new THREE.Mesh(geo,materiau) ; 
	mesh.name = nom ;
	mesh.rotation.x = - Math.PI / 2 ;
	return mesh ;   
}

PRIMS3D.creerCloison = function(nom,options){
	var largeur   = options.largeur   || 1.0 ; 
	var hauteur   = options.hauteur   || 1.0 ; 
	var epaisseur = options.epaisseur || 1.0 ; 
	var materiau  = options.materiau  || PRIMS3D.filDeFer ; 
	
	var geo  = new THREE.BoxGeometry(largeur, hauteur, epaisseur) ; 
	var mesh = new THREE.Mesh(geo, materiau) ;
	var groupe = new THREE.Group() ; 
	groupe.name = nom ;
	groupe.add(mesh) ; 
	mesh.position.set(0,hauteur/2.0,0) ;  
	return groupe ;  	
} 

PRIMS3D.creerPoster = function(nom,options){
	var largeur = options.largeur || 1.0 ;
	var hauteur = options.hauteur || 1.0 ; 
	var nomImage = options.nomImage ;
	
	var geo    = new THREE.PlaneGeometry(largeur, hauteur) ; 
	var mat    = PRIMS3D.creerMateriauTexture(nomImage, 0xffffff) ; 
	var mesh   = new THREE.Mesh(geo, mat) ; 
    	mesh.name  = "poster_"+nom ; 
	var dos    = new THREE.Mesh(geo, PRIMS3D.materiauBlanc) ; 
	dos.rotation.y = Math.PI ; 
	dos.position.z = -0.01 ; 
	mesh.position.z = 0.01 ; 

	var groupe = new THREE.Group() ; 
	groupe.add(mesh) ; 
	groupe.add(dos) ;  
	groupe.name  = nom ;
	return groupe ;   
}


	



// ====================
// Traitement de meshes
// ====================

PRIMS3D.placer = function(mesh,x,y,z){
	mesh.position.set(x,y,z)  ; 
}

PRIMS3D.orienter = function(mesh,y){
	mesh.rotation.y = y ; 
}


PRIMS3D.fixerEchelleMesh = function(mesh,sx,sy,sz){
	mesh.scale.set(sx,sy,sz) ; 
}

PRIMS3D.placerSous = function(fils,pere){
	pere.add(fils) ; 
}



// ===================
// Création de sources
// ===================

PRIMS3D.creerSourcePonctuelle = function(couleur, intensite, portee, attenuation){
	var light = new THREE.PointLight(couleur,intensite,portee,attenuation) ;  
	return light ; 
}

PRIMS3D.creerSoleil = function(intensite){
	var h = new THREE.HemisphereLight(0xffffbb,0x080820,intensite) ; 
	return h ; 
}

// =====================
// Création de matériaux
// =====================

/*
var materiauBlanc  = creerLambert(0xffffff) ; 
var materiauRouge  = creerLambert(0xff0000) ;
var materiauVert   = creerLambert(0x00ff00) ; 

var materiauParquet = creerLambertTexture("assets/textures/sol/parquet1.jpg",0xffffff,10,10) ; 
var materiauDante   = creerLambertTexture("assets/textures/murs/dante.jpg",0xffffff,1,1) ;
var materiauBrique  = creerLambertTexture("assets/textures/murs/bricks3.jpg",0xffffff,6,2) ;
*/

/*
PRIMS3D.creerMateriau = function(options){
	var couleur = options.couleur || 0xffffff ;
  	var mat = new THREE.MeshStandardMaterial({color:couleur}) ; 
	return mat ; 
}
*/

var textureLoader = new THREE.TextureLoader() ; 

PRIMS3D.creerMateriau = function(oPars){
	var opts = {} ; 
	opts.color = oPars.couleur || 0xffffff ; 
	var image  = oPars.image   || null ; 
	var nx     = oPars.nx      || 1 ; 
	var ny     = oPars.ny      || 1 ; 
	if(image){
		opts.map = textureLoader.load(image) ; 
	} ;
	var mat = new THREE.MeshStandardMaterial(opts) ; 
	if(image){
		mat.map.wrapS = THREE.RepeatWrapping ; 
		mat.map.wrapT = THREE.RepeatWrapping ; 
		mat.map.repeat.set(nx,ny) ; 
	} ; 
	return mat ; 
}

PRIMS3D.creerMateriauTexture = function(nomImage,couleur,nx,ny){
	var textureLoader = new THREE.TextureLoader() ; 
	var texture = textureLoader.load(nomImage) ; 
	var mat = new THREE.MeshStandardMaterial({color:couleur,map:texture}) ; 
	nx = nx ||   1 ; 
	ny = ny ||   1 ; 
	mat.map.wrapS = THREE.RepeatWrapping ;
	mat.map.wrapT = THREE.RepeatWrapping ;
	mat.map.repeat.set(nx,ny) ; 
	return mat ; 
}



PRIMS3D.chargerOBJ = function(nom,repertoire,nomObj,nomMtl){
  const resultat = new THREE.Group() ; 
  
  const objLoader = new OBJLoader() ; 
  const mtlLoader = new MTLLoader() ; 
  mtlLoader.setPath(repertoire) ;
  mtlLoader.load(nomMtl, function(materials){
  				materials.preload() ; 
  				objLoader.setMaterials(materials);
  				objLoader.setPath(repertoire) ; 
  				objLoader.load(nomObj, function(obj){resultat.add(obj);})
  			  }) ;
  				
  
  
 
  return resultat ;
}



PRIMS3D.creerCiel = function(nom,repertoire,format){


	
	var urls = [
		repertoire + 'right' + format, repertoire + 'left' + format,
		repertoire + 'top' + format, repertoire + 'bottom' + format,
		repertoire + 'front' + format, repertoire + 'back' + format
	] ; 
	
	var skyBox = new THREE.CubeTextureLoader().load(urls) ; 
	
	return skyBox ; 
}





export  {PRIMS3D} ;
