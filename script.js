let tokenClient;
let gapiInited = false;
let gisInited = false;

// Botones y elementos
const authorizeButton = document.getElementById('authorizeButton');
const signOutButton = document.getElementById('signOutButton');
const captureButton = document.getElementById('captureButton');
const photoGallery = document.getElementById('photoGallery');

// IDs y configuraciones
const CLIENT_ID = 'YOUR_CLIENT_ID';
const API_KEY = 'YOUR_API_KEY';
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';
const SCOPES = 'https://www.googleapis.com/auth/drive';

// Inicializar la API de Google
function gapiLoaded() {
    gapi.load('client', initializeGapiClient);
}

function gisLoaded() {
    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: '', // Se configura dinámicamente después
    });
    gisInited = true;
    maybeEnableButtons();
}

async function initializeGapiClient() {
    await gapi.client.init({
        apiKey: API_KEY,
        discoveryDocs: [DISCOVERY_DOC],
    });
    gapiInited = true;
    maybeEnableButtons();
}

function maybeEnableButtons() {
    if (gapiInited && gisInited) {
        authorizeButton.style.display = 'block';
    }
}

// Manejo de autorización
authorizeButton.onclick = () => {
    tokenClient.callback = async (resp) => {
        if (resp.error !== undefined) {
            throw (resp);
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
    authorizeButton.style.display = 'block';
    captureButton.style.display = 'none';
    photoGallery.innerHTML = '<p>Las fotos aparecerán aquí...</p>';
};

// Listar archivos de Google Drive
async function listFiles() {
    try {
        const response = await gapi.client.drive.files.list({
            'pageSize': 10,
            'fields': 'files(id, name, webViewLink, webContentLink)',
        });
        const files = response.result.files;
        photoGallery.innerHTML = ''; // Limpiar galería
        if (files && files.length > 0) {
            files.forEach((file) => {
                const img = document.createElement('img');
                img.src = file.webContentLink;
                img.alt = file.name;
                img.style.maxWidth = '100px';
                img.style.margin = '10px';
                photoGallery.appendChild(img);
            });
        } else {
            photoGallery.innerHTML = '<p>No se encontraron fotos.</p>';
        }
    } catch (err) {
        console.error('Error al listar archivos:', err.message);
    }
}
