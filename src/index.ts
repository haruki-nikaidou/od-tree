import {getAccessToken, getOneDriveDriveId} from "./auth";
import {buildTree} from "./recursive";
import {recursiveBuildDirectory} from "./recursive";
import {FileTree} from "./types/odTree";

export default async function OdTree(clientId: string, clientSecret: string, tenantId: string): Promise<FileTree> {
    const accessToken = await getAccessToken(clientId, clientSecret, tenantId);
    const driveId = await getOneDriveDriveId(accessToken);
    return buildTree({
        accessToken,
        driveId,
    })
}

export {
    getAccessToken,
    getOneDriveDriveId,
    buildTree,
    recursiveBuildDirectory,
}