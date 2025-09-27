import React, { useRef, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import * as faceapi from "face-api.js";
import API, { sendAttendanceToN8n } from "../api";
import { markAttendance, loadAttendance } from "../features/attendanceSlice";

export default function Attendance() {
  const dispatch = useDispatch();
  const attendance = useSelector((state) => state.attendance);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [status, setStatus] = useState("Loading models...");
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [isVideoActive, setIsVideoActive] = useState(false);
  const isProcessing = useRef(false);
  const [n8nStatus, setN8nStatus] = useState("");

  const date = new Date().toISOString().split("T")[0];
  const recentLog = attendance[date] || [];

  // Load models
  const loadModels = async () => {
    try {
      setStatus("Loading face-api models...");
      await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
      await faceapi.nets.faceLandmark68Net.loadFromUri("/models");
      await faceapi.nets.faceRecognitionNet.loadFromUri("/models");
      setModelsLoaded(true);
      setStatus("✅ Models loaded. Starting camera...");
      startVideo();
    } catch (err) {
      console.error(err);
      setStatus("❌ Error loading models");
    }
  };

  useEffect(() => {
    loadModels();
    dispatch(loadAttendance());
  }, [dispatch]);

  // Camera start/stop
  const startVideo = async () => {
    if (isVideoActive) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      setIsVideoActive(true);
      setStatus("✅ Camera started. Detecting faces...");
    } catch (err) {
      console.error(err);
      setStatus("❌ Camera access denied");
    }
  };

  const stopVideo = () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
      setIsVideoActive(false);
      setStatus("Camera stopped");
    }
  };

  const toggleVideo = () => (isVideoActive ? stopVideo() : startVideo());

  // Face detection loop
  useEffect(() => {
    let interval;
    if (modelsLoaded && isVideoActive) {
      interval = setInterval(() => handleVideoPlay(), 1000);
    }
    return () => clearInterval(interval);
  }, [modelsLoaded, isVideoActive]);

  // 🔹 Removed old `useEffect` that was sending `recentLog` batch to n8n

  // Face detection + mark attendance
  const handleVideoPlay = async () => {
    if (isProcessing.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || video.paused || video.ended) return;

    isProcessing.current = true;

    const displaySize = { width: video.videoWidth, height: video.videoHeight };
    canvas.width = displaySize.width;
    canvas.height = displaySize.height;
    faceapi.matchDimensions(canvas, displaySize);

    try {
      const detections = await faceapi
        .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 160, scoreThreshold: 0.5 }))
        .withFaceLandmarks()
        .withFaceDescriptors();

      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (!detections.length) {
        setStatus("No face detected");
        isProcessing.current = false;
        return;
      }

      if (detections.length > 1) {
        setStatus("⚠️ Multiple faces detected");
        isProcessing.current = false;
        return;
      }

      const resized = faceapi.resizeResults(detections, displaySize);
      const detection = resized[0];
      const box = detection.detection.box;

      // Draw face rectangle
      ctx.strokeStyle = "#00FF00";
      ctx.lineWidth = 2;
      ctx.strokeRect(box.x, box.y, box.width, box.height);

      // Attendance API
      const embedding = Array.from(detection.descriptor);
      const res = await API.post("/students/attendance/mark", { embedding });

      if (res.data.ok) {
        const student = {
          rollNo: res.data.student.rollNo,
          name: res.data.student.name,
          date: new Date().toISOString().split("T")[0],
          status: "Present",
        };

        const exists = recentLog.some((s) => s.rollNo === student.rollNo);
        if (exists) {
          setStatus(`Already marked: ${student.name} (${student.rollNo})`);
        } else {
          // 🔹 Mark in store
          dispatch(markAttendance({ date, student }));
          setStatus(` Attendance marked: ${student.name} (${student.rollNo})`);

          // 🔹 Send only this new student to n8n
          sendAttendanceToN8n([student])
            .then(() => setN8nStatus(" Sent to n8n"))
            .catch(() => setN8nStatus(" Failed to send to n8n"));
        }

        ctx.fillStyle = "lime";
        ctx.font = "16px Arial";
        ctx.fillText(`${student.name}`, box.x, box.y - 5);
      } else {
        setStatus("❌ No match found");
      }
    } catch (err) {
      console.error(err);
      setStatus("Error marking attendance");
    } finally {
      isProcessing.current = false;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-4">
      <div className="bg-white/20 backdrop-blur-md shadow-2xl rounded-2xl p-6 w-full max-w-4xl">
        <h2 className="text-3xl text-white font-bold mb-6 text-center drop-shadow-lg">
          📋 Face Recognition Attendance
        </h2>

        <div className="relative w-full flex justify-center">
          <video
            ref={videoRef}
            className="rounded-xl w-full max-w-md h-auto object-cover shadow-lg"
            muted
          />
          <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 w-full max-w-md h-auto rounded-xl pointer-events-none"
          />
        </div>

        <div className="text-center mt-4 space-y-2">
          <button
            className={`px-6 py-3 rounded-lg font-medium transition-colors duration-200 ${
              isVideoActive ? "bg-red-600 hover:bg-red-700 text-white" : "bg-green-600 hover:bg-green-700 text-white"
            }`}
            onClick={toggleVideo}
            disabled={!modelsLoaded}
          >
            {isVideoActive ? "Stop Camera" : "Start Camera"}
          </button>
          <p className="text-white font-semibold">{n8nStatus}</p>
        </div>

        <div className="mt-6 bg-white/90 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-2">Status</h3>
          <p
            className={`text-sm ${
              status.includes("ok")
                ? "text-green-600"
                : status.includes("❌") || status.includes("⚠️")
                ? "text-red-600"
                : "text-gray-600"
            }`}
          >
            {status}
          </p>
        </div>

        {recentLog.length > 0 && (
          <div className="mt-4 bg-white/90 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Recently Marked</h3>
            <ul className="space-y-2">
              {recentLog.map((log, idx) => (
                <li key={idx} className="bg-gray-50 p-3 rounded-md shadow-sm">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-900">
                      {log.name} ({log.rollNo})
                    </span>
                    <span className="text-sm text-gray-500">
                      {log.time || new Date().toLocaleTimeString()}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
