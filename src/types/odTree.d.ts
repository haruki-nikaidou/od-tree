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

export type DriveToken = {
    driveId: string,
    accessToken: string,
}

export type FileTree = DirectoryNode;

export type OnedriveAccount = {
    clientId: string,
    clientSecret: string,
    tenantId: string
}