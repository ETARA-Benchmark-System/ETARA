import * as THREE from 'three';
import {LineSegments, OrthographicCamera, PerspectiveCamera, Scene} from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import {ElementRef, Injectable, NgZone, OnDestroy} from '@angular/core';
import {CSS2DRenderer} from 'three/examples/jsm/renderers/CSS2DRenderer';

import {ViewMode} from '../../../models';
import {PickHelper, ResourceTracker, SceneLoader} from '../../../_classes/threeJsHelper';
import {AlignmentContainer} from '../../../_classes/alignment';
import {PathFormatterService} from '../../../_services';

@Injectable({providedIn: 'root'})
export class AlignmentCubeService implements OnDestroy {

    public constructor(private ngZone: NgZone, public labelFormatter: PathFormatterService) {
        this.pickPosition = {x: 0, y: 0};
        this.cubeTracker = new ResourceTracker();
        this.resTracker = new ResourceTracker();
        this.labelTracker = new ResourceTracker();
    }

    // states
    private _viewMode: ViewMode;
    private _selectedMetric: string;

    // relation views
    helper = false;
    showFullApiPath = false;
    showFullRelationPath = false;

    // variables
    private rayCasterWorkingLayer = 1;
    private cameraWidth = 10;
    private frameId: number = null;

    private _selectedAlignmentIndex = 0;
    private _selectedApiPathIndex = 0;
    private _selectedRelationPathLabelIndex = 0;

    // Data
    private _alignmentContainer: AlignmentContainer;
    private sceneLoader: SceneLoader;

    // THREE basic components
    private canvas: HTMLCanvasElement;
    private renderer: THREE.WebGLRenderer;
    private labelRenderer: CSS2DRenderer;
    private _scene: THREE.Scene;
    private light: THREE.Light;

    // Helpers
    private _orbitControls: OrbitControls;
    private gridHelper: THREE.GridHelper;
    private cameraHelper: THREE.CameraHelper;
    private axisHelper: THREE.AxesHelper;

    // Cameras
    private cameraPersp: THREE.PerspectiveCamera;
    private cameraOrtho: THREE.OrthographicCamera;
    private _currentCamera: THREE.PerspectiveCamera | THREE.OrthographicCamera;

    // 3D Objects
    private _outlineBox: THREE.LineSegments;

    // Picking Helper
    private pickHelper: PickHelper;
    private pickPosition: { x, y };

    // Ressource Tracker
    private cubeTracker: ResourceTracker;
    private resTracker: ResourceTracker;
    private labelTracker: ResourceTracker;

    public ngOnDestroy(): void {
        if (this.frameId != null) {
            cancelAnimationFrame(this.frameId);
        }
    }

