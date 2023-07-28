import {Injectable} from '@angular/core';
import {settings} from '../../assets/settings';
import {AlignmentCubeService} from "../_components/alignment-cube/engine/alignment-cube.service";

@Injectable({
    providedIn: 'root'
})
export class PathFormatterService {

    constructor() {}

    public formatApiPath(alignmentCubeService: AlignmentCubeService, path: string, prefix: string): string {
        let suffix;
        if(!alignmentCubeService.showFullApiPath) suffix = path.replace(prefix,"");
        else suffix= path;

        return suffix;
    }

    public formatRelationPath(alignmentCubeService: AlignmentCubeService, path: string): string {
        if(!alignmentCubeService.showFullRelationPath){
            const context: string[] = path.match(settings.regexRelSearch);

            if (context == null){
                return path;
            }

            for (let i = 0; i < context.length; i++) {
                context[i] = context[i].replace(settings.regexRelReplace, '');
            }

            return context.join();
        }

        return path;
    }

    public joinRelPaths(paths: string[]): string {
        return paths.join(settings.joinSymbol);
    }
}
