import {DirectoryNode, FileNode} from "./index";

export type File = {
    name: string,
    size: number,
    downloadUrl: string[],
    symbol: symbol,
};

export type Directory = {
    name: string,
    files: {
        [key in symbol]: File
    }
    subdirectories: {
        [key in symbol]: Directory
    }
    indexes: symbol[],
    parent?: Directory,
    symbol: symbol,
};

export type CompressedPaths = Map<string, File>;

export function fromOdTree(tree: DirectoryNode): Directory {
    const root: Directory = {
        name: 'root',
        files: {},
        subdirectories: {},
        indexes: [],
        symbol: Symbol('root'),
    };

    // files
    for (const file of tree.children.filter(node => node.type === 'file')) {
        const index = Symbol(file.name);
        root.files[index] = {
            name: file.name,
            size: file.size?? 0,
            downloadUrl: [(file as FileNode).downloadUrl],
            symbol: index,
        };
        root.indexes.push(index);
    }
    // recursively build directories
    const directories = [];
    for (const dir of tree.children.filter(node => node.type === 'directory')) {
        directories.push(fromOdTree(dir as DirectoryNode));
    }
    for (const dir of directories) {
        const index = Symbol(dir.name);
        root.subdirectories[index] = dir;
        root.indexes.push(index);
    }

    return root;
}

export function cd(path: symbol[], root: Directory): Directory {
    let current = root;
    for (const dir of path) {
        current = current.subdirectories[dir];
    }
    return current;
}

export function back(path: symbol[], root: Directory): Directory | undefined {
    let current = root;
    for (const dir of path) {
        current = current.subdirectories[dir];
    }
    return current.parent;
}

export function mkdir(path: symbol[], root: Directory, name: string): void {
    const newDir: Directory = {
        name,
        files: {},
        subdirectories: {},
        indexes: [],
        symbol: Symbol(name),
    };
    const parent = cd(path, root);
    newDir.parent = parent;
    const index = Symbol(name);
    parent.subdirectories[index] = newDir;
    parent.indexes.push(index);
}

export function mv(path: symbol[], root: Directory, newPath: symbol[]): void {
    const dir = cd(path, root);
    const parent = back(path, root);
    if (parent) {
        const index = parent.indexes.indexOf(path[path.length - 1]);
        parent.indexes.splice(index, 1);
        parent.indexes.push(newPath[newPath.length - 1]);
        parent.subdirectories[newPath[newPath.length - 1]] = dir;
    } else {
        throw new Error('Cannot move root directory');
    }
}

export function rm(path: symbol[], root: Directory): void {
    const parent = back(path, root);
    if (parent) {
        const index = parent.indexes.indexOf(path[path.length - 1]);
        parent.indexes.splice(index, 1);
    } else {
        throw new Error('Cannot remove root directory');
    }
}

export function cp(path: symbol[], root: Directory, newPath: symbol[]): void {
    const dir = cd(path, root);
    const parent = cd(newPath, root);
    const index = Symbol(dir.name);
    parent.subdirectories[index] = dir;
    parent.indexes.push(index);
}

export function newRoot(): Directory {
    return {
        name: 'root',
        files: {},
        subdirectories: {},
        indexes: [],
        symbol: Symbol('root'),
    };
}

export function addFile(path: symbol[], root: Directory, file: File): void {
    const dir = cd(path, root);
    const index = Symbol(file.name);
    dir.files[index] = file;
    dir.indexes.push(index);
}

export function mount(parent_root: Directory, child_root: Directory, dirPath: symbol[]): void {
    const parent = cd(dirPath, parent_root);
    const index = Symbol(child_root.name);
    parent.subdirectories[index] = child_root;
    parent.indexes.push(index);
}

export function rename(path: symbol[], root: Directory, newName: string): void {
    let dirOrFile = root;
    for (let i = 0; i < path.length - 1; i++) {
        dirOrFile = dirOrFile.subdirectories[path[i]];
    }
    let target: Directory | File = dirOrFile.subdirectories[path[path.length - 1]];
    if (!target) {
        target = dirOrFile.files[path[path.length - 1]];
    }
    target.name = newName;
}

export function combineFile(a: File, b: File): File {
    return {
        name: a.name,
        size: a.size,
        downloadUrl: [...a.downloadUrl, ...b.downloadUrl],
        symbol: Symbol(a.name),
    };
}

