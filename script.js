let tokenClient;
let gapiInited = false;
let gisInited = false;

const CLIENT_ID = 'TU_CLIENT_ID';
const SCOPES = 'https://www.googleapis.com/auth/drive';

const authorizeButton = document.getElementById('authorizeButton');
const signOutButton = document.getElementById('signOutButton');
const captureButton = document.getElementById('captureButton');

function gapiLoaded() {
    gapi.load('client', initializeGapiClient);
}

async function initializeGapiClient() {
    try {
        await gapi.client.init({
            apiKey: 'TU_API_KEY',
            discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
        });
        gapiInited = true;
        maybeEnableButtons();
    } catch (error) {
        console.error('Error inicializando el cliente gapi:', error);
    }
}

function gisLoaded() {
    try {
        tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: CLIENT_ID,
            scope: SCOPES,
            callback: '', // Esto se configura dinámicamente
        });
        gisInited = true;
        maybeEnableButtons();
    } catch (error) {
        console.error('Error inicializando tokenClient:', error);
    }
}

function maybeEnableButtons() {
    if (gapiInited && gisInited) {
        authorizeButton.style.display = 'block';
    }
}

authorizeButton.onclick = () => {
    if (!tokenClient) {
        console.error('Token Client no inicializado.');
        return;
    }

    tokenClient.callback = async (resp) => {
        if (resp.error) {
            console.error('Error de autenticación:', resp.error);
            return;
        }

        authorizeButton.style.display = 'none';
        signOutButton.style.display = 'block';
        captureButton.style.display = 'block';
        listFiles();
    };

    tokenClient.requestAccessToken({ prompt: 'consent' });
};

signOutButton.onclick = () => {
    signOutButton.style.display = 'none';
    captureButton.style.display = 'none';
    authorizeButton.style.display = 'block';
};

async function listFiles() {
    try {
        const response = await gapi.client.drive.files.list({
            pageSize: 10,
            fields: 'files(id, name)',
        });
        const files = response.result.files;

        const filesList = document.getElementById('files');
        filesList.innerHTML = '';

        if (!files || files.length === 0) {
            document.getElementById('message').textContent = 'No se encontraron fotos.';
            return;
        }

        files.forEach((file) => {
            const li = document.createElement('li');
            li.textContent = file.name;
            filesList.appendChild(li);
        });
    } catch (error) {
        console.error('Error obteniendo archivos de Drive:', error);
    }
}
