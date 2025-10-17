import * as THREE from 'three';

import {PRIMS3D} from './prims3d.js'

class Composant {

    constructor(params, acteur){
        this.acteur = acteur ; 
    }

    devenirRecurrent(){
        this.acteur.composants.push(this);
    }

    executer(){}

}

// Composants d'animation
// ======================

class Alea extends Composant {
    
    constructor(params, acteur){
        super(params, acteur);
        this.devenirRecurrent() ; 
        this.p        = params.p || 0.1 ; 
        this.dx       = params.dx || 1.0 ; 
        this.position = new THREE.Vector3(0,0,0);
    }

    executer(){
        const p = Math.random() ; 
        if(p<this.p){
            this.acteur.getPosition(this.position);
            this.position.x += (0.5-Math.random())*0.1 ; 
            this.acteur.setPosition(this.position);
        }
    }
}

class MouvementAleatoire extends Composant {

    constructor(params, acteur){
        super(params, acteur);
        this.devenirRecurrent();
        this.puissance = params.puissance || 10.0 ;
        this.alea      = params.alea      || 1.0 ; 
        this.force     = new THREE.Vector3(0,0,0);
    }

    executer(){
        const p = Math.random() ; 
        if(p<this.alea){
            this.acteur.appliquerForce(this.force);
            const x = (0.5-Math.random());
            const z = (0.5-Math.random());
            this.force.set(x,0,z);
            this.force.normalize() ;
            this.force.multiplyScalar(this.puissance);
            this.acteur.appliquerForce(this.force);
        }
    }

}

class RegardesLaOuTuVas extends Composant {

    constructor(params, acteur){
        super(params, acteur);
        this.devenirRecurrent();
        this.cible = new THREE.Vector3(0,0,0);
    }

    executer(){
        this.cible.copy(this.acteur.objet3d.position);
        this.cible.addScaledVector(this.acteur.vitesse,1.0);
        this.acteur.objet3d.lookAt(this.cible);
    }

}




// Composants de création d'objets 3d
// ==================================

class Sphere extends Composant {

    constructor(params, acteur){
        super(params, acteur);
        params = params || {} ; 
        const centre = params.centre || {} ; 
        const rayon  = params.rayon  || 0.5 ; 
        const materiau = params.materiau || PRIMS3D.filDeFer ; 

	    const sph = PRIMS3D.creerSphere("sphere",{rayon:rayon,materiau:materiau}) ; 
	    acteur.incarnePar(sph) ;  
    }

}

class Cloison extends Composant {

    constructor(params, acteur){
        super(params, acteur);
        params = params || {} ; 
        const larg   = params.largeur    || 5.0 ; 
        const haut   = params.hauteur    || 3.0 ; 
        const epais  = params.epaisseur  || 0.05 ;
        const materiau = params.materiau || Prims3D.filDeFer ;   

        const cloison = PRIMS3D.creerCloison("cloison", {materiau:materiau,hauteur:haut, largeur:larg, epaisseur:epais});
        acteur.incarnePar(cloison);
         
    }

}

class Sol extends Composant {

    constructor(params, acteur){
        super(params, acteur);
        params = params || {} ; 
        const larg     = params.largeur    || 100.0 ; 
        const prof     = params.profondeur || 100.0 ; 
        const materiau = params.materiau   || Prims3D.filDeFer ;

        const sol = PRIMS3D.creerSol("sol",{largeur:larg,longueur:prof,materiau});
        acteur.incarnePar(sol) ;  

         
    }

}


class Poster extends Composant {

    constructor(params, acteur){
        super(params, acteur);
        params = params || {};
        const largeur  = params.largeur || 1.0 ; 
        const hauteur  = params.hauteur || 1.0 ; 
        const nomImage = params.image ; 

        const poster = PRIMS3D.creerPoster("poster",{largeur:largeur, hauteur:hauteur, nomImage:nomImage}) ;

        acteur.incarnePar(poster);
    }
}




class Obj extends Composant {

