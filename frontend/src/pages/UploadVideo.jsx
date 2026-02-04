import React, { useState, useRef } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import {
  Upload,
  Video,
  FileVideo,
  X,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

const UploadVideo = () => {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type.startsWith("video/")) {
        setFile(droppedFile);
      } else {
        setError("Please upload a video file");
      }
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError("");
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    if (!file || !title || !description) {
      setError("All fields are required");
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    const fd = new FormData();
    fd.append("video", file);
    fd.append("title", title);
    fd.append("description", description);

    try {
      const res = await api.post("/api/v1/video/publish", fd, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(progress);
        },
      });

      const created = res.data?.data;
      if (created?._id) {
        navigate(`/video/${created._id}`);
      } else {
        navigate("/");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed. Please try again.");
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 py-12">
      <div className="max-w-3xl mx-auto px-4">

        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-4 shadow-lg shadow-indigo-500/30">
            <Upload className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Upload Video</h1>
          <p className="text-gray-400">Share your content with the world</p>
        </div>


        <div className="card p-8">
          <form onSubmit={submit} className="space-y-6">
            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 animate-fade-in">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}


            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-2xl transition-all duration-300 ${
                dragActive
                  ? "border-indigo-500 bg-indigo-500/10"
                  : file
                  ? "border-green-500/50 bg-green-500/5"
                  : "border-gray-700 hover:border-gray-600"
              }`}
            >
              {file ? (
                <div className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-700 rounded-xl flex items-center justify-center">
                      <FileVideo className="w-8 h-8 text-indigo-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-200 truncate">
                        {file.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFile(null)}
                      className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>


                  {uploading && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-gray-400">Uploading...</span>
                        <span className="text-indigo-400 font-medium">
                          {uploadProgress}%
                        </span>
                      </div>
                      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center p-12 cursor-pointer">
                  <div className="w-20 h-20 bg-gray-800 rounded-2xl flex items-center justify-center mb-4">
                    <Video className="w-10 h-10 text-gray-500" />
                  </div>
                  <p className="text-lg font-medium text-gray-300 mb-1">
                    Drag and drop your video here
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    or click to browse files
                  </p>
                  <div className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg text-sm">
                    Select Video
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
              )}
            </div>


            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give your video an engaging title"
                className="input-field"
                maxLength={100}
                required
              />
              <p className="text-xs text-gray-500 mt-1 text-right">
                {title.length}/100
              </p>
            </div>


            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description <span className="text-red-400">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell viewers about your video..."
                rows={5}
                className="input-field resize-none"
                maxLength={5000}
                required
              />
              <p className="text-xs text-gray-500 mt-1 text-right">
                {description.length}/5000
              </p>
            </div>


            <button
              type="submit"
              disabled={uploading || !file}
              className="w-full btn-primary py-4 flex items-center justify-center gap-3 text-lg"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Uploading Video...
                </>
              ) : (
                <>
                  <Upload className="w-6 h-6" />
                  Publish Video
                </>
              )}
            </button>
          </form>
        </div>


        <div className="mt-8 p-6 bg-gray-800/50 rounded-xl border border-gray-700/50">
          <h3 className="font-semibold text-gray-200 mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            Tips for a great video
          </h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li className="flex items-start gap-2">
              <span className="text-indigo-400 mt-1">•</span>
              Use a descriptive title that includes relevant keywords
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-400 mt-1">•</span>
              Write a detailed description to help viewers find your content
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-400 mt-1">•</span>
              Keep videos high quality - HD or higher is recommended
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-400 mt-1">•</span>
              Engage with comments to build your community
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default UploadVideo;
