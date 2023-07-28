import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {AlignmentCubeService} from './engine/alignment-cube.service';
import * as scigraph_v1 from '../../../assets/data/alignments/example/scigraph_v1.json';
import * as scigraph_v2 from '../../../assets/data/alignments/example/scigraph_v2.json';
import * as scigraph_v3 from '../../../assets/data/alignments/example/scigraph_v3.json';
import * as scigraph_v4 from '../../../assets/data/alignments/example/scigraph_v4.json';
import * as doris from '../../../assets/data/alignments/filipo/sample_dblp_sample_arxiv.json';
import * as filipo from '../../../assets/data/alignments/doris/sample_dblp_sample_arxiv_overlap.json';
import {IAlignment, IAlignmentOverview, IAlignmentShort} from '../../_interfaces';
import {AlignmentContainer} from '../../_classes/alignment';
import {BackendConnectionService} from "../../_services/backend-connection.service";

// import alignmentArxiv from ''

@Component({
    selector: 'app-alignment-cube',
    templateUrl: './alignment-cube.component.html',
    styleUrls: ['./alignment-cube.component.scss']
})
export class AlignmentCubeComponent implements OnInit {

    @ViewChild('rendererCanvas', {static: true})
    public rendererCanvas: ElementRef<HTMLCanvasElement>;

    @ViewChild('labelRendererCanvas', {static: true})
    public labelRendererCanvas: ElementRef<HTMLCanvasElement>;

    selectedAlignments: IAlignment[];
    alignments: Array<IAlignmentShort>;

    alignmentModel: AlignmentContainer = new AlignmentContainer();

    showAddAlignmentComponent: boolean;
    animationStarted: boolean;


    public constructor(public engServ: AlignmentCubeService, private connection: BackendConnectionService) {}

    public ngOnInit(): void {
        this.showAddAlignmentComponent = true;
        this.animationStarted = false;
        this.selectedAlignments = [];

        this.engServ.initialize(this.rendererCanvas);
        this.loadAlignments();
    }

    onAlignmentAdded(alignment: IAlignment): void {
        this.alignmentModel.addAlignment(alignment);
    }

    loadAlignments() {
        this.connection.getAlignments().then((res: IAlignmentOverview) => {
            this.alignments = res.alignments;
        });
    }

    public startAnimation() {
        this.showAddAlignmentComponent = false;
        this.animationStarted = true;

        this.engServ.loadSceneForAlignmentContainer(this.alignmentModel);
        this.engServ.animate();
    }

    public startAnimationExample() {
        this.showAddAlignmentComponent = false;
        this.animationStarted = true;

        const sciV1: IAlignment = (scigraph_v1 as any).default;
        const sciV2: IAlignment = (scigraph_v2 as any).default;
        const sciV3: IAlignment = (scigraph_v3 as any).default;
        const sciV4: IAlignment = (scigraph_v4 as any).default;

        this.alignmentModel.addAlignment(sciV1);
        this.alignmentModel.addAlignment(sciV2);
        this.alignmentModel.addAlignment(sciV3);
        this.alignmentModel.addAlignment(sciV4);

        this.alignmentModel.sortApiLabels();
        this.alignmentModel.sortRelationLabels();

        this.engServ.loadSceneForAlignmentContainer(this.alignmentModel);

        this.engServ.animate();
    }

    public startAnimationExample2Systems() {
        this.showAddAlignmentComponent = false;
        this.animationStarted = true;

        const dorisAlignment: IAlignment = (doris as any).default;
        const filipoAlignment: IAlignment = (filipo as any).default;

        this.alignmentModel.addAlignment(filipoAlignment);
        this.alignmentModel.addAlignment(dorisAlignment);

        this.alignmentModel.sortApiLabels();
        this.alignmentModel.sortRelationLabels();

        this.engServ.loadSceneForAlignmentContainer(this.alignmentModel);

        this.engServ.animate();
    }
}
