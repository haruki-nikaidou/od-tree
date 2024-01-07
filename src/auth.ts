import axios from "axios";

export type OauthEssentials = {
    refreshToken: string,
    clientId: string,
    clientSecret: string,
}

const authBaseUrl = "https://login.microsoftonline.com/common/oauth2/v2.0"

export async function fetchAccessToken(essential: OauthEssentials): Promise<string> {
    const {refreshToken, clientId, clientSecret } = essential;
    const oauthUrl = authBaseUrl + '/token';
    const requestBody = {
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'refresh_token',
        requested_token_use: 'on_behalf_of',
        refresh_token: refreshToken,
    }
    const response = await axios.post(oauthUrl, requestBody,{
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data["access_token"];
}

export async function getOneDriveDriveId(accessToken: string): Promise<string> {
    const url = 'https://graph.microsoft.com/v1.0/me/drive';

    try {
        const response = await axios.get(url, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });

        return response.data.id;
    } catch (error) {
        console.error('Error fetching OneDrive drive ID:', error);
        throw error;
    }
}