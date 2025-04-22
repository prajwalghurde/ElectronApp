const { ipcRenderer } = require('electron');
const path = require('path');

document.getElementById('error').textContent = '';
const screenshotList = document.getElementById('screenshot-list');
const previewImage = document.getElementById('preview-image');

// Store captured screenshots
let screenshots = [];

async function selectFolder() {
  const folder = await ipcRenderer.invoke('select-folder');
  if (folder) {
    document.getElementById('folder').value = folder;
  }
}

function startCapture() {
  const interval = parseInt(document.getElementById('interval').value);
  const folder = document.getElementById('folder').value;
  const format = document.getElementById('format').value;

  if (!interval || interval < 1) {
    showError('Please enter a valid interval (minimum 1 second)');
    return;
  }
  if (!folder) {
    showError('Please select a destination folder');
    return;
  }

  ipcRenderer.send('start-capture', { interval, folder, format });
  showError('Capture started');
}

function stopCapture() {
  ipcRenderer.send('stop-capture');
  showError('Capture stopped');
}

function showError(message) {
  const errorDiv = document.getElementById('error');
  errorDiv.textContent = message;
  setTimeout(() => (errorDiv.textContent = ''), 5000);
}

// Update screenshot list and show preview
function updateScreenshotList(filePath) {
  screenshots.push(filePath);
  const li = document.createElement('li');
  li.textContent = path.basename(filePath);
  li.addEventListener('click', () => {
    previewImage.src = `file://${filePath}`;
    previewImage.alt = path.basename(filePath);
  });
  screenshotList.appendChild(li);
}

// Clear list when capture stops
function clearScreenshotList() {
  screenshots = [];
  screenshotList.innerHTML = '';
  previewImage.src = '';
  previewImage.alt = 'Select a screenshot to preview';
}

ipcRenderer.on('error', (event, message) => {
  showError(message);
});

ipcRenderer.on('screenshot-saved', (event, filePath) => {
  updateScreenshotList(filePath);
});

ipcRenderer.on('stop-capture', () => {
  clearScreenshotList();
});