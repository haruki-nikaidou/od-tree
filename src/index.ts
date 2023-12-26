import {getAccessToken, getOneDriveDriveId} from "./auth";
import {buildTree} from "./recursive";
import {recursiveBuildDirectory} from "./recursive";

export default async function OdTree(clientId: string, clientSecret: string, tenantId: string) {
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