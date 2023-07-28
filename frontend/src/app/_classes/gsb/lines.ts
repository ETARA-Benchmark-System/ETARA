import {MappingType} from '../../models';
import {ElementRef, Renderer2} from '@angular/core';
import {Utils} from '../Utils';
import {utils} from 'protractor';
import {GSBAlignment, GSBMapping} from '../../_interfaces/gsb/alignment';

declare var LeaderLine: any; // used to access class of npm package leader-lines

export class LeaderLineMapping {
    private _localElems: Map<string, HTMLElement>; // stores a map with id(md5 hash) and HTML element reference
    private _webElems: Map<string, HTMLElement>; // stores a map with id(md5 hash) and HTML element reference
    private _type: MappingType;
    private _lines: Set<any>; // stores all LeaderLine instances
    private renderer: Renderer2;

    public constructor(type: MappingType,
                       localElems: Map<string, HTMLElement> = new Map<string, HTMLElement>(),
                       webElems: Map<string, HTMLElement> = new Map<string, HTMLElement>()) {
        this._localElems = localElems;
        this._webElems = webElems;
        this._lines = new Set<any>();
        this._type = type;
    }

    public static build(mapping: GSBMapping): LeaderLineMapping {
        const localElems: Map<string, HTMLElement> = new Map<string, HTMLElement>();
        const webElems: Map<string, HTMLElement> = new Map<string, HTMLElement>();

        for (const localEntry of mapping.localEntries) {
            const localElem: HTMLElement = document.getElementById(localEntry.hash);
            localElems.set(localEntry.hash, localElem);
        }

        for (const webEntry of mapping.webEntries) {
            const webElem: HTMLElement = document.getElementById(webEntry.hash);
            webElems.set(webEntry.hash, webElem);
        }

        const newMapping: LeaderLineMapping = new LeaderLineMapping(mapping.type, localElems, webElems);

        return newMapping;
    }


    /**
     * Method sets the renderer.
     * @param renderer - Renderer to use.
     */
    setRenderer(renderer: Renderer2): void {
        this.renderer = renderer;
    }

    public addLocalElem(id: string, elem: HTMLElement) {
        this._localElems.set(id, elem);
    }

    public addWebElem(id: string, elem: HTMLElement) {
        this._webElems.set(id, elem);
    }

    public drawLines() {
        this.deleteLines();
        for (const localElem of this._localElems.values()) {
            for (const webElem of this._webElems.values()) {
                const line = new LeaderLine(
                    localElem,
                    webElem
                );
                line.setOptions({
                    startSocket: 'right', endSocket: 'left', color: 'gray'
                });

                switch (this._type) {
                    case MappingType.LocalToWeb:
                        line.setOptions({
                            startPlug: 'behind', endPlug: 'arrow1'
                        });
                        break;
                    case MappingType.WebToLocal:
                        line.setOptions({
                            startPlug: 'arrow1', endPlug: 'behind'
                        });
                        break;
                    case MappingType.Bidirectional:
                        line.setOptions({
                            startPlug: 'arrow1', endPlug: 'arrow1'
                        });
                        break;
                }

                this._lines.add(line);
                localElem.classList.add('used');
                webElem.classList.add('used');
                line.position();
            }
        }
    }

    public deleteLines(): void {
        for (const line of this._lines) {
            line.remove();
        }
        this._lines.clear();
    }

    public async updateLines(): Promise<void> {
        await Utils.delay(10);
        for (const line of this._lines) {
            if (line.start.classList.contains('hide') || line.end.classList.contains('hide')) {
                line.hide('none');
            } else {
                line.show();
            }
            line.position();
        }
    }

    /**
     * Method sets the color of the line object's line.
     * @param color - Color to set.
     * @private
     */
    private setLineColor(color: string) {
        for (const line of this._lines) {
            line.setOptions({
                color
            });
        }
    }

    /**
     * Method sets the type of the mapping.
     * @private
     * @param type
     */
    private setMappingType(type: MappingType) {
        this._type = type;
        this.drawLines();
    }

    get localElems(): Map<string, HTMLElement> {
        return this._localElems;
    }

    get webElems(): Map<string, HTMLElement> {
        return this._webElems;
    }

    get type(): MappingType {
        return this._type;
    }

    get lines(): Set<any> {
        return this._lines;
    }
}

export class LeaderLineAlignment {

    private readonly _mappings: Set<LeaderLineMapping>;
    private renderer: Renderer2;

    constructor(render: Renderer2) {
        this._mappings = new Set<LeaderLineMapping>();
        this.renderer = render;
    }

    get mappings(): Set<LeaderLineMapping> {
        return this._mappings;
    }

    public static build(alignment: GSBAlignment, render: Renderer2): LeaderLineAlignment {
        const leaderLine = new LeaderLineAlignment(render);
        for (const mapping of alignment.mappings) {
            const localElems: Map<string, HTMLElement> = new Map<string, HTMLElement>();
            const webElems: Map<string, HTMLElement> = new Map<string, HTMLElement>();

            for (const localEntry of mapping.localEntries) {
                const localElem: HTMLElement = document.getElementById(localEntry.hash);

                localElems.set(localEntry.hash, localElem);
            }

            for (const webEntry of mapping.webEntries) {
                const webElem: HTMLElement = document.getElementById(webEntry.hash);
                webElems.set(webEntry.hash, webElem);
            }

            const newMapping: LeaderLineMapping = new LeaderLineMapping(mapping.type, localElems, webElems);

            leaderLine.addMapping(newMapping, false);
        }

        return leaderLine;
    }

    addMapping(mapping: LeaderLineMapping, draw: boolean = false): void {
        this._mappings.add(mapping);
        mapping.setRenderer(this.renderer);
        if (draw) {
            mapping.drawLines();
        }
    }

    addGSBMapping(mapping: GSBMapping): void {
        const newMapping: LeaderLineMapping = LeaderLineMapping.build(mapping);
        this.addMapping(newMapping);
    }

    deleteMapping(): void {

    }

    drawLines(): void {
        for (const mapping of this._mappings) {
            mapping.drawLines();
        }
    }

    updateLines(): void {
        for (const mapping of this._mappings) {
            mapping.updateLines();
        }
    }

    hideLines(): void {
        for (const mapping of this._mappings) {
            for (const line of mapping.lines) {
                line.hide('none');
                line.position();
            }
        }
    }

    showLines(): void {
        this.updateLines();
    }

    deleteLines(): void {
        for (const mapping of this._mappings) {
            mapping.deleteLines();
        }
    }

    removeMapping(mapping: LeaderLineMapping): void {
        this.mappings.delete(mapping);
        this.deleteLines();
        this.drawLines();
        Utils.delay(50);
        this.updateLines();
    }
}

