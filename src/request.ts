import axios from "axios";
import {Drive, FileNode, FileNodeType} from "./index";

export type FileResponse = {
    name: string,
    size: number,
    "@microsoft.graph.downloadUrl": string,
    file: {
        mimeType: string,
    },
}

export type DirectoryResponse = {
    id: string,
    name: string,
    size: number,
    folder: {
        childCount: number,
    }
}

export type ListResponse = {
    value: (FileResponse | DirectoryResponse)[]
}

function requestListUrl(directoryId: string, driveId: string): string {
    return `https://graph.microsoft.com/v1.0/drives/${driveId}/items/${directoryId}/children`
}

function cleanFileResponse(fileResponse: FileResponse): FileResponse {
    return {
        name: fileResponse.name,
        size: fileResponse.size,
        "@microsoft.graph.downloadUrl": fileResponse["@microsoft.graph.downloadUrl"],
        file: {
            mimeType: fileResponse.file.mimeType,
        },
    }
}

function cleanDirectoryResponse(directoryResponse: DirectoryResponse): DirectoryResponse {
    return {
        id: directoryResponse.id,
        name: directoryResponse.name,
        size: directoryResponse.size,
        folder: {
            childCount: directoryResponse.folder.childCount,
        },
    }
}

function cleanListResponse(listResponse: ListResponse): (FileResponse | DirectoryResponse)[] {
    return listResponse.value.map((node) => {
        if ("file" in node) {
            return cleanFileResponse(node)
        } else {
            return cleanDirectoryResponse(node)
        }
    })
}

export async function requestList(directoryId: string, token: Drive): Promise<(FileResponse | DirectoryResponse)[]> {
    const url = requestListUrl(directoryId, token.driveId);
    const res = await axios.get(url, {
        headers: {
            Authorization: `Bearer ${token.accessToken}`,
        }
    });
    const data = res.data as ListResponse;
    return cleanListResponse(data);
}

export function fileResponseToNode(fileResponse: FileResponse): FileNode {
    return {
        name: fileResponse.name,
        size: fileResponse.size,
        downloadUrl: fileResponse["@microsoft.graph.downloadUrl"],
        type: FileNodeType.File,
    }
}