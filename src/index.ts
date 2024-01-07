import * as fileSystem from './fileSystem'
import * as auth from './auth';
import * as request from './request';
import * as recursive from './recursive';
import * as forest from './forest';

export enum FileNodeType {
    File = 'file',
    Directory = 'directory'
}

export type FileNode = {
    name: string,
    size: number,
    downloadUrl: string,
    type: FileNodeType.File,
}

export type DirectoryNode = {
    name: string,
    type: FileNodeType.Directory,
    size?: number,
    children: (FileNode | DirectoryNode)[]
}

export type Drive = {
    driveId: string,
    accessToken: string,
}

export type FileTree = DirectoryNode;

export function OnedriveTree(drive: Drive): Promise<FileTree> {
    return recursive.buildTree(drive);
}

export {
    fileSystem, auth, request, recursive, forest
}
