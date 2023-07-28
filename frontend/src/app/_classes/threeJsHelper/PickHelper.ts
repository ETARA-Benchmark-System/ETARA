import * as THREE from 'three';

export class PickHelper {
    private raycaster: THREE.Raycaster;
    private pickedObject;
    private pickedObjectSavedColor;

    constructor(layer: number = 0) {
        this.raycaster = new THREE.Raycaster();
        this.pickedObject = null;
        this.pickedObjectSavedColor = 0;

        this.raycaster.layers.set(layer);
        this.raycaster.layers.enable(layer);
    }

    public pick(normalizedPosition, scene, camera): void {
        // restore the color if there is a picked object
        if (this.pickedObject) {
            // this.pickedObject.material.emissive.setHex(this.pickedObjectSavedColor);
            this.pickedObject.material.color.setHex(this.pickedObjectSavedColor);
            this.pickedObject.children.forEach( (object) => object.visible = false );
            this.pickedObject = undefined;

        }

        // cast a ray through the frustum
        this.raycaster.setFromCamera(normalizedPosition, camera);
        // get the list of objects the ray intersected
        const intersectedObjects = this.raycaster.intersectObjects(scene.children);
        // console.log(intersectedObjects);
        if (intersectedObjects.length) {
            // pick the first object. It's the closest one
            this.pickedObject = intersectedObjects[0].object;
            this.pickedObject.children.forEach( (object) => object.visible = true );
            // save its color
            // this.pickedObjectSavedColor = this.pickedObject.material.emissive.getHex();
            this.pickedObjectSavedColor = this.pickedObject.material.color.getHex();
            // set its emissive color to flashing red/yellow
            // this.pickedObject.material.emissive.setHex(0xFF0000);
            this.pickedObject.material.color.setHex(0xFF0000);
        }
    }
}
