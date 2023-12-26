import axios from "axios";

export async function getAccessToken(clientId: string, clientSecret: string, tenantId: string): Promise<string> {
    const url = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;
    const params = new URLSearchParams();
    params.append('client_id', clientId);
    params.append('scope', 'https://graph.microsoft.com/.default');
    params.append('client_secret', clientSecret);
    params.append('grant_type', 'client_credentials');

    try {
        const response = await axios.post(url, params, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        return response.data["access_token"];
    } catch (error) {
        console.error('Error obtaining access token from Microsoft Graph API:', error);
        throw error;
    }
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