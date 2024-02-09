const express = require('express');
const cors = require('cors');
const { Storage } = require('@google-cloud/storage');
require('dotenv').config(); // Load environment variables from .env file

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());

const bucketName = process.env.BUCKET_NAME || 'videobrowserrec';
const keyFilePath = process.env.KEY_FILE_PATH || './glossy-infinity-413804-1a572d9bf40e.json';

const storage = new Storage({
  keyFilename: keyFilePath,
  projectId: process.env.PROJECT_ID || 'glossy-infinity-413804',
});

const bucket = storage.bucket(bucketName);

// Endpoint to generate a signed URL for direct upload
app.get('/generate-signed-url', async (req, res) => {
  try {
    const options = {
      version: 'v4',
      action: 'write',
      expires: Date.now() + 10 * 60 * 1000, // 10 minutes
      contentType: 'video/webm', // Make sure this matches client-side exactly
    };

    const fileName = `uploads/${Date.now()}_video.webm`;
    const [url] = await bucket.file(fileName).getSignedUrl(options);

    res.status(200).json({ url });
  } catch (err) {
    console.error('Error generating signed URL:', err);
    res.status(500).json({ message: 'Error generating signed URL.', error: err.message });
  }
});

app.get('/', (req, res) => {
  res.send('Welcome to the Video Upload Server!');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
