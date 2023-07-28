import * as THREE from 'three';
import {ResourceTracker} from './ResourceTracker';
import {AlignmentCubeService} from '../../_components/alignment-cube/engine/alignment-cube.service';
import {AlignmentContainer} from '../alignment';
import {settings} from '../../../assets/settings';
import {ThreeJsUtil} from './ThreeJsUtil';
import {PathFormatterService} from '../../_services';

export class LabelCreator {
    labelFormatter: PathFormatterService;

    constructor(alignmentCubeService: AlignmentCubeService, labelFormatter: PathFormatterService) {
        this.alignmentCubeService = alignmentCubeService;
        this.labelFormatter = labelFormatter;
        this.alignmentModel = alignmentCubeService.alignmentContainer;
        this.scene = alignmentCubeService.scene;
        this.labelTracker = new ResourceTracker();
    }

    private alignmentCubeService: AlignmentCubeService;

    private labelTracker: ResourceTracker;

    // references to alignmentCubeService variables
    private scene: THREE.Scene;
    private alignmentModel: AlignmentContainer;


    /**
     * Create the label for the x Axis ( Api Paths )
     *
     * @param xStart - x position of start edge
     * @param yStart - y position of start edge
     * @param zStart - z position of start edge
     * @param xOffset
     * @param yOffset
     * @param zOffset
     * @param rotation - rotation radiant ( use Math.PI)
     * @param withLines - set if you need a visual support to the edge of the outline cube
     */
    public addLabelsX(xStart: number, yStart: number, zStart: number,
                      xOffset: number = 0, yOffset: number = 0, zOffset: number = 0,
                      rotation: number = 0, withLines: boolean = false): void {

        // determine the longest common prefix to later shorten the labels
        const prefix = this.longestCommonPrefix(this.alignmentModel.apiLabels);

        this.alignmentModel.apiLabels.forEach((apiPath, index) => {
            const x = xStart + xOffset + index;
            const y = yStart + yOffset;
            const z = zStart + zOffset;

            const context: string = this.labelFormatter.formatApiPath(this.alignmentCubeService, apiPath, prefix);

            const label = this.attachLabelToObject(context, this.alignmentCubeService.outlineBox, x, y, z, 400,
                'blue', rotation, true);
            this.labelTracker.track(label);
            if (withLines) {
                const line = ThreeJsUtil.createLine(new THREE.Vector3(x, yStart, zStart), label.position);
                this.scene.add(line);
                this.labelTracker.track(line);
                this.alignmentCubeService.outlineBox.add(line);
            }
            this.alignmentCubeService.outlineBox.add(label);
        });
    }

    /**
     * Create the label for the y Axis ( Relation Paths )
     *
     * @param xStart - x position of start edge
     * @param yStart - y position of start edge
     * @param zStart - z position of start edge
     * @param xOffset
     * @param yOffset
     * @param zOffset
     * @param rotation - rotation radiant ( use Math.PI)
     * @param withLines - set if you need a visual support to the edge of the outline cube
     */
    public addLabelsY(xStart: number, yStart: number, zStart: number,
                      xOffset: number = 0, yOffset: number = 0, zOffset: number = 0,
                      rotation: number = 0, withLines: boolean = false): void {

        this.alignmentModel.relationPathLabels.forEach((relationPath, index) => {
            const labels: string[] = [];
            const x = xStart + xOffset;
            const y = yStart + yOffset + index;
            const z = zStart + zOffset;

            relationPath.forEach((path) => {
                labels.push(this.labelFormatter.formatRelationPath(this.alignmentCubeService,path));
            });
            const labelContext = this.labelFormatter.joinRelPaths(labels);
            const label = this.attachLabelToObject(labelContext, this.alignmentCubeService.outlineBox, x, y, z, 400,
                'blue', rotation, true
            );
            this.labelTracker.track(label);
            if (withLines) {
                const line = ThreeJsUtil.createLine(new THREE.Vector3(xStart, y, zStart), label.position);
                this.scene.add(line);
                this.labelTracker.track(line);
                this.alignmentCubeService.outlineBox.add(line);
            }
            this.alignmentCubeService.outlineBox.add(label);
        });
    }

