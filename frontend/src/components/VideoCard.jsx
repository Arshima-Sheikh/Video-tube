import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Play, Clock, Eye } from "lucide-react";

const PLACEHOLDER = "/video-placeholder.svg";

const captureFrame = (videoUrl, seekTime = 1) =>
  new Promise((resolve, reject) => {
    try {
      const video = document.createElement("video");
      video.crossOrigin = "anonymous";
      video.src = videoUrl;
      video.muted = true;
      video.playsInline = true;
      video.preload = "auto";

      const cleanup = () => {
        try {
          video.pause();
          video.src = "";
        } catch (e) {}
      };

      const onLoadedMeta = () => {
        const t = Math.min(seekTime, Math.max(0, video.duration / 2 || seekTime));
        const seekHandler = () => {
          try {
            const canvas = document.createElement("canvas");
            canvas.width = video.videoWidth || 480;
            canvas.height = video.videoHeight || 270;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
            cleanup();
            resolve(dataUrl);
          } catch (err) {
            cleanup();
            reject(err);
          }
        };

        video.currentTime = t;
        video.addEventListener("seeked", seekHandler, { once: true });

        setTimeout(() => {
          try {
            const canvas = document.createElement("canvas");
            canvas.width = video.videoWidth || 480;
            canvas.height = video.videoHeight || 270;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
            cleanup();
            resolve(dataUrl);
          } catch (err) {
            cleanup();
            reject(err);
          }
        }, 1500);
      };

      const onError = () => {
        cleanup();
        reject(new Error("Video load error"));
      };

      video.addEventListener("loadedmetadata", onLoadedMeta, { once: true });
      video.addEventListener("error", onError, { once: true });
      video.play().catch(() => {});
    } catch (err) {
      reject(err);
    }
  });

const formatDuration = (seconds) => {
  if (!seconds) return "";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const formatViews = (views) => {
  if (!views) return "0 views";
  if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M views`;
  if (views >= 1000) return `${(views / 1000).toFixed(1)}K views`;
  return `${views} views`;
};

const formatTimeAgo = (date) => {
  if (!date) return "";
  const now = new Date();
  const past = new Date(date);
  const diffMs = now - past;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
};

const VideoCard = ({ video }) => {
  const [thumb, setThumb] = useState(video?.thumbnail || null);
  const [loading, setLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (video?.thumbnail) {
      setThumb(video.thumbnail);
      return;
    }

    const cacheKey = `thumb_${video._id}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      setThumb(cached);
      return;
    }

    let mounted = true;
    setLoading(true);

    captureFrame(video.videoFile, 1)
      .then((dataUrl) => {
        if (!mounted) return;
        try {
          localStorage.setItem(cacheKey, dataUrl);
        } catch (e) {}
        setThumb(dataUrl);
      })
      .catch(() => {
        setThumb(null);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [video]);

  const thumbnailSrc = thumb || PLACEHOLDER;
  const ownerName = video?.owner?.username || String(video?.owner || "Unknown");
  const ownerAvatar = video?.owner?.avatar || "/default-avatar.svg";

  return (
    <div
      className="group card card-hover animate-fade-in"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/video/${video._id}`} className="block relative">

        <div className="relative aspect-video bg-gray-800 overflow-hidden">
          <img
            src={thumbnailSrc}
            alt={video?.title || "video"}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = PLACEHOLDER;
            }}
            className={`w-full h-full object-cover transition-transform duration-500 ${
              isHovered ? "scale-110" : "scale-100"
            }`}
          />


          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />


          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
            <div className="w-14 h-14 bg-indigo-600/90 backdrop-blur-sm rounded-full flex items-center justify-center transform scale-75 group-hover:scale-100 transition-transform duration-300 shadow-lg shadow-indigo-500/30">
              <Play className="w-6 h-6 text-white fill-white ml-1" />
            </div>
          </div>


          {video?.duration && (
            <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/80 backdrop-blur-sm rounded-md text-xs font-medium text-white flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDuration(video.duration)}
            </div>
          )}


          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800/50">
              <div className="w-10 h-10 rounded-full border-3 border-gray-600 border-t-indigo-500 animate-spin" />
            </div>
          )}
        </div>
      </Link>


      <div className="p-4">
        <div className="flex gap-3">

          <Link to={`/channel/${ownerName}`} className="flex-shrink-0">
            <img
              src={ownerAvatar}
              alt={ownerName}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-700 hover:ring-indigo-500 transition-all"
            />
          </Link>


          <div className="flex-1 min-w-0">
            <Link to={`/video/${video._id}`}>
              <h3 className="font-semibold text-gray-100 line-clamp-2 group-hover:text-indigo-400 transition-colors">
                {video?.title || "Untitled"}
              </h3>
            </Link>

            <Link
              to={`/channel/${ownerName}`}
              className="text-sm text-gray-400 hover:text-gray-300 transition-colors mt-1 block"
            >
              {ownerName}
            </Link>

            <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {formatViews(video?.views)}
              </span>
              <span>•</span>
              <span>{formatTimeAgo(video?.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
