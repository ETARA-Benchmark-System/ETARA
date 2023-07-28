import {ChangeDetectorRef, Component, OnInit, Renderer2} from '@angular/core';
import {Utils} from '../../../_classes/Utils';
import {IApi, ILocalDatabase, ILocalDatabaseSchema, ILocalDatabaseShortInfo} from '../../../_interfaces';
import {IErrorMessage} from '../../../_interfaces/settings/IErrorMessage';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {BackendConnectionService} from '../../../_services/backend-connection.service';
import {MatDialog, MatDialogConfig} from '@angular/material/dialog';
import {GsbService} from '../../../_services/gsb.service';
import {MappingType} from '../../../models';
import * as _ from 'lodash';
import {MappingTableComponent} from './mapping-table/mapping-table.component';
import {LeaderLineAlignment, LeaderLineMapping} from '../../../_classes/gsb/lines';

@Component({
    selector: 'app-builder',
    templateUrl: './builder.component.html',
    styleUrls: ['./builder.component.scss']
})
export class BuilderComponent implements OnInit {
    private _currentLeaderLineAlignment: LeaderLineAlignment;

    utils: Utils = new Utils();

    showFullPathLocal = true;
    showFullPathWeb = false;

    currentLocalDatabase: ILocalDatabase;
    currentWebDatabase: IApi;

    currentLocalDatabaseSchema: ILocalDatabaseSchema;
    errorMsg: IErrorMessage;

    selectedEntity: number;

    localEntityFiltered: any;
    localSortByPathMethod = '';
    localSortByValueMethod = '';
    localEntity: any;
    localEntityLoaded = false;
    localPathSearchValue = '';
    localValueSearchValue = '';

    weblEntityFiltered: any;
    webSortByPathMethod = '';
    webSortByValueMethod = '';
    webEntity: any;
    weblEntityLoaded = false;
    webPathSearchValue = '';
    webValueSearchValue = '';

    databases: Array<ILocalDatabaseShortInfo>;
    apis: Array<IApi>;

    localHashIds: Set<string> = new Set<string>();
    localMappingEntries: Set<any> = new Set<any>();
    webHashIds: Set<string> = new Set<string>();
    webMappingEntries: Set<any> = new Set<any>();
    startId: string;
    endId: string;

    constructor(private connection: BackendConnectionService,
                private dialog: MatDialog,
                private _fb: FormBuilder,
                public cdr: ChangeDetectorRef,
                private _dialog: MatDialog,
                public gsbService: GsbService,
                private renderer: Renderer2) {
    }

    ngOnInit(): void {
        this.init();
        this._currentLeaderLineAlignment = LeaderLineAlignment.build(this.gsbService.currentAlignment, this.renderer);
    }

    clickLocalMappingEntry(localEntry: any) {
        const triggerID = localEntry.hash;
        const element: HTMLElement = document.getElementById(triggerID);
        if (this.localMappingEntries.has(localEntry)) {
            this.localMappingEntries.delete(localEntry);
            this.renderer.removeClass(element, 'clicked');
        } else {
            this.localMappingEntries.add(localEntry);
            this.renderer.addClass(element, 'clicked');
        }
    }

    clickWebMappingEntry(webEntry: any) {
        const triggerID = webEntry.hash;
        const element: HTMLElement = document.getElementById(triggerID);
        if (this.webMappingEntries.has(webEntry)) {
            this.webMappingEntries.delete(webEntry);
            this.renderer.removeClass(element, 'clicked');
        } else {
            this.webMappingEntries.add(webEntry);
            this.renderer.addClass(element, 'clicked');
        }
    }

    addMapping(type: MappingType): void {
        _.defer(() => {
            if (this.localMappingEntries.size !== 0 && this.webMappingEntries.size !== 0) {

                for (const entry of this.localMappingEntries) {
                    const localElem: HTMLElement = document.getElementById(entry.hash);
                    this.renderer.addClass(localElem, 'used');
                    this.renderer.removeClass(localElem, 'clicked');
                }
                for (const entry of this.webMappingEntries) {
                    const webElem: HTMLElement = document.getElementById(entry.hash);
                    this.renderer.addClass(webElem, 'used');
                    this.renderer.removeClass(webElem, 'clicked');
                }

                const mappingObj = {
                    type,
                    localEntries: Array.from(this.localMappingEntries),
                    webEntries: Array.from(this.webMappingEntries)
                };
                this.gsbService.addMapping(mappingObj);
                const newMapping: LeaderLineMapping = LeaderLineMapping.build(mappingObj);
                this._currentLeaderLineAlignment.addMapping(newMapping, true);
                this.localMappingEntries.clear();
                this.webMappingEntries.clear();
            }
        });
    }

