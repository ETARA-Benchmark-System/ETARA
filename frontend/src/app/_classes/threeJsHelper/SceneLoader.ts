import * as THREE from 'three';
import {AlignmentCubeService} from '../../_components/alignment-cube/engine/alignment-cube.service';
import {AlignmentContainer} from '../alignment';
import {LabelCreator} from './LabelCreator';
import {ThreeJsUtil} from './ThreeJsUtil';
import {DataCubeCreator} from './DataCubeCreator';
import {ResourceTracker} from './ResourceTracker';
import {PathFormatterService} from '../../_services';

export class SceneLoader {
    private alignmentCubeService: AlignmentCubeService;

    // references to alignmentCubeService variables
    private scene: THREE.Scene;
    private alignmentModel: AlignmentContainer;

    private labelCreator: LabelCreator;
    private dataCubeCreator: DataCubeCreator;
    private resTracker: ResourceTracker;

    constructor(alignmentCubeService: AlignmentCubeService, pathFormatterService: PathFormatterService) {
        this.alignmentCubeService = alignmentCubeService;
        this.alignmentModel = alignmentCubeService.alignmentContainer;
        this.scene = alignmentCubeService.scene;
        this.labelCreator = new LabelCreator(alignmentCubeService, pathFormatterService);
        this.dataCubeCreator = new DataCubeCreator(alignmentCubeService);
        this.resTracker = new ResourceTracker();
    }

    /**
     * 2D View with x: ApiPath and y: datasets
     */
    public load2DSceneRelation(): void {
        const width = this.alignmentModel.apiLabels.length;
        const height = 1;
        const depth = this.alignmentModel.alignments.length;

        this.alignmentCubeService.outlineBox = ThreeJsUtil.createOutlineCube(width, height, depth);
        this.resTracker.track(this.alignmentCubeService.outlineBox);
        this.scene.add(this.alignmentCubeService.outlineBox);

        const xStart = -width / 2;
        const yStart = -height / 2;
        const zStart = depth / 2;

        this.labelCreator.addLabelsX(xStart, yStart, zStart, 0.5, 0, 2.5, Math.PI / 2);
        this.labelCreator.addLabelsZ(xStart, yStart, zStart, -2.5, 0, -0.5, 0);

        this.dataCubeCreator.addDataCubes();

        this.alignmentCubeService.orbitControls.enableRotate = false;
        this.alignmentCubeService.orbitControls.enablePan = false;
        const newPosition = this.alignmentCubeService.outlineBox.position.clone();

        const y = this.alignmentModel.relationPathLabels.length + 1;

        if (this.alignmentCubeService.currentCamera instanceof THREE.PerspectiveCamera) {
            this.alignmentCubeService.changeCamera();
        }

        this.alignmentCubeService.currentCamera.position.set(newPosition.x, y , newPosition.z);
    }

    /**
     * 2D View with x: ApiPath and y: RelationPath
     */
    public load2DSceneAlignment(): void {
        const width = this.alignmentModel.apiLabels.length;
        const height = this.alignmentModel.relationPathLabels.length;
        const depth = 1;

        this.alignmentCubeService.outlineBox = ThreeJsUtil.createOutlineCube(width, height, depth);
        this.resTracker.track(this.alignmentCubeService.outlineBox);
        this.scene.add(this.alignmentCubeService.outlineBox);

        const xStart = -width / 2;
        const yStart = -height / 2;
        const zStart = depth / 2;

        this.labelCreator.addLabelsX(xStart, yStart, zStart, 0.5, -2.5, 0, Math.PI / 2);
        this.labelCreator.addLabelsY(xStart, yStart, zStart, -2.5, 0.5, 0);

        this.dataCubeCreator.addDataCubes();

        this.alignmentCubeService.orbitControls.enableRotate = false;
        this.alignmentCubeService.orbitControls.enablePan = false;
        const newPosition = this.alignmentCubeService.outlineBox.position.clone();
        const z = this.alignmentModel.alignments.length + 1;

        if (this.alignmentCubeService.currentCamera instanceof THREE.PerspectiveCamera) {
            this.alignmentCubeService.changeCamera();
        }

        this.alignmentCubeService.currentCamera.position.set(newPosition.x, newPosition.y, z);
    }

    /**
     * 2D View with x: Dataset and y: RelationPath
     */
    public load2DSceneApi(): void {
        const width = 1;
        const height = this.alignmentModel.relationPathLabels.length;
        const depth = this.alignmentModel.alignments.length;

        this.alignmentCubeService.outlineBox = ThreeJsUtil.createOutlineCube(width, height, depth);
        this.resTracker.track(this.alignmentCubeService.outlineBox);
        this.scene.add(this.alignmentCubeService.outlineBox);

        const xStart = -width / 2;
        const yStart = -height / 2;
        const zStart = depth / 2;

        this.labelCreator.addLabelsY(xStart, yStart, zStart, 0, 0.5, 2.5);
        this.labelCreator.addLabelsZ(-xStart, yStart, zStart, 0, -2.5, -0.5, Math.PI / 2);

        this.dataCubeCreator.addDataCubes();

        this.alignmentCubeService.orbitControls.enableRotate = false;
        this.alignmentCubeService.orbitControls.enablePan = false;

        const newPosition = this.alignmentCubeService.outlineBox.position.clone();
        const x = this.alignmentModel.apiLabels.length + 1;

        if (this.alignmentCubeService.currentCamera instanceof THREE.PerspectiveCamera) {
            this.alignmentCubeService.changeCamera();
        }

        this.alignmentCubeService.currentCamera.position.set(x, newPosition.y, newPosition.z);
    }

    public load3DScene(): void {
        const width = this.alignmentModel.apiLabels.length;
        const height = this.alignmentModel.relationPathLabels.length;
        const depth = this.alignmentModel.alignments.length;

        this.alignmentCubeService.outlineBox = ThreeJsUtil.createOutlineCube(width, height, depth);
        this.resTracker.track(this.alignmentCubeService.outlineBox);
        this.scene.add(this.alignmentCubeService.outlineBox);

        const xStart = -width / 2;
        const yStart = -height / 2;

        const zStart = depth / 2;
        this.alignmentCubeService.orbitControls.enableRotate = true;
        this.alignmentCubeService.orbitControls.enablePan = true;

        this.alignmentCubeService.orbitControls.target.copy(this.alignmentCubeService.outlineBox.position.clone());

        // Labels
        this.labelCreator.addLabelsX(xStart, yStart, zStart, 0.5, -2.5, 0, Math.PI / 2);
        this.labelCreator.addLabelsY(xStart, yStart, zStart, -2.5, 0.5, 0);
        this.labelCreator.addLabelsZ(-xStart, yStart, zStart, 2.5, 0, -0.5);

        // DataCubes
        this.dataCubeCreator.addDataCubes();

        this.alignmentCubeService.orbitControls.enableRotate = true;
        this.alignmentCubeService.orbitControls.enablePan = true;

        const newPosition = this.alignmentCubeService.outlineBox.position.clone();
        const a = this.alignmentModel.apiLabels.length;
        const b = this.alignmentModel.relationPathLabels.length;
        const z = Math.sqrt(a ** 2 + b ** 2) + 1;

        this.alignmentCubeService.currentCamera.position.set(newPosition.x + 1, newPosition.y + 1, z);
    }

    /**
     * Removes all objects of the scene.
     */
    public clearScene(): void {
        this.labelCreator.disposeLabels();
        this.dataCubeCreator.disposeCubes();
        this.resTracker.dispose();
    }
}
