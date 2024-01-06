import {getAccessToken, getOneDriveDriveId} from "./auth";
import OnedriveForestFs, { OnedriveTreeFs } from "./forest";
import {buildTree} from "./recursive";
import {recursiveBuildDirectory} from "./recursive";
import type {FileNodeType, FileNode, FileTree,DirectoryNode, DriveToken,OnedriveAccount} from "./types/odTree";
import * as fileSystem from './fileSystem'

export default async function OdTree(clientId: string, clientSecret: string, tenantId: string): Promise<FileTree> {
    const accessToken = await getAccessToken(clientId, clientSecret, tenantId);
    const driveId = await getOneDriveDriveId(accessToken);
    return buildTree({
        accessToken,
        driveId,
    })
}

const auth = {
    getAccessToken, getOneDriveDriveId
}

const recursiveBuild = {
    buildTree, recursiveBuildDirectory
}

const forest = {
    OnedriveForestFs,
    OnedriveTreeFs,
    fileSystem
}

export {
    auth, recursiveBuild, forest,
    FileNodeType, FileNode, DirectoryNode, DriveToken, FileTree,
    OnedriveAccount
}