    updateLines(): void {
        this._currentLeaderLineAlignment.updateLines();
    }

    // Sort Web

    sortByPathWeb(): void {
        switch (this.webSortByPathMethod) {
            case 'alphaAsc':
                this.sortByPathWebAsc();
                break;
            case 'alphaDesc':
                this.sortByPathWebDesc();
                break;
            default:
                this.weblEntityFiltered.dictionary = _.cloneDeep(this.gsbService.currentWebEntity.dictionary);
        }
        this.updateLines();
    }

    sortByPathWebAsc() {
        this.weblEntityFiltered.dictionary.sort((a, b) => a.path.localeCompare(b.path));
    }

    sortByPathWebDesc() {
        this.weblEntityFiltered.dictionary.sort((a, b) => b.path.localeCompare(a.path));
    }

    sortByValueWeb(): void {
        switch (this.webSortByValueMethod) {
            case 'alphaAsc':
                this.sortByValueWebAsc();
                break;
            case 'alphaDesc':
                this.sortByValueWebDesc();
                break;
            default:
                // tslint:disable-next-line:max-line-length
                this.localEntityFiltered.valueList[0].fullKnowledge = _.cloneDeep(this.gsbService.currentLocalEntity.valueList[0].fullKnowledge);
        }
        this.updateLines();
    }

    sortByValueWebAsc() {
        this.weblEntityFiltered.dictionary.sort((a, b) => a.value.localeCompare(b.value));
    }

    sortByValueWebDesc() {
        this.weblEntityFiltered.dictionary.sort((a, b) => b.value.localeCompare(a.value));
    }

    // Sort Local

    sortByPathLocal(): void {
        switch (this.localSortByPathMethod) {
            case 'alphaAsc':
                this.sortByPathLocalAsc();
                break;
            case 'alphaDesc':
                this.sortByPathLocalDesc();
                break;
            default:
                // tslint:disable-next-line:max-line-length
                this.localEntityFiltered.valueList[0].fullKnowledge = _.cloneDeep(this.gsbService.currentLocalEntity.valueList[0].fullKnowledge);
        }
        this.updateLines();
    }

    sortByPathLocalAsc() {
        this.localEntityFiltered.valueList[0].fullKnowledge.sort((a, b) => {
            const ap = this.utils.formatLocalPath(a.path);
            const bp = this.utils.formatLocalPath(b.path);
            return ap.localeCompare(bp);
        });
    }

    sortByPathLocalDesc() {
        this.localEntityFiltered.valueList[0].fullKnowledge.sort((a, b) => {
            const ap = this.utils.formatLocalPath(a.path);
            const bp = this.utils.formatLocalPath(b.path);
            return bp.localeCompare(ap);
        });
    }

    sortByValueLocal(): void {
        switch (this.localSortByValueMethod) {
            case 'alphaAsc':
                this.sortByValueLocalAsc();
                break;
            case 'alphaDesc':
                this.sortByValueLocalDesc();
                break;
            default:
                // tslint:disable-next-line:max-line-length
                this.localEntityFiltered.valueList[0].fullKnowledge = _.cloneDeep(this.gsbService.currentLocalEntity.valueList[0].fullKnowledge);
        }
        this.updateLines();
    }

    sortByValueLocalAsc() {
        this.localEntityFiltered.valueList[0].fullKnowledge.sort((b, a) => {
            return a.value.localeCompare(b.value);
        });
    }

    sortByValueLocalDesc() {
        this.localEntityFiltered.valueList[0].fullKnowledge.sort((a, b) => {
            return a.value.localeCompare(b.value);
        });
    }

    changeLocalValueSearchValue(value: string, event): void {
        event.stopPropagation();
        this.localValueSearchValue = value;
        this.updateLines();
    }

    changeWebValueSearchValue(value: string, event): void {
        this.webValueSearchValue = value;
        this.updateLines();
        event.stopPropagation();
    }

    changeLocalPathSearchValue(value: string, event): void {
        this.localPathSearchValue = value;
        this.updateLines();
        event.stopPropagation();
    }