    /**
     * Create the label for the z Axis ( Alignments )
     *
     * @param xStart - x position of start edge
     * @param yStart - y position of start edge
     * @param zStart - z position of start edge
     * @param xOffset
     * @param yOffset
     * @param zOffset
     * @param rotation - rotation radiant ( use Math.PI)
     * @param withLines - set if you need a visual support to the edge of the outline cube
     */
    public addLabelsZ(xStart: number, yStart: number, zStart: number,
                      xOffset: number = 0, yOffset: number = 0, zOffset: number = 0,
                      rotation: number = 0, withLines: boolean = false): void {
        const depth = this.alignmentModel.alignments.length;
        for (let i = 0; i < depth; i++) {
            const x = xStart + xOffset;
            // const x = xStart + (depth - 1 - i) * 0.8 + xOffset;
            const y = yStart + yOffset;
            const z = zStart - depth + 1 + i + zOffset;
            const content = this.alignmentModel.alignments[i].name;
            const label = this.attachLabelToObject(content, this.alignmentCubeService.outlineBox, x, y, z, 400,
                'blue', rotation, true);
            this.labelTracker.track(label);
            if (withLines) {
                const line = ThreeJsUtil.createLine(new THREE.Vector3(xStart, yStart, z), label.position);
                this.scene.add(line);
                this.labelTracker.track(line);
                this.alignmentCubeService.outlineBox.add(line);
            }
            this.alignmentCubeService.outlineBox.add(label);
        }
    }

    /**
     * Attach a label to an Object3D.
     * @param content - label text
     * @param object
     * @param x - x position relative to object center
     * @param y - y position relative to object center
     * @param z - z position relative to object center
     * @param labelWidth
     * @param style - color for background
     * @param rotation - rotation radiant ( use Math.PI)
     * @param visible
     * @private
     */
    private attachLabelToObject(content: string, object: THREE.Object3D, x: number = 0, y: number = 1, z: number = 0,
                                labelWidth: number = 100, style: string = 'gray', rotation: number = 0,
                                visible: boolean = false): THREE.Sprite {
        const canvas = ThreeJsUtil.createHTMLCanvasLabel(labelWidth, 30, content, style);
        const texture = new THREE.CanvasTexture(canvas);
        // because our canvas is likely not a power of 2
        // in both dimensions set the filtering appropriately.
        texture.minFilter = THREE.LinearFilter;
        texture.wrapS = THREE.ClampToEdgeWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;

        const labelMaterial = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
        });
        labelMaterial.rotation = rotation;

        const labelBaseScale = 0.01;
        const label = new THREE.Sprite(labelMaterial);
        object.add(label);
        label.position.set(x, y, z);
        label.scale.x = canvas.width * labelBaseScale;
        label.scale.y = canvas.height * labelBaseScale;
        label.traverse((object1) => {
            object1.visible = visible;
        });
        return label;
    }

    /**
     * Delete all labels created by this
     */
    public disposeLabels(): void{
        this.labelTracker.dispose();
    }

    /**
     * The method identifies in all API paths the longest common prefix
     *
     * @param a Array containing all paths of the API JSON
     * @private A string containing the longest common prefix
     */
    private longestCommonPrefix(a: string[]): string {
        let size = a.length;

        /* if size is 0, return empty string */
        if (size == 0) return "";
        if (size == 1) return a[0];

        /* sort the array of strings */
        a.sort();

        /* find the minimum length from first and last string */
        let end = Math.min(a[0].length, a[size-1].length);

        /* find the common prefix between the first and last string */
        let i = 0;
        while (i < end && a[0][i] == a[size-1][i] ) i++;

        let pre = a[0].substring(0, i);
        pre = pre.substring(0,pre.lastIndexOf(".")+1);
        return pre;
    }

}
