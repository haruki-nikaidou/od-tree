# OD Tree
List all files in onedrive as a file tree.

## Usage

### Easiest way: `OdTree`

```ts
import OdTree from "onedrive-tree";
await OdTree({clientId, clientSecret, refreshToken});
```

If you have got the `accessToken`, you can use 

```ts
import {buildTree} from "onedrive-tree";
await buildTree(accessToken)
```

## API

### Data Structure


```ts
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

export type FileTree = DirectoryNode;
```

The `token`'s type is 

```ts
export type DriveToken = {
    driveId: string,
    accessToken: string,
}
```

### Auth

+ `getAccessToken(clientId: string, clientSecret: string, tenantId: string): Promise<string>`
+ `getOneDriveDriveId(accessToken: string): Promise<string>`

### Request But not Parse

+ `requestList(directoryId: string, token: DriveToken): Promise<(FileResponse | DirectoryResponse)[]>`

### Request and Parse

+ `recursiveBuildDirectory(directoryId: string, token: DriveToken, name: string, size?: number): Promise<DirectoryNode>`
+ `buildFileTree(directoryId: string, token: DriveToken): Promise<FileTree>`