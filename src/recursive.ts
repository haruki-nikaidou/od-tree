import {DirectoryNode, DriveToken, FileNodeType, FileTree} from "./types/odTree";
import {DirectoryResponse, FileResponse, fileResponseToNode, requestList} from "./request";


export async function recursiveBuildDirectory(directoryId: string, token: DriveToken, name: string, size?: number): Promise<DirectoryNode> {
    const listResponse = await requestList(directoryId, token)
    const files = (listResponse.filter((node) => "file" in node) as FileResponse[])
        .map((node) =>
            fileResponseToNode(node)
        );
    const directories = listResponse.filter((node) => "folder" in node);
    const directoryNodes = await Promise.all(directories.map(async (directory) => {
        const directoryResponse = directory as DirectoryResponse;
        return await recursiveBuildDirectory(directoryResponse.id, token, directoryResponse.name, directoryResponse.size);
    }));
    return {
        name: name,
        type: FileNodeType.Directory,
        size: size,
        children: [...files, ...directoryNodes],
    }
}

export async function buildTree(token: DriveToken): Promise<FileTree> {
    return await recursiveBuildDirectory('root', token, 'root');
}