export function combineDirectory(a: Directory, b: Directory): Directory {
    // create new root
    const newRoot: Directory = {
        name: 'root',
        files: {},
        subdirectories: {},
        indexes: [],
        symbol: Symbol('root'),
    };

    // create maps to map file names to symbols
    const aNameToSymbol = new Map<string, symbol>();
    const bNameToSymbol = new Map<string, symbol>();
    const aFilesSymbols = Object.getOwnPropertySymbols(a.files);
    const bFilesSymbols = Object.getOwnPropertySymbols(b.files);
    // find the files with same name
    for (const symbol of aFilesSymbols) {
        const file = a.files[symbol];
        aNameToSymbol.set(file.name, symbol);
    }
    for (const symbol of bFilesSymbols) {
        const file = b.files[symbol];
        bNameToSymbol.set(file.name, symbol);
    }
    const aNameSet = new Set(aNameToSymbol.keys());
    const bNameSet = new Set(bNameToSymbol.keys());
    const needToCombineFilesNames = intersection(aNameSet, bNameSet);

    // combine and copy files
    // 1. copy all files in `a` and `b` into new root
    for (const symbol of aFilesSymbols) {
        newRoot.files[symbol] = a.files[symbol];
        newRoot.indexes.push(symbol);
    }
    for (const symbol of bFilesSymbols) {
        newRoot.files[symbol] = b.files[symbol];
        newRoot.indexes.push(symbol);
    }
    // 2. combine files with same name
    for (const name of needToCombineFilesNames) {
        const aFile = a.files[aNameToSymbol.get(name)!];
        const bFile = b.files[bNameToSymbol.get(name)!];
        const combinedFile = combineFile(aFile, bFile);
        newRoot.files[combinedFile.symbol] = combinedFile;
        newRoot.indexes.push(combinedFile.symbol);
    }

    // recursively combine and copy directories
    // 1. find the directories with same name
    const aSubdirectoriesSymbols = Object.getOwnPropertySymbols(a.subdirectories);
    const bSubdirectoriesSymbols = Object.getOwnPropertySymbols(b.subdirectories);
    const aSubdirectoriesNameToSymbol = new Map<string, symbol>();
    const bSubdirectoriesNameToSymbol = new Map<string, symbol>();
    for (const symbol of aSubdirectoriesSymbols) {
        const dir = a.subdirectories[symbol];
        aSubdirectoriesNameToSymbol.set(dir.name, symbol);
    }
    for (const symbol of bSubdirectoriesSymbols) {
        const dir = b.subdirectories[symbol];
        bSubdirectoriesNameToSymbol.set(dir.name, symbol);
    }
    const aSubdirectoriesNameSet = new Set(aSubdirectoriesNameToSymbol.keys());
    const bSubdirectoriesNameSet = new Set(bSubdirectoriesNameToSymbol.keys());
    const needToCombineDirectoriesNames = intersection(aSubdirectoriesNameSet, bSubdirectoriesNameSet);
    // 2. copy all directories in `a` and `b` into new root
    for (const symbol of aSubdirectoriesSymbols) {
        newRoot.subdirectories[symbol] = a.subdirectories[symbol];
        newRoot.indexes.push(symbol);
    }
    // 3. combine directories with same name recursively
    for (const name of needToCombineDirectoriesNames) {
        const aDir = a.subdirectories[aSubdirectoriesNameToSymbol.get(name)!];
        const bDir = b.subdirectories[bSubdirectoriesNameToSymbol.get(name)!];
        const combinedDir = combineDirectory(aDir, bDir);
        newRoot.subdirectories[combinedDir.symbol] = combinedDir;
        newRoot.indexes.push(combinedDir.symbol);
    }

    return newRoot;
}

function intersection(setA: Set<string>, setB: Set<string>): Set<string> {
    return new Set([...setA].filter(x => setB.has(x)));
}

function pathToString(path: symbol[], root: Directory): string {
    let current = root;
    let pathString = '/';
    for (const dir of path) {
        pathString += encodeURIComponent(current.subdirectories[dir].name) + '/';
        current = current.subdirectories[dir];
    }
    return pathString;
}

export function compressPath(root: Directory): CompressedPaths {
    const compressedPaths = new Map<string, File>();
    const pathStack: symbol[] = [];

    // files
    const fileSymbols = Object.getOwnPropertySymbols(root.files);
    for (const symbol of fileSymbols) {
        const file = root.files[symbol];
        const path = pathToString(pathStack, root);
        compressedPaths.set(path + encodeURIComponent(file.name), file);
    }

    // recursively compress directories
    function compressDirectory(dir: Directory): void {
        const dirSymbols = Object.getOwnPropertySymbols(dir.subdirectories);
        for (const symbol of dirSymbols) {
            const subDir = dir.subdirectories[symbol];
            pathStack.push(symbol);
            compressDirectory(subDir);
            pathStack.pop();
        }
        const fileSymbols = Object.getOwnPropertySymbols(dir.files);
        for (const symbol of fileSymbols) {
            const file = dir.files[symbol];
            const path = pathToString(pathStack, root);
            compressedPaths.set(path + encodeURIComponent(file.name), file);
        }
    }
    compressDirectory(root);

    return compressedPaths;
}