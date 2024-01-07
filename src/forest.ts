import {
    addFile,
    back,
    cd,
    combineDirectory,
    CompressedPaths, compressPath,
    cp,
    Directory,
    File,
    fromOdTree,
    mkdir,
    rename,
    rm
} from "./fileSystem";
import {DirectoryNode} from "./index";

export class OnedriveTreeFs {
    root: Directory;
    index: CompressedPaths;

    constructor(tree: DirectoryNode) {
        this.root = fromOdTree(tree);
        this.index = compressPath(this.root);
    }

    cd(path: symbol[]) {
        return cd(path, this.root);
    }

    back(path: symbol[]) {
        return back(path, this.root);
    }

    mkdir(path: symbol[], name: string) {
        return mkdir(path, this.root, name);
    }

    rm(path: symbol[]) {
        return rm(path, this.root);
    }

    cp(path: symbol[], newPath: symbol[]) {
        return cp(path, this.root, newPath);
    }

    mv(path: symbol[], newPath: symbol[]) {
        this.cp(path, newPath);
        this.rm(path);
    }

    addFile(path: symbol[], file: File) {
        addFile(path, this.root, file);
    }

    rename(path: symbol[], newName: string) {
        rename(path, this.root, newName);
    }

    updateIndex() {
        this.index = compressPath(this.root);
    }

    query(path: string) {
        return this.index.get(path);
    }

    static combine(fs1: OnedriveTreeFs, fs2: OnedriveTreeFs): OnedriveTreeFs {
        const root = new OnedriveTreeFs({
            name: 'root',
            type: 'directory',
            children: [],
        } as DirectoryNode);
        root.root = combineDirectory(fs1.root, fs2.root);
        return root;
    }
}

export default class OnedriveForestFs extends OnedriveTreeFs {
    constructor(trees: DirectoryNode[]) {
        super({
            name: 'root',
            type: 'directory',
            children: [],
        } as DirectoryNode);
        const roots = trees.map(tree => fromOdTree(tree));
        this.root = mergeArray(roots, combineDirectory);
    }
}

function mergePairs<T>(array: T[], mergeFunction: (a: T, b: T) => T): T[] {
    let merged = [];
    for (let i = 0; i < array.length; i += 2) {
        if (i + 1 < array.length) {
            merged.push(mergeFunction(array[i], array[i + 1]));
        } else {
            merged.push(array[i]);
        }
    }
    return merged;
}

function mergeArray<T>(array: T[], mergeFunction: (a: T, b: T) => T): T {
    while (array.length > 1) {
        array = mergePairs(array, mergeFunction);
    }
    return array[0];
}