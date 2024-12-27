const CLIENT_ID = 419971965316;
const API_KEY = AIzaSyC9AloGpAfOH187vJLfJZtYsZePk38mPWs;
const DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'];
const SCOPES = 'https://www.googleapis.com/auth/drive.file';

const authorizeButton = document.getElementById('authorizeButton');
const signOutButton = document.getElementById('signOutButton');
const captureButton = document.getElementById('captureButton');
const photoInput = document.getElementById('photoInput');
const photoGallery = document.getElementById('photoGallery');

let folderId = '1v75e_DffYt6yyYnjPCHUo6tJwc9osuVV';

// Load auth2 library
function handleClientLoad() {
    gapi.load('client:auth2', initClient);
}

// Initialize the API client library
function initClient() {
    gapi.client.init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        discoveryDocs: DISCOVERY_DOCS,
        scope: SCOPES,
    }).then(() => {
        const authInstance = gapi.auth2.getAuthInstance();
        updateSigninStatus(authInstance.isSignedIn.get());
        authInstance.isSignedIn.listen(updateSigninStatus);

        authorizeButton.onclick = () => authInstance.signIn();
        signOutButton.onclick = () => authInstance.signOut();
    });
}

// Update the UI based on sign-in status
function updateSigninStatus(isSignedIn) {
    if (isSignedIn) {
        authorizeButton.style.display = 'none';
        signOutButton.style.display = 'block';
        captureButton.style.display = 'block';
    } else {
        authorizeButton.style.display = 'block';
        signOutButton.style.display = 'none';
        captureButton.style.display = 'none';
    }
}

// Handle photo upload
captureButton.addEventListener('click', () => {
    photoInput.click();
});

photoInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        uploadFileToDrive(file);
    }
});

// Upload file to Google Drive
function uploadFileToDrive(file) {
    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify({
        name: file.name,
        parents: [folderId],
    })], { type: 'application/json' }));
    form.append('file', file);

    fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${gapi.auth.getToken().access_token}`,
        },
        body: form,
    }).then(response => response.json())
      .then(data => {
          alert('File uploaded successfully!');
          displayUploadedPhoto(file);
      }).catch(error => {
          console.error('Error uploading file:', error);
          alert('Failed to upload file.');
      });
}

// Display uploaded photo in the gallery
function displayUploadedPhoto(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = document.createElement('img');
        img.src = e.target.result;
        photoGallery.appendChild(img);
    };
    reader.readAsDataURL(file);
}

// Load the client library when the page loads
document.addEventListener('DOMContentLoaded', handleClientLoad);