    constructor(params, acteur){
        super(params, acteur);
        const obj = PRIMS3D.chargerOBJ("obj", params.repertoire, params.obj, params.mtl);
        this.acteur.incarnePar(obj);
    }
}

// Composants de placement
// =======================

class Position extends Composant{

    constructor(params, acteur){
        super(params, acteur);
        const x = params.x || 0.0 ; 
        const y = params.y || 0.0 ; 
        const z = params.z || 0.0 ; 
        acteur.placeEn(x,y,z);
    }
}

class Rotation extends Composant{

    constructor(params, acteur){
        super(params, acteur);
        const x = params.x || 0.0 ; 
        const y = params.y || 0.0 ; 
        const z = params.z || 0.0 ; 
        acteur.orienteSelon(x,y,z);
    }
}

class AttacheA extends Composant {

    constructor(params, acteur){
        super(params, acteur);
        const nomParent = params.parent || null ; 

        if(nomParent != null){
            const parent = acteur.simu.chercher(nomParent) ; 
            if(parent){
                acteur.attacheA(parent) ; 
            }
        }
    }

}

class MouvementRebond extends Composant {

    constructor(params, acteur) {
        super(params, acteur);
        this.devenirRecurrent();

        // Vitesse initiale aléatoire (direction)
        this.vitesse = new THREE.Vector3(
            (Math.random() - 0.5) * 0.1,
            0,
            (Math.random() - 0.5) * 0.1
        );

        // Limites du musée (20x20 m)
        this.limite = 10;
    }

    executer() {
        const obj = this.acteur.objet3d;
        if (!obj) return;

        // Déplacer le pingouin selon sa vitesse
        obj.position.add(this.vitesse);

        // Rebond sur les murs X
        if (obj.position.x > this.limite) {
            obj.position.x = this.limite;
            this.vitesse.x *= -1;
        } else if (obj.position.x < -this.limite) {
            obj.position.x = -this.limite;
            this.vitesse.x *= -1;
        }

        // Rebond sur les murs Z
        if (obj.position.z > this.limite) {
            obj.position.z = this.limite;
            this.vitesse.z *= -1;
        } else if (obj.position.z < -this.limite) {
            obj.position.z = -this.limite;
            this.vitesse.z *= -1;
        }

        // Ajuster la rotation pour regarder dans la direction du déplacement
        obj.rotation.y = Math.atan2(this.vitesse.x, this.vitesse.z);
    }
}

// question 3
class Steering extends Composant {
    constructor(params, acteur) {
        super(params, acteur);
        this.devenirRecurrent();

        // Cible unique ou liste de points
        this.cibles = [];
        if (Array.isArray(params.points)) {
            this.cibles = params.points.map(p => new THREE.Vector3(p.x, p.y || 0, p.z));
        } else if (params.point) {
            this.cibles = [new THREE.Vector3(params.point.x, params.point.y || 0, params.point.z)];
        }

        // Vitesse de déplacement
        this.vitesse = params.vitesse || 0.05;
        // Distance de tolérance pour s’arrêter
        this.tolerance = params.tolerance || 0.2;
        // Index de la cible actuelle
        this.courante = 0;
    }

    executer() {
        if (this.cibles.length === 0) return;

        const obj = this.acteur.objet3d;
        if (!obj) return;

        const cible = this.cibles[this.courante];
        const position = obj.position;
        const direction = new THREE.Vector3().subVectors(cible, position);
        const distance = direction.length();

        if (distance > this.tolerance) {
            // Normalise et déplace
            direction.normalize();
            position.addScaledVector(direction, this.vitesse);
            // Oriente le modèle vers sa direction de déplacement
            obj.rotation.y = Math.atan2(direction.x, direction.z);
        } else {
            // Passe à la cible suivante
            this.courante++;
            if (this.courante >= this.cibles.length) {
                // A atteint le dernier point → stop
                this.courante = this.cibles.length - 1;
            }
        }
    }
}

//// --- Ajouter ceci dans composants.js, dans la section "Composants d'animation" ---

