const CLIENT_ID = '419971965316-51t031aqvk1vhetq7n71ncsl87j4prgc.apps.googleusercontent.com';
const API_KEY = 'AIzaSyCCPZ6-0rxy8cHo8j631qGcf641qixq9PI';
const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];
const SCOPES = "https://www.googleapis.com/auth/drive.file";

const authorizeButton = document.getElementById('authorizeButton');
const signOutButton = document.getElementById('signOutButton');
const captureButton = document.getElementById('captureButton');
const photoInput = document.getElementById('photoInput');
const photoGallery = document.getElementById('photoGallery');

let tokenClient; // Token Client para Google Identity Services
let gapiInited = false; // Control de inicialización de gapi
let gisInited = false; // Control de inicialización de GIS

/**
 * Cargar la librería de gapi y inicializar
 */
function handleClientLoad() {
    gapi.load('client', initGapiClient);
}

/**
 * Inicializa el cliente de GAPI
 */
function initGapiClient() {
    gapi.client.init({
        apiKey: API_KEY,
        discoveryDocs: DISCOVERY_DOCS,
    }).then(() => {
        gapiInited = true;
        enableAuthorizeButton();
    }).catch(error => console.error('Error initializing GAPI client:', error));
}

/**
 * Inicializa Google Identity Services (GIS)
 */
function initGISClient() {
    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: (response) => {
            if (response.error) {
                console.error('Error during token request:', response.error);
                return;
            }
            loadDrivePhotos(); // Cargar fotos al obtener el token
        },
    });
    gisInited = true;
    enableAuthorizeButton();
}

/**
 * Habilita el botón de autorización si GIS y GAPI están inicializados
 */
function enableAuthorizeButton() {
    if (gapiInited && gisInited) {
        authorizeButton.style.display = 'block';
        authorizeButton.onclick = () => tokenClient.requestAccessToken();
    }
}

/**
 * Cargar las fotos de Google Drive
 */
function loadDrivePhotos() {
    gapi.client.drive.files.list({
        'pageSize': 10,
        'fields': "nextPageToken, files(id, name, webViewLink, thumbnailLink)"
    }).then(response => {
        const files = response.result.files.filter(file => file.thumbnailLink);
        photoGallery.innerHTML = '';
        if (files.length > 0) {
            files.forEach(file => {
                const img = document.createElement('img');
                img.src = file.thumbnailLink;
                img.alt = file.name;
                img.onclick = () => window.open(file.webViewLink, '_blank');
                photoGallery.appendChild(img);
            });
        } else {
            photoGallery.innerHTML = '<p>No photos found.</p>';
        }
    }).catch(error => console.error('Error loading photos:', error));
}

/**
 * Manejar captura de fotos y subirlas a Google Drive
 */
captureButton.addEventListener('click', () => {
    photoInput.click();
});

photoInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = () => {
            const metadata = {
                'name': file.name,
                'mimeType': file.type
            };
            const formData = new FormData();
            formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
            formData.append('file', new Blob([reader.result], { type: file.type }));

            const token = google.accounts.oauth2.initTokenClient().access_token;

            fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
                method: 'POST',
                headers: new Headers({ 'Authorization': 'Bearer ' + token }),
                body: formData
            }).then(response => response.json()).then(() => {
                loadDrivePhotos();
            }).catch(error => console.error('Error uploading photo:', error));
        };
        reader.readAsArrayBuffer(file);
    }
});

// Cargar GIS y GAPI
document.addEventListener('DOMContentLoaded', () => {
    initGISClient(); // Inicializa GIS
    handleClientLoad(); // Cargar GAPI
});
