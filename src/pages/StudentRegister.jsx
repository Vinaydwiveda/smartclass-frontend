import React, { useRef, useEffect, useState } from 'react';
import * as faceapi from 'face-api.js';
import API from '../api';

export default function StudentRegister() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [rollNo, setRollNo] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const [modelsLoaded, setModelsLoaded] = useState(false);

  useEffect(() => {
    const loadModels = async () => {
      setStatus('Loading face-api models...');
      await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
      await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
      await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
      setModelsLoaded(true);
      setStatus('✅ Models loaded. Starting camera...');
      startVideo();
    };
    loadModels();
  }, []);

  const startVideo = () => {
    navigator.mediaDevices.getUserMedia({ video: {} })
      .then(stream => (videoRef.current.srcObject = stream))
      .catch(err => {
        console.error(err);
        setStatus('❌ Camera access denied');
      });
  };

  // Draw face box in real-time
  const handleVideoPlay = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    const displaySize = { width: video.offsetWidth, height: video.offsetHeight };
    faceapi.matchDimensions(canvas, displaySize);

    setInterval(async () => {
      if (!modelsLoaded) return;

      const detections = await faceapi
        .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks();

      const resizedDetections = faceapi.resizeResults(detections, displaySize);

      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (detections.length > 0) {
        // Draw only bounding box and eye line
        resizedDetections.forEach(det => {
          const box = det.detection.box;
          ctx.strokeStyle = '#00FF00';
          ctx.lineWidth = 2;
          ctx.strokeRect(box.x, box.y, box.width, box.height);

          const leftEye = det.landmarks.getLeftEye();
          const rightEye = det.landmarks.getRightEye();
          ctx.strokeStyle = '#FF0000';
          ctx.beginPath();
          ctx.moveTo(leftEye[0].x, leftEye[0].y);
          ctx.lineTo(rightEye[3].x, rightEye[3].y);
          ctx.stroke();
        });
        setStatus('Face detected');
      } else {
        setStatus('No face detected');
      }
    }, 200); // refresh every 200ms
  };

  useEffect(() => {
    if (modelsLoaded) {
      videoRef.current.addEventListener('play', handleVideoPlay);
    }
  }, [modelsLoaded]);

  const captureAndRegister = async () => {
    setStatus('Capturing face...');
    const detections = await faceapi
      .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detections) {
      setStatus('❌ No face detected, try again');
      return;
    }

    const embedding = Array.from(detections.descriptor);

    try {
      const res = await API.post('/students/register-with-embedding', {
        rollNo,
        name,
        email,
        embedding,
      });

      if (res.data.ok) {
        setStatus(`✅ Registered ${res.data.student.name}`);
      } else {
        setStatus('❌ Registration failed');
      }
    } catch (err) {
      console.error(err);
      setStatus(err.response?.data?.error || '❌ Registration error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Register Student</h2>

          <form className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Roll No</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter Roll No"
                  value={rollNo}
                  onChange={e => setRollNo(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter Name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter Email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
          </form>

          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
            <div className="flex-1 max-w-md">
              <div className="relative bg-gray-100 rounded-lg overflow-hidden shadow-inner">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  className="w-full h-64 object-cover"
                />
                <canvas
                  ref={canvasRef}
                  className="absolute top-0 left-0 w-full h-64"
                />
              </div>
              <div className="mt-4 text-center">
                <button
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={captureAndRegister}
                  disabled={!rollNo || !name || !email || status.includes('Loading') || status.includes('Capturing')}
                >
                  {status.includes('Capturing') ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Capturing...
                    </div>
                  ) : (
                    'Capture & Register'
                  )}
                </button>
              </div>
            </div>

            <div className="flex-1 max-w-md">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Status</h3>
                <p className={`text-sm ${status.includes('✅') ? 'text-green-600' : status.includes('❌') ? 'text-red-600' : 'text-gray-600'}`}>
                  {status || 'Ready to register'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