class EloigneUtilisateur extends Composant {
    constructor(params, acteur) {
        super(params, acteur);
        this.devenirRecurrent();

        // distance seuil sous laquelle l'acteur commence à reculer
        this.seuil = (params && params.seuil) !== undefined ? params.seuil : 3.0;
        // vitesse de recul (en unités de position par tick)
        this.vitesse = (params && params.vitesse) !== undefined ? params.vitesse : 0.1;
        // limite du musée (distance max du centre sur x et z)
        this.limite = (params && params.limite) !== undefined ? params.limite : 10.0;
        // option: si true, l'acteur regarde dans la direction du mouvement (par défaut true)
        this.oriente = (params && params.oriente) !== undefined ? params.oriente : true;
    }

    executer() {
        // récupération de la caméra (l'utilisateur)
        const simu = this.acteur.simu;
        const cam = simu && simu.camera ? simu.camera : null;
        if (!cam) return;

        // position de l'acteur (préférence : objet 3D s'il existe)
        const obj = this.acteur.objet3d;
        let pos;
        let useObj = false;
        if (obj) {
            pos = obj.position;
            useObj = true;
        } else {
            pos = new THREE.Vector3();
            this.acteur.getPosition(pos);
        }

        // calcul vecteur acteur <- caméra (XZ)
        const camPos = cam.position;
        const diff = new THREE.Vector3().subVectors(pos, camPos);
        diff.y = 0; // on agit en plan XZ
        const dist = diff.length();

        if (dist < this.seuil && dist > 0.0001) {
            // direction normalisée pour reculer (s'éloigner de la camera)
            const dir = diff.normalize();

            // nouvelle position candidate
            const nouvelle = pos.clone().addScaledVector(dir, this.vitesse);

            // clamp dans les limites du musée (-limite .. +limite)
            nouvelle.x = Math.max(-this.limite, Math.min(this.limite, nouvelle.x));
            nouvelle.z = Math.max(-this.limite, Math.min(this.limite, nouvelle.z));

            // applique la position
            if (useObj) {
                obj.position.copy(nouvelle);
                if (this.oriente) {
                    // orienter l'acteur pour regarder dans la direction du déplacement (optionnel)
                    obj.rotation.y = Math.atan2(dir.x, dir.z);
                }
            } else {
                this.acteur.setPosition(nouvelle);
            }
        }
    }
}

class Boids extends Composant {
    constructor(params, acteur) {
        super(params, acteur);
        this.devenirRecurrent();
        params = params || {};
        this.neighborRadius = params.neighborRadius !== undefined ? params.neighborRadius : 3.0;
        this.separationDist = params.separationDist !== undefined ? params.separationDist : 0.8;
        this.maxSpeed = params.maxSpeed !== undefined ? params.maxSpeed : 0.08;
        this.maxForce = params.maxForce !== undefined ? params.maxForce : 0.02;

        this.weightSeparation = params.weightSeparation !== undefined ? params.weightSeparation : 1.5;
        this.weightAlignment  = params.weightAlignment  !== undefined ? params.weightAlignment  : 1.0;
        this.weightCohesion   = params.weightCohesion   !== undefined ? params.weightCohesion   : 1.0;

        // Leader (optionnel) : nom de l'acteur guide et poids d'attraction
        this.leaderName = params.leader || null;
        this.leaderWeight = params.leaderWeight !== undefined ? params.leaderWeight : 1.2;
        this.leaderActeur = null; // sera cherché dans la simu au runtime

        this.limite = params.limite !== undefined ? params.limite : 10.0;

        this.velocity = new THREE.Vector3(
            (Math.random() - 0.5) * this.maxSpeed,
            0,
            (Math.random() - 0.5) * this.maxSpeed
        );

        const simu = this.acteur.simu;
        if (simu) {
            if (!simu.boidsList) simu.boidsList = [];
            simu.boidsList.push(this.acteur);
        }
    }

    _limit(vec, max) {
        const len = vec.length();
        if (len > max) vec.multiplyScalar(max / len);
    }

