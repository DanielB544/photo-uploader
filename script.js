// Client ID and API key from the Developer Console
const CLIENT_ID = '419971965316-34vqaqd2q4be4r9rb5a8nk2cpenmet0f.apps.googleusercontent.com';
const API_KEY = 'AIzaSyCCPZ6-0rxy8cHo8j631qGcf641qixq9PI';

// Array of API discovery doc URLs for APIs used by the app
const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
const SCOPES = "https://www.googleapis.com/auth/drive.file";

const authorizeButton = document.getElementById('authorizeButton');
const signOutButton = document.getElementById('signOutButton');
const captureButton = document.getElementById('captureButton');
const photoInput = document.getElementById('photoInput');
const photoGallery = document.getElementById('photoGallery');

// Load the API and make an API call
function handleClientLoad() {
    gapi.load('client:auth2', initClient);
}

// Initialize the API client library and set up sign-in state listeners
function initClient() {
    gapi.client.init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        discoveryDocs: DISCOVERY_DOCS,
        scope: SCOPES
    }).then(() => {
        const GoogleAuth = gapi.auth2.getAuthInstance();
        authorizeButton.onclick = () => GoogleAuth.signIn();
        signOutButton.onclick = () => GoogleAuth.signOut();

        // Listen for sign-in state changes
        GoogleAuth.isSignedIn.listen(updateSigninStatus);
        updateSigninStatus(GoogleAuth.isSignedIn.get());
    }, (error) => {
        console.error(JSON.stringify(error, null, 2));
    });
}

// Update UI based on user's sign-in status
function updateSigninStatus(isSignedIn) {
    if (isSignedIn) {
        authorizeButton.style.display = 'none';
        signOutButton.style.display = 'block';
        captureButton.style.display = 'block';
        loadDrivePhotos();
    } else {
        authorizeButton.style.display = 'block';
        signOutButton.style.display = 'none';
        captureButton.style.display = 'none';
    }
}

// Load photos from Google Drive
function loadDrivePhotos() {
    gapi.client.drive.files.list({
        'pageSize': 10,
        'fields': "nextPageToken, files(id, name, webViewLink, thumbnailLink)"
    }).then(response => {
        const files = response.result.files;
        photoGallery.innerHTML = '';
        if (files && files.length > 0) {
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
    });
}

// Upload a photo to Google Drive
captureButton.addEventListener('click', () => {
    photoInput.click();
});

photoInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = () => {
            const fileData = new Blob([reader.result], { type: file.type });
            const metadata = {
                'name': file.name,
                'mimeType': file.type
            };
            const formData = new FormData();
            formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
            formData.append('file', fileData);

            fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
                method: 'POST',
                headers: new Headers({ 'Authorization': 'Bearer ' + gapi.auth.getToken().access_token }),
                body: formData
            }).then(response => response.json()).then(() => {
                loadDrivePhotos();
            }).catch(error => console.error('Error uploading photo:', error));
        };
        reader.readAsArrayBuffer(file);
    }
});

// Load the Google API client library
handleClientLoad();
