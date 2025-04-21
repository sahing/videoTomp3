const { createFFmpeg, fetchFile } = FFmpeg;
const ffmpeg = createFFmpeg({ log: true });

const uploadArea = document.getElementById('upload-area');
const fileInput = document.getElementById('file-input');
const fileNameDisplay = document.getElementById('file-name');
const convertBtn = document.getElementById('convert-btn');
const progressBar = document.getElementById('progress-bar');
const progress = document.getElementById('progress');
const statusText = document.getElementById('status-text');
const downloadLink = document.getElementById('download-link');

let selectedFile = null;

// Drag-and-drop functionality
uploadArea.addEventListener('dragover', (e) => {
  e.preventDefault();
  uploadArea.classList.add('dragging');
});

uploadArea.addEventListener('dragleave', () => {
  uploadArea.classList.remove('dragging');
});

uploadArea.addEventListener('drop', (e) => {
  e.preventDefault();
  uploadArea.classList.remove('dragging');
  handleFile(e.dataTransfer.files[0]);
});

// File input click
document.getElementById('file-select').addEventListener('click', () => {
  fileInput.click();
});

fileInput.addEventListener('change', (e) => {
  handleFile(e.target.files[0]);
});

// Handle file selection
function handleFile(file) {
  if (file && file.type.startsWith('video/')) {
    selectedFile = file;
    fileNameDisplay.textContent = `Selected file: ${file.name}`;
    convertBtn.disabled = false;
  } else {
    alert('Please select a valid video file.');
  }
}

// Initialize FFmpeg
async function loadFFmpeg() {
  statusText.textContent = 'Loading FFmpeg...';
  await ffmpeg.load();
  statusText.textContent = 'FFmpeg loaded. Ready to convert.';
}

loadFFmpeg();

// Convert video to MP3
convertBtn.addEventListener('click', async () => {
  if (!selectedFile) return;

  convertBtn.disabled = true;
  statusText.textContent = 'Converting...';
  progressBar.style.display = 'block';

  const fileName = selectedFile.name.split('.').slice(0, -1).join('.') + '.mp3';

  ffmpeg.FS('writeFile', selectedFile.name, await fetchFile(selectedFile));

  await ffmpeg.run(
    '-i',
    selectedFile.name,
    '-q:a',
    '0',
    '-map',
    'a',
    fileName
  );

  const data = ffmpeg.FS('readFile', fileName);

  const mp3Blob = new Blob([data.buffer], { type: 'audio/mpeg' });
  const mp3Url = URL.createObjectURL(mp3Blob);

  downloadLink.href = mp3Url;
  downloadLink.download = fileName;
  downloadLink.hidden = false;

  statusText.textContent = 'Conversion complete!';
  progressBar.style.display = 'none';
  progress.style.width = '0%';
  convertBtn.disabled = false;
});