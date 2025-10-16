declare class configType {
    childrenName?: string;
    pidName?: string;
    primaryKeyName?: string;
}
export declare const globalConfig: (c: configType) => void;
declare class T {
    private treeData;
    result: any;
    private childrenName;
    private primaryKeyName;
    private pidName;
    constructor(data: any);
    private matchCondition;
    private removeArrayItem;
    private getCurrentIndex;
    setConfig(c: configType): this;
    showConfig(): this;
    current(node: any): this;
    getAll(condition: any, options?: any): this;
    getFirst(condition: any, options?: any): this;
    getByKeys(keyName: any, arr: any, options?: any): this;
    first(): this;
    parents(): this;
    parent(): this;
    flat(): this;
    forEach(cb: any): this;
    next(): this;
    nextAll(): this;
    prev(): this;
    prevAll(): this;
    siblings(): this;
    remove(treeNode?: any): this;
    prepend(newArr: any): this;
    append(newArr: any): this;
    private deepClone;
    clone(): this;
    listToTree(rootId?: any): this;
    treeToList(): this;
    siblingsLength(): number;
    toFieldArray(key: any, deep?: boolean): object[];
    addDepth(fieldName?: string): this;
    getRightNodes(cb?: any): this;
    filter(condition: (node: any) => boolean): this;
}
declare const _default: (treeData?: any) => T;
export default _default;