    public initialize(canvas: ElementRef<HTMLCanvasElement>): void {
        // The first step is to get the reference of the canvas element from our HTML document
        this._viewMode = ViewMode.View3D;
        this.canvas = canvas.nativeElement;

        const width = window.innerWidth;
        const height = window.innerHeight;
        const aspect = width / height;

        // renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            alpha: true,    // transparent background
            antialias: true // smooth edges
        });
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(window.devicePixelRatio);

        // label render
        this.labelRenderer = new CSS2DRenderer();
        this.labelRenderer.setSize(width, height);

        document.getElementById('engine-wrapper-label').appendChild(this.labelRenderer.domElement);

        // create the scene
        this._scene = new THREE.Scene();

        // cameras
        this.cameraPersp = new THREE.PerspectiveCamera(75, aspect, 0.01, 100);
        this.cameraOrtho = new THREE.OrthographicCamera(
            -this.cameraWidth * aspect, this.cameraWidth * aspect, this.cameraWidth, -this.cameraWidth, 0.01, 100
        );
        this._currentCamera = this.cameraPersp;
        this._currentCamera.position.set(3, 5, 15);
        this._scene.add(this._currentCamera);

        // soft white light
        this.light = new THREE.AmbientLight(0xFFFFFF, 1);
        this.light.position.set(-10, 0, 10);
        const light2 = new THREE.DirectionalLight(0xFFFFFF, 0.8);
        light2.position.set(0, 100, 10);
        this._scene.add(this.light);
        this._scene.add(light2);

        // controls
        this._orbitControls = new OrbitControls(this._currentCamera, this.labelRenderer.domElement);
        this._orbitControls.minDistance = 5;
        this._orbitControls.maxDistance = 50;

        this.pickHelper = new PickHelper(this.rayCasterWorkingLayer);
        this.clearPickPosition();
    }

    /**
     * Loads the scene for the specified alignment data
     *
     * @param alignmentContainer - Alignment data to visualize
     */
    public loadSceneForAlignmentContainer(alignmentContainer: AlignmentContainer) {
        this._alignmentContainer = alignmentContainer;

        if (this.sceneLoader === undefined) {
            this.sceneLoader = new SceneLoader(this, this.labelFormatter);
        }

        if (this._selectedMetric === undefined) {
            this._selectedMetric = alignmentContainer.metricsNames.values().next().value;
        }

        switch (this._viewMode) {
            case ViewMode.View2DAlignment:
                this.sceneLoader.load2DSceneAlignment();
                break;
            case ViewMode.View3D:
                this.sceneLoader.load3DScene();
                break;
            case ViewMode.View2DApi:
                this.sceneLoader.load2DSceneApi();
                break;
            case ViewMode.View2DRelation:
                this.sceneLoader.load2DSceneRelation();
                break;
        }
    }

    /**
     * Contains all functions for ongoing changes.
     */
    public animate(): void {
        // We have to run this outside angular zones,
        // because it could trigger heavy changeDetection cycles.
        this.ngZone.runOutsideAngular(() => {
            if (document.readyState !== 'loading') {
                this.render();
            } else {
                window.addEventListener('DOMContentLoaded', () => {
                    this.render();
                });
            }

            // Desktop
            window.addEventListener('mousemove', (event) => {
                this.setPickPosition(event);
            });
            window.addEventListener('mouseout', () => {
                this.clearPickPosition();
            });
            window.addEventListener('mouseleave', () => {
                this.clearPickPosition();
            });

            // Mobile
            window.addEventListener('touchstart', (event) => {
                this.setPickPosition(event);
            });
            window.addEventListener('touchmove', (event) => {
                this.setPickPosition(event);
            });
            window.addEventListener('touchcancel', () => {
                this.clearPickPosition();
            });
            window.addEventListener('touchend', () => {
                this.clearPickPosition();
            });

            window.addEventListener('resize', () => {
                this.resize();
            });
        });
    }

    /**
     * Contains all function for correct rendering the scene.
     * @private
     */
    private render(): void {
        this.frameId = requestAnimationFrame(() => {
            this.render();
        });

        this.pickHelper.pick(this.pickPosition, this._scene, this._currentCamera);

        this.renderer.clear();
        this._currentCamera.lookAt(this._outlineBox.position);
        this.renderer.render(this._scene, this._currentCamera);
        this.labelRenderer.render(this._scene, this._currentCamera);
    }

    /**
     * Methode to resize the canvas
     * @private
     */
    private resize(): void {
        const width = window.innerWidth;
        const height = window.innerHeight;
        const aspect = width / height;

        this.cameraPersp.aspect = aspect;
        this.cameraPersp.updateProjectionMatrix();

        this.cameraOrtho.left = -this.cameraWidth * aspect;
        this.cameraOrtho.right = this.cameraWidth * aspect;
        this.cameraOrtho.updateProjectionMatrix();

        this.renderer.setSize(width, height);
        this.labelRenderer.setSize(width, height);
    }

    public resetOrbitControls() {
        this._orbitControls.reset();
        this._orbitControls.target.copy(this._outlineBox.position.clone());
    }

    public setOrbitControlPosition(): void {
        this._currentCamera.lookAt(this._outlineBox.position);
        this._orbitControls.update();
    }

    /**
     * Swap camera between perspective and orthographic.
     */
    public changeCamera(): void {
        const position = this._currentCamera.position.clone();

        this._currentCamera = (this._currentCamera instanceof THREE.PerspectiveCamera) ? this.cameraOrtho : this.cameraPersp;
        this._currentCamera.position.copy(position);

        this._orbitControls.object = this._currentCamera;

        this._currentCamera.lookAt(this._orbitControls.target.x, this._orbitControls.target.y, this._orbitControls.target.z);

        this.resize();
    }

    public toggleGridHelper(size: number = 10, divisions: number = 10) {
        if (this.gridHelper === null || this.gridHelper === undefined) {
            this.gridHelper = new THREE.GridHelper(size, divisions);
            this._scene.add(this.gridHelper);
        } else {
            this._scene.remove(this.gridHelper);
            this.gridHelper = null;
        }
    }

    public toggleAxisHelper(size: number = 10) {
        if (this.axisHelper === null || this.axisHelper === undefined) {
            this.axisHelper = new THREE.AxesHelper(size);
            this._scene.add(this.axisHelper);
        } else {
            this._scene.remove(this.axisHelper);
            this.axisHelper = null;
        }
    }

    public toggleCameraHelper() {
        if (this.cameraHelper === null || this.cameraHelper === undefined) {
            if (this._currentCamera instanceof THREE.PerspectiveCamera) {
                this.cameraHelper = new THREE.CameraHelper(this.cameraOrtho);
            } else {
                this.cameraHelper = new THREE.CameraHelper(this.cameraPersp);
            }
            this._scene.add(this.cameraHelper);
        } else {
            this._scene.remove(this.cameraHelper);
            this.cameraHelper = null;
        }
    }

    /**
     * Picker Functions
     */
    public getCanvasRelativePosition(event) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: (event.clientX - rect.left) * this.canvas.width / rect.width,
            y: (event.clientY - rect.top) * this.canvas.height / rect.height,
        };
    }

    public setPickPosition(event): void {
        const pos = this.getCanvasRelativePosition(event);
        this.pickPosition.x = (pos.x / this.canvas.width) * 2 - 1;
        this.pickPosition.y = (pos.y / this.canvas.height) * -2 + 1;  // note we flip Y
    }

    public clearPickPosition(): void {
        // unlike the mouse which always has a position
        // if the user stops touching the screen we want
        // to stop picking. For now we just pick a value
        // unlikely to pick something
        this.pickPosition.x = -100000;
        this.pickPosition.y = -100000;
    }

    public clearScene() {
        this.labelTracker.dispose();
        this.cubeTracker.dispose();
        this.resTracker.dispose();

        this.sceneLoader.clearScene();
    }

    public reloadScene() {
        this.clearScene();
        this.loadSceneForAlignmentContainer(this.alignmentContainer);
    }

    public setMetric(metric: string) {
        this._selectedMetric = metric;
        this.reloadScene();
    }

    public removeAxisLabels(): void {
        this.labelTracker.dispose();
    }

    public setShowApiFullPath(value: boolean) {
        this.showFullApiPath = value;
        this.reloadScene();
    }

    public setShowRelationFullPath(value: boolean) {
        this.showFullRelationPath = value;
        this.reloadScene();
    }

    public setShowAdvancedMode(value: boolean) {
        this.helper = value;
        this.reloadScene();
    }

    public setSelectedDataSet(index: number) {
        if (index >= 0 && index < this.alignmentContainer.alignments.length) {
            this._selectedAlignmentIndex = index;
            this.reloadScene();
        }
    }

    public setSelectedApiLabel(index: number) {
        if (index >= 0 && index < this.alignmentContainer.apiLabels.length) {
            this._selectedApiPathIndex = index;
            this.reloadScene();
        }
    }

    public setSelectedRelationPathLabel(index: number) {
        console.log(`${index} -> ${this.alignmentContainer.relationPathLabels[index].join()}`);

        if (index >= 0 && index < this.alignmentContainer.relationPathLabels.length) {
            console.log('Changed index to ' + index);
            this._selectedRelationPathLabelIndex = index;
            this.reloadScene();
        }
    }

    public changeViewMode(mode: ViewMode) {
        this._viewMode = mode;
        this.reloadScene();
    }

    set alignmentContainer(model: AlignmentContainer) {
        this._alignmentContainer = model;
    }

    get alignmentContainer(): AlignmentContainer {
        return this._alignmentContainer;
    }

    get viewMode(): ViewMode {
        return this._viewMode;
    }

    get currentCamera(): PerspectiveCamera | OrthographicCamera {
        return this._currentCamera;
    }

    get orbitControls(): OrbitControls {
        return this._orbitControls;
    }

    get outlineBox(): LineSegments {
        return this._outlineBox;
    }

    set outlineBox(value: LineSegments) {
        this._outlineBox = value;
    }

    get selectedAlignmentIndex(): number {
        return this._selectedAlignmentIndex;
    }

    get selectedApiPathIndex(): number {
        return this._selectedApiPathIndex;
    }

    get selectedRelationPathLabelIndex(): number {
        return this._selectedRelationPathLabelIndex;
    }

    get selectedMetric(): string {
        return this._selectedMetric;
    }

    get scene(): Scene {
        return this._scene;
    }
}