    changeWebPathSearchValue(value: string, event): void {
        event.stopPropagation();
        this.webPathSearchValue = value;
        this.updateLines();
    }

    searchMethod(a: string, b: string): boolean {
        const al = a.toLowerCase();
        const bl = b.toLowerCase();


        return (al.includes(bl) || bl.includes(al));
    }

    init() {
        this.webEntity = this.gsbService.currentWebEntity;
        this.localEntity = this.gsbService.currentLocalEntity;
        this.weblEntityFiltered = _.cloneDeep(this.webEntity);
        this.localEntityFiltered = _.cloneDeep(this.localEntity);

        this.currentLocalDatabase = this.gsbService.localDatabase;
        this.currentWebDatabase = this.gsbService.webDatabase;
    }

    public markNewPaths(): void {
        for (const localEntry of this.localEntity.valueList[0].fullKnowledge) {
            if (!this.gsbService.localKnownPathStore.has(localEntry.path)) {
                const localElem: HTMLElement = document.getElementById(localEntry.hash);
                this.renderer.addClass(localElem, 'unknown');
            }
        }

        for (const webEntry of this.webEntity.dictionary) {
            if (!this.gsbService.webKnownPathStore.has(webEntry.path)) {
                const webElem: HTMLElement = document.getElementById(webEntry.hash);
                this.renderer.addClass(webElem, 'unknown');
            }
        }
    }

    openMappingTable(): void {
        const dialogConfig = new MatDialogConfig();

        dialogConfig.autoFocus = true;
        dialogConfig.maxHeight = '100vh';
        dialogConfig.minHeight = '70vh';
        dialogConfig.maxWidth = '90vw';
        dialogConfig.minWidth = '70vw';
        const dialogRef = this._dialog.open(MappingTableComponent, dialogConfig).afterClosed().toPromise().then(() => {
            this._currentLeaderLineAlignment.deleteLines();
            this._currentLeaderLineAlignment = LeaderLineAlignment.build(this.gsbService.currentAlignment, this.renderer);
            this.clearUsedClass();
            this.markUsedElems();
            this._currentLeaderLineAlignment.drawLines();
            this.updateLines();
        });
    }

    clearUsedClass(): void {

        for (const localEntry of this.localEntity.valueList[0].fullKnowledge) {
            const localElem: HTMLElement = document.getElementById(localEntry.hash);
            this.renderer.removeClass(localElem, 'used');
        }

        for (const webEntry of this.webEntity.dictionary) {
            const webElem: HTMLElement = document.getElementById(webEntry.hash);
            this.renderer.removeClass(webElem, 'used');
        }
    }

    markUsedElems(): void {
        for (const mapping of this.gsbService.currentMappings) {
            for (const localEntry of mapping.localEntries) {
                const localElem: HTMLElement = document.getElementById(localEntry.hash);
                this.renderer.addClass(localElem, 'used');
            }

            for (const webEntry of mapping.webEntries) {
                const webElem: HTMLElement = document.getElementById(webEntry.hash);
                this.renderer.addClass(webElem, 'used');
            }
        }
    }

    public hideLines(): void {
        console.log('hide lines');
        this._currentLeaderLineAlignment.hideLines();
    }

    public showLines(): void {
        this._currentLeaderLineAlignment.showLines();
    }

    selectionChange(index): void {
        if (index === 1) {
            Utils.delay(1000).then(() => {
                this._currentLeaderLineAlignment.showLines();
            });
        } else {
            this._currentLeaderLineAlignment.hideLines();
        }
    }

    entityChange(i): void {
        this.webMappingEntries.clear();
        this.localMappingEntries.clear();

        this._currentLeaderLineAlignment.deleteLines();
        this.gsbService.changeCurrentAlignment(i);
        this.init();
        this.cdr.detectChanges();
        Utils.delay(1000).then(() => {
            console.log('redraw now');
            this._currentLeaderLineAlignment = LeaderLineAlignment.build(this.gsbService.currentAlignment, this.renderer);
            console.log(this._currentLeaderLineAlignment.mappings);
            this._currentLeaderLineAlignment.drawLines();
            this.clearUsedClass();
            this.markUsedElems();
            this.markNewPaths();
        });
        console.log('change finished');
    }

    clearLines(): void {
        this._currentLeaderLineAlignment.deleteLines();
    }
}
