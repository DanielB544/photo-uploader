// Variables globales
let tokenClient;
let gapiInited = false;
let gisInited = false;

const CLIENT_ID = 'TU_CLIENT_ID';
const SCOPES = 'https://www.googleapis.com/auth/drive';

const authorizeButton = document.getElementById('authorizeButton');
const signOutButton = document.getElementById('signOutButton');
const captureButton = document.getElementById('captureButton');

// Hacer las funciones accesibles globalmente
window.gapiLoaded = function () {
  console.log("Cargando GAPI...");
  gapi.load('client', initializeGapiClient);
};

window.gisLoaded = function () {
  console.log("Cargando GIS...");
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES,
    callback: '', // Esto se configura dinámicamente
  });
  gisInited = true;
  maybeEnableButtons();
};

async function initializeGapiClient() {
  try {
    await gapi.client.init({
      apiKey: 'TU_API_KEY',
      discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
    });
    console.log("GAPI inicializado.");
    gapiInited = true;
    maybeEnableButtons();
  } catch (error) {
    console.error('Error inicializando GAPI:', error);
  }
}

function maybeEnableButtons() {
  console.log("Estado de inicialización:", { gapiInited, gisInited });
  if (gapiInited && gisInited) {
    authorizeButton.style.display = 'block';
  }
}

// Event listeners para los botones
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
    console.log("Autenticado correctamente.");
  };

  tokenClient.requestAccessToken({ prompt: 'consent' });
};

signOutButton.onclick = () => {
  console.log("Cerrando sesión...");
  signOutButton.style.display = 'none';
  captureButton.style.display = 'none';
  authorizeButton.style.display = 'block';
};
