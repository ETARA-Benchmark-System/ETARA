import {AlignmentCubeService} from '../../_components/alignment-cube/engine/alignment-cube.service';
import {ResourceTracker} from './ResourceTracker';
import * as THREE from 'three';
import {AlignmentContainer, RelationPath, Mapping, Alignment} from '../alignment';
import {ThreeJsUtil} from './ThreeJsUtil';
import {ViewMode} from '../../models';
import {CSS2DObject} from 'three/examples/jsm/renderers/CSS2DRenderer';
import {settings} from '../../../assets/settings';
import {Mesh} from 'three';

export class DataCubeCreator {
    private alignmentCubeService: AlignmentCubeService;

    private cubeTracker: ResourceTracker;

    // references to alignmentCubeService variables
    private scene: THREE.Scene;
    private alignmentModel: AlignmentContainer;

    constructor(alignmentCubeService: AlignmentCubeService) {
        this.alignmentCubeService = alignmentCubeService;
        this.alignmentModel = alignmentCubeService.alignmentContainer;
        this.scene = alignmentCubeService.scene;

        this.cubeTracker = new ResourceTracker();
    }


    /**
     * Adds the dataCubes to the scene. ViewMode determines which will be created.
     */
    public addDataCubes(): void {
        const viewMode = this.alignmentCubeService.viewMode;

        this.alignmentModel.alignments.forEach((alignment, index) => {
            // Check if only the specified alignment should be generated
            if (!(viewMode !== ViewMode.View2DAlignment || (this.alignmentCubeService.selectedAlignmentIndex === index))) {
                return;
            }

            alignment.mappings.forEach((mapping: Mapping) => {
                // Each Mapping can have multiple api paths
                mapping.apiPaths.forEach((apiPath) => {
                    const indexApi = this.alignmentModel.apiLabels.findIndex((value) => value === apiPath);

                    // Check if only the specified api path should be generated
                    if (!(viewMode !== ViewMode.View2DApi || (this.alignmentCubeService.selectedApiPathIndex === indexApi))) {
                        return;
                    }
                    // Each Mapping can have multiple relation paths
                    mapping.relationPaths.forEach((rel) => {
                        const indexRel = this.alignmentModel.getRelationPathIndex(rel.paths);
                        // Check if only the specified relationPath should be generated
                        if (!(viewMode !== ViewMode.View2DRelation
                            || (this.alignmentCubeService.selectedRelationPathLabelIndex === indexRel))) {
                            return;
                        }

                        const cube = this.createDataCube(alignment, mapping, apiPath, rel, index);

                        this.scene.add(cube);
                        this.cubeTracker.track(cube);

                    });
                });
            });
        });
    }

    /**
     * Generates a label, with all information about the mapping.
     * @param dataSetName
     * @param apiPath
     * @param relationPaths
     * @param metricName
     * @param metricValue
     * @private
     */
    private makeDataCubeLabel(dataSetName: string, apiPath: string, relationPaths: string[], metricName: string, metricValue): CSS2DObject {
        const divElement = document.createElement('div');
        const divElementDataSetName = document.createElement('div');
        divElementDataSetName.textContent = 'alignment: ' + dataSetName;
        const divElementApi = document.createElement('div');
        divElementApi.textContent = 'api_path: ' + apiPath;
        // if (this.alignmentCubeService.showFullApiPath) {
        //     divElementApi.textContent = 'api_path: ' + apiPath;
        // } else {
        //     divElementApi.textContent = 'api_path: ' + apiPath.match(settings.regexApiSearch)[0].replace(settings.regexApiReplace, '');
        // }
        const divElementRel = document.createElement('div');
        divElementRel.textContent = 'relation_path:';
        const ulElement = document.createElement('ul');
        for (const path of relationPaths) {
            const liElement = document.createElement('li');
            if (this.alignmentCubeService.showFullRelationPath) {
                liElement.textContent = path;
            } else {
                liElement.textContent = path.match(settings.regexRelSearch)[0].replace(settings.regexRelReplace, '');
            }
            ulElement.appendChild(liElement);
        }
        const divElementMetric = document.createElement('div');
        divElementMetric.textContent = `${metricName}: ${metricValue}`;
        divElementRel.appendChild(ulElement);

        divElement.className = 'label';
        divElement.style.marginTop = '-0.5em';
        divElement.appendChild(divElementDataSetName);
        divElement.appendChild(divElementApi);
        divElement.appendChild(divElementRel);
        divElement.appendChild(divElementMetric);
        divElement.style.zIndex = '10';
        const meshLabel = new CSS2DObject(divElement);

        meshLabel.traverse((object1) => {
            object1.visible = false;
        });

        return meshLabel;
    }

    /**
     * Creates a cube for the given mapping and specified api/relation path.
     *
     * @param alignment
     * @param mapping
     * @param apiPath
     * @param relPath
     * @param zIndex
     * @private
     */
    private createDataCube(alignment: Alignment, mapping: Mapping, apiPath: string, relPath: RelationPath, zIndex): Mesh {
        const relationPath = relPath.paths;
        const indexX = this.alignmentModel.apiLabels.indexOf(apiPath) + 1;
        const indexY = this.alignmentModel.getRelationPathIndex(relationPath) + 1;

        const met = mapping.metrics.find(metric => metric.name === this.alignmentCubeService.selectedMetric);
        if (met === undefined) {
            return;
        }
        // value range between 0 and 1
        const size = Math.max(0, Math.min(met.value, 1));
        const text = String(size);
        let color: THREE.Color;
        // color.setHex(Math.random() * 0xffffff);
        // color = this.alignmentModel.getColorForMapping(mapping.apiPath, mapping.relationPaths.join());
        color = this.alignmentModel.getScaleColorForMapping(apiPath, relationPath.join(), size);

        if (size > 0) {
            const cube = ThreeJsUtil.createCube(size, color, indexX, indexY, zIndex);
            // make visible to raycaster witch works on layer 1
            cube.layers.enable(settings.rayCasterWorkingLayer);

            const label = this.makeDataCubeLabel(
                alignment.name,
                apiPath,
                relationPath,
                this.alignmentCubeService.selectedMetric,
                size
            );
            label.position.set(0, 1.5, 0);
            cube.add(label);

            return cube;
        }

        return null;
    }


    /**
     * Delete all cubes created by this
     */
    public disposeCubes(): void{
        this.cubeTracker.dispose();
    }

}
