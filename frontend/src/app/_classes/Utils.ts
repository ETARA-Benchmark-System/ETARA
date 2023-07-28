import {Md5} from 'ts-md5';
import {settings} from '../../assets/settings';

export class Utils {

    /**
     * Methods sets thread to sleep for an amount of milliseconds.
     * @param ms - Amount of milliseconds to sleep.
     * @private
     */
    public static delay(ms: number) {
        return new Promise( resolve => setTimeout(resolve, ms) );
    }

    /**
     * Returns md5 hash of string.
     * @param str - String to hash.
     */
    getMd5Hash(str: string): string {
        return Md5.hashStr(str);
    }

    addHashToLocalEntity(entity: any): void{
        for (const entry of entity.valueList[0].fullKnowledge){
            entry.hash = Md5.hashStr(entry.path + entry.value).toString();
        }
    }

    addHashToWebEntity(entity: any): void{
        console.log(entity);
        for (const entry of entity.dictionary){
            entry.hash = Md5.hashStr(entry.path + entry.value).toString();
        }
    }

    formatApiPath(path: string): string {
        const context: string[] = path.match(settings.regexApiSearch);
        for (let i = 0; i < context.length; i++) {
            context[i] = context[i].replace(settings.regexApiReplace, '');
        }
        // remove wildcards
        for (let i = 0; i < context.length; i++) {
            context[i] = context[i].replace(settings.regexApiReplaceWildcard, '');
        }
        return context.join();
    }

    formatLocalPathShort(path: string): string {
        const context: string[] = path.match(settings.regexRelSearch);
        for (let i = 0; i < context.length; i++) {
            context[i] = context[i].replace(settings.regexRelReplace, '');
        }
        return context.join();
    }

    formatLocalPath(path: string): string {
        const paths: string[] = path.split(', ');
        const formattedPaths = [];
        for (const subpath of paths){
            formattedPaths.push(this.formatLocalPathShort(subpath));
        }
        return formattedPaths.join(' 🡢 ');
    }

    joinRelPaths(paths: string[]): string {
        return paths.join(settings.joinSymbol);
    }
}