    executer() {
        const obj = this.acteur.objet3d;
        if (!obj) return;
        const simu = this.acteur.simu;
        if (!simu || !simu.boidsList) return;

        // recherche lazy du leader si demandé
        if (this.leaderName && !this.leaderActeur) {
            this.leaderActeur = simu.chercher ? simu.chercher(this.leaderName) : null;
        }

        const pos = obj.position.clone();
        const steerSeparation = new THREE.Vector3(0,0,0);
        const steerAlignment  = new THREE.Vector3(0,0,0);
        const steerCohesion   = new THREE.Vector3(0,0,0);

        let countSeparation = 0;
        let countAlignment = 0;
        let countCohesion = 0;

        for (let otherAct of simu.boidsList) {
            if (otherAct === this.acteur) continue;
            const otherObj = otherAct.objet3d;
            if (!otherObj) continue;
            const otherPos = otherObj.position;
            const diff = new THREE.Vector3().subVectors(otherPos, pos);
            diff.y = 0;
            const d = diff.length();
            if (d < this.neighborRadius && d > 0) {
                const otherComp = otherAct.composants.find(c => c instanceof Boids);
                if (otherComp) {
                    steerAlignment.add(otherComp.velocity);
                    countAlignment++;
                }
                steerCohesion.add(otherPos);
                countCohesion++;
                if (d < this.separationDist) {
                    const diffAway = new THREE.Vector3().subVectors(pos, otherPos);
                    diffAway.normalize();
                    diffAway.divideScalar(d || 0.0001);
                    steerSeparation.add(diffAway);
                    countSeparation++;
                }
            }
        }

        const force = new THREE.Vector3(0,0,0);

        if (countSeparation > 0) {
            steerSeparation.divideScalar(countSeparation);
            steerSeparation.normalize();
            steerSeparation.multiplyScalar(this.maxSpeed);
            steerSeparation.sub(this.velocity);
            this._limit(steerSeparation, this.maxForce);
            steerSeparation.multiplyScalar(this.weightSeparation);
            force.add(steerSeparation);
        }

        if (countAlignment > 0) {
            steerAlignment.divideScalar(countAlignment);
            steerAlignment.normalize();
            steerAlignment.multiplyScalar(this.maxSpeed);
            steerAlignment.sub(this.velocity);
            this._limit(steerAlignment, this.maxForce);
            steerAlignment.multiplyScalar(this.weightAlignment);
            force.add(steerAlignment);
        }

        if (countCohesion > 0) {
            steerCohesion.divideScalar(countCohesion);
            steerCohesion.sub(pos);
            steerCohesion.normalize();
            steerCohesion.multiplyScalar(this.maxSpeed);
            steerCohesion.sub(this.velocity);
            this._limit(steerCohesion, this.maxForce);
            steerCohesion.multiplyScalar(this.weightCohesion);
            force.add(steerCohesion);
        }

        // Attraction vers le leader (si défini)
        if (this.leaderActeur && this.leaderActeur.objet3d) {
            const leaderPos = this.leaderActeur.objet3d.position;
            const toLeader = new THREE.Vector3().subVectors(leaderPos, pos);
            toLeader.y = 0;
            const dLeader = toLeader.length();
            if (dLeader > 0.001) {
                // calcul d'une force dirigée vers le leader
                const desired = toLeader.clone().normalize().multiplyScalar(this.maxSpeed);
                const steerLeader = desired.sub(this.velocity);
                this._limit(steerLeader, this.maxForce);
                steerLeader.multiplyScalar(this.leaderWeight);
                force.add(steerLeader);
            }
        }

        // Appliquer la force
        this.velocity.add(force);
        this._limit(this.velocity, this.maxSpeed);

        obj.position.add(this.velocity);

        // garder dans la salle
        if (obj.position.x > this.limite) obj.position.x = this.limite;
        if (obj.position.x < -this.limite) obj.position.x = -this.limite;
        if (obj.position.z > this.limite) obj.position.z = this.limite;
        if (obj.position.z < -this.limite) obj.position.z = -this.limite;

        if (this.velocity.lengthSq() > 1e-6) {
            obj.rotation.y = Math.atan2(this.velocity.x, this.velocity.z);
        }
    }
}
class ColoriseModel extends Composant {
    constructor(params, acteur) {
        super(params, acteur);
        this.devenirRecurrent();
        params = params || {};
        this.color = params.color !== undefined ? params.color : 0xff4500; // couleur par défaut (orange)
        this.applique = false;
    }

