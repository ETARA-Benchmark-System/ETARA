export const settings = {
    regexRelSearch: /(#(\w)+)$|(\/[\w]+)$/g,
    regexRelReplace: /[#/]/g,
    joinSymbol: '🡢',

    regexApiSearch: /(\.[\w-\w]+(\[\*\])*)$/g,
    regexApiReplace: /[./]/g,
    regexApiReplaceWildcard: /(\[\*\])*$/g,

    rayCasterWorkingLayer: 1
};
