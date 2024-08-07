import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Switch, FormControlLabel, TextField } from '@mui/material';

const Home = () => {
  const [videoUrl, setVideoUrl] = useState('');
  const [shortUrls, setShortUrls] = useState([]);
  const [shorts, setShorts] = useState([]);
  const [viewingShorts, setViewingShorts] = useState(true); // Toggle state
  const [shortLink, setShortLink] = useState('');
  const [shortDownloadUrl, setShortDownloadUrl] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.post('http://localhost:5000/process-video', {
        url: videoUrl,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setShortUrls(response.data.fileUrls);
    } catch (error) {
      console.error('Error processing video', error);
    }
  };

  const handleShortLinkSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.post('http://localhost:5000/download-short', {
        url: shortLink,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setShortDownloadUrl(response.data.fileUrl);
    } catch (error) {
      console.error('Error downloading short', error);
    }
  };

  useEffect(() => {
    const fetchShorts = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get('http://localhost:5000/list-shorts', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setShorts(response.data.shorts);
      } catch (error) {
        console.error('Error fetching shorts', error);
      }
    };
    fetchShorts();
  }, []);

  const handleDownload = (url) => {
    console.log('Downloading from URL:', url);
    const link = document.createElement('a');
    link.href = url;
    link.download = url.split('/').pop();
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCompleteVideoDownload = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.post('http://localhost:5000/download-video', {
        url: videoUrl,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      handleDownload(response.data.fileUrl);
    } catch (error) {
      console.error('Error downloading complete video', error);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">YouTube Video Shortener</h1>
      <form onSubmit={handleSubmit} className="mb-4">
        <label className="block mb-2">
          <span className="text-gray-700">YouTube Video URL:</span>
          <input
            type="text"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            required
            className="mt-1 block w-full p-2 border border-gray-300 rounded"
          />
        </label>
        <button
          type="submit"
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
        >
          Generate Shorts
        </button>
      </form>

      {/* Toggle switch for sorting/viewing vs. complete video download */}
      <FormControlLabel
        control={
          <Switch
            checked={viewingShorts}
            onChange={() => setViewingShorts(!viewingShorts)}
            name="viewingShorts"
            color="primary"
          />
        }
        label={viewingShorts ? 'View and Download Shorts' : 'Download Complete Video'}
      />

      {viewingShorts ? (
        <div>
          {shortUrls.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold mb-4">Preview and Download Your Shorts</h2>
              {shortUrls.map((url, index) => (
                <div key={index} className="mb-4">
                  <h3 className="text-xl font-semibold">Short {index + 1}</h3>
                  <video width="320" height="240" controls className="block mt-2">
                    <source src={url} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                  <Button
                    onClick={() => handleDownload(url)}
                    className="mt-2 inline-block text-blue-500 hover:underline cursor-pointer"
                  >
                    Download Short {index + 1}
                  </Button>
                </div>
              ))}
            </div>
          )}
          {shorts.length > 0 && (
            <div className="mt-8">
              <h2 className="text-2xl font-semibold mb-4">List of Created Shorts</h2>
              {shorts.map((short, index) => (
                <div key={index} className="mb-4">
                  <h3 className="text-xl font-semibold">Short {index + 1}</h3>
                  <video width="320" height="240" controls className="block mt-2">
                    <source src={short.url} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                  <p className="mt-2 text-gray-600">
                    Start Time: {short.start_time} seconds
                  </p>
                  <p className="text-gray-600">
                    End Time: {short.end_time} seconds
                  </p>
                  <Button
                    onClick={() => handleDownload(short.url)}
                    className="mt-2 inline-block text-blue-500 hover:underline cursor-pointer"
                  >
                    Download Short {index + 1}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div>
          <h2 className="text-2xl font-semibold mb-4">Download Complete Video</h2>
          <Button
            onClick={handleCompleteVideoDownload}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
          >
            Download Complete Video
          </Button>
        </div>
      )}

      {/* Added content for downloading YouTube Shorts */}
      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Download YouTube Shorts Directly</h2>
        <form onSubmit={handleShortLinkSubmit} className="mb-4">
          <label className="block mb-2">
            <span className="text-gray-700">YouTube Short URL:</span>
            <TextField
              type="text"
              value={shortLink}
              onChange={(e) => setShortLink(e.target.value)}
              required
              fullWidth
              className="mt-1"
            />
          </label>
          <Button
            type="submit"
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
          >
            Download Short
          </Button>
        </form>
        {shortDownloadUrl && (
          <div>
            <h3 className="text-xl font-semibold mb-2">Download Link:</h3>
            <a href={shortDownloadUrl} className="text-blue-500 hover:underline" download>
              Download Your Short Video
            </a>
          </div>
        )}
      </div>

      {/* Added content for general downloading instructions */}
      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">How to Easily Download YouTube Shorts Videos: A Comprehensive Guide</h2>
        <ol className="list-decimal list-inside mb-4">
          <li>Identify and copy the URL of the YouTube Short video you wish to download.</li>
          <li>Navigate to <a href="https://savefrom.net" className="text-blue-500 hover:underline">SaveFrom.net</a> and input the copied URL of the YouTube Short in the designated field.</li>
          <li>Select your preferred video quality and format. Hit the "Download" button to save the YouTube Short to your device.</li>
        </ol>
        <h3 className="text-xl font-semibold mb-2">Benefits of Using SaveFrom.net for YouTube Shorts Download</h3>
        <ul className="list-disc list-inside mb-4">
          <li><strong>High-Quality Downloads:</strong> Experience Shorts in the best quality with options for various resolutions.</li>
          <li><strong>User-Friendly Interface:</strong> Our intuitive interface ensures a hassle-free download process for users of all levels.</li>
          <li><strong>Downloading in Various Formats:</strong> Choose from a range of formats to ensure compatibility with your devices.</li>
          <li><strong>Security and Privacy:</strong> We prioritize your privacy, ensuring a secure environment for all your downloads.</li>
        </ul>
        <p className="mt-2 text-gray-600">
          Downloading YouTube Shorts comes with several advantages for users. Firstly, it allows for seamless offline viewing, enabling individuals to enjoy their favorite short videos even without a stable internet connection. This proves especially beneficial during travel or in areas with limited connectivity.
        </p>
        <p className="text-gray-600">
          Additionally, downloading Shorts assists content creators in reaching a wider audience, as their videos can be shared beyond the YouTube platform. Users can conveniently save and rewatch their preferred Shorts multiple times without the need to repeatedly stream them, conserving data and reducing buffering times. Ultimately, the option to download YouTube Shorts amplifies user convenience, supports creators, and enhances the overall viewing experience.
        </p>
      </div>
    </div>
  );
};

export default Home;