    executer() {
        if (this.applique) return;
        const obj = this.acteur.objet3d;
        if (!obj) return; // attend que le modèle soit chargé

        obj.traverse((child) => {
            if (child.isMesh && child.material) {
                try {
                    if (Array.isArray(child.material)) {
                        child.material.forEach(mat => {
                            if (mat.color) mat.color.setHex(this.color);
                            if (mat.emissive) mat.emissive.setHex(this.color);
                        });
                    } else {
                        const mat = child.material;
                        if (mat.color) mat.color.setHex(this.color);
                        if (mat.emissive) mat.emissive.setHex(this.color);
                    }
                } catch (e) {
                    // ignorer si matériau non standard
                }
            }
        });

        this.applique = true; // n'applique qu'une fois
    }
}

// Ajouter cette classe dans la section "Composants d'animation" de composants.js

class CameraBoid extends Composant {
    constructor(params, acteur) {
        super(params, acteur);
        params = params || {};
        this.devenirRecurrent();

        // caméra (peut être fournie explicitement ou récupérée via simu)
        this.camera = params.camera || (this.acteur && this.acteur.simu ? this.acteur.simu.camera : null);

        // paramètres de mouvement
        this.maxSpeed = params.maxSpeed !== undefined ? params.maxSpeed : 0.06;
        this.maxForce = params.maxForce !== undefined ? params.maxForce : 0.03;

        // poids des contributions
        this.targetWeight = params.targetWeight !== undefined ? params.targetWeight : 1.0;
        this.inputWeight = params.inputWeight !== undefined ? params.inputWeight : 0.8;

        // nom d'un acteur à suivre (optionnel)
        this.targetActorName = params.targetActorName || null;
        this.targetActeur = null;

        // vecteurs d'état
        this.velocity = new THREE.Vector3();
        this.acceleration = new THREE.Vector3();

        // flags input clavier
        this._keys = { w: false, a: false, s: false, d: false, q: false, e: false };

        // listener clavier (bind pour pouvoir retirer si nécessaire)
        this._onKeyDown = (ev) => {
            const k = ev.key.toLowerCase();
            if (k === 'w') this._keys.w = true;
            if (k === 's') this._keys.s = true;
            if (k === 'a') this._keys.a = true;
            if (k === 'd') this._keys.d = true;
            if (k === 'q') this._keys.q = true;
            if (k === 'e') this._keys.e = true;
        };
        this._onKeyUp = (ev) => {
            const k = ev.key.toLowerCase();
            if (k === 'w') this._keys.w = false;
            if (k === 's') this._keys.s = false;
            if (k === 'a') this._keys.a = false;
            if (k === 'd') this._keys.d = false;
            if (k === 'q') this._keys.q = false;
            if (k === 'e') this._keys.e = false;
        };

        // n'installe les listeners qu'une seule fois globalement
        if (!CameraBoid._listenersInstalled) {
            window.addEventListener('keydown', this._onKeyDown);
            window.addEventListener('keyup', this._onKeyUp);
            CameraBoid._listenersInstalled = true;
        }
    }

    _limit(vec, max) {
        const len = vec.length();
        if (len > max) vec.multiplyScalar(max / len);
    }

    executer() {
        // ne rien faire si la simulation n'a pas la caméra ou si le mode n'est pas 'boid'
        const simu = this.acteur && this.acteur.simu;
        if (!simu) return;

        // mode de contrôle : 'mouse' ou 'boid' (par défaut 'mouse')
        if (simu.cameraControlMode && simu.cameraControlMode !== 'boid') return;

        // s'assurer d'avoir la caméra
        if (!this.camera) this.camera = simu.camera;
        if (!this.camera) return;

        // lazy find target actor
        if (this.targetActorName && !this.targetActeur) {
            this.targetActeur = (simu.chercher) ? simu.chercher(this.targetActorName) : null;
        }

        // 1) calculer la contribution clavier/input (dans le repère caméra)
        const inputDir = new THREE.Vector3(0,0,0);
        if (this._keys.w) inputDir.z -= 1;
        if (this._keys.s) inputDir.z += 1;
        if (this._keys.a) inputDir.x -= 1;
        if (this._keys.d) inputDir.x += 1;
        if (this._keys.q) inputDir.y += 1; // monter
        if (this._keys.e) inputDir.y -= 1; // descendre

        if (inputDir.lengthSq() > 0) {
            inputDir.normalize();
            // transformer input local caméra → monde
            const camDir = new THREE.Vector3();
            this.camera.getWorldDirection(camDir); // forward
            camDir.y = 0;
            camDir.normalize();
            const up = new THREE.Vector3(0,1,0);
            const right = new THREE.Vector3().crossVectors(camDir, up).normalize();

            const worldInput = new THREE.Vector3();
            worldInput.addScaledVector(camDir, -inputDir.z); // getWorldDirection points toward -Z
            worldInput.addScaledVector(right, inputDir.x);
            worldInput.addScaledVector(up, inputDir.y);
            worldInput.normalize();
            worldInput.multiplyScalar(this.inputWeight);
            // ajouter comme accélération candidate
            this.acceleration.add(worldInput);
        }

        // 2) attraction vers une cible (si présente)
        if (this.targetActeur && this.targetActeur.objet3d) {
            const targetPos = this.targetActeur.objet3d.position;
            const toTarget = new THREE.Vector3().subVectors(targetPos, this.camera.position);
            toTarget.y = toTarget.y; // conserver hauteur si tu veux
            if (toTarget.lengthSq() > 1e-6) {
                toTarget.normalize();
                toTarget.multiplyScalar(this.targetWeight);
                this.acceleration.add(toTarget);
            }
        }

        // 3) appliquer la physique simple (steering)
        // desired = velocity + acc limited to maxSpeed then steer = desired - velocity limited to maxForce
        // ici on simplifie : appliquer acceleration limitée puis limiter vitesse
        this._limit(this.acceleration, this.maxForce);
        this.velocity.add(this.acceleration);
        this._limit(this.velocity, this.maxSpeed);

        // déplacer la caméra
        this.camera.position.add(this.velocity);

        // orienter la caméra : si target present, regarder target; sinon regarder dans direction de velocity
        if (this.targetActeur && this.targetActeur.objet3d) {
            const lookAtPos = this.targetActeur.objet3d.position;
            this.camera.lookAt(lookAtPos);
        } else if (this.velocity.lengthSq() > 1e-6) {
            const lookAt = new THREE.Vector3().addVectors(this.camera.position, this.velocity);
            this.camera.lookAt(lookAt);
        }

        // reset acceleration (on garde inertia via velocity)
        this.acceleration.set(0,0,0);
    }
}

const COMPS = {
    
    alea         : Alea,
    mouvementAleatoire : MouvementAleatoire,
    regardesLaOuTuVas : RegardesLaOuTuVas,
    position     : Position,
    rotation     : Rotation,
    attacheA     : AttacheA,
    poster       : Poster,
    sphere       : Sphere,
    cloison      : Cloison,
    sol          : Sol,
    obj          : Obj,
    comp         : Composant,
    steering : Steering,
    mouvementRebond : MouvementRebond,
    eloigneUtilisateur : EloigneUtilisateur,
    boids: Boids,
    coloriseModel: ColoriseModel,
    cameraBoid: CameraBoid
} ; 

export {COMPS} ; 