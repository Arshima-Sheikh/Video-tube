import React, { useEffect, useState, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios";
import CommentBox from "../components/CommentBox";
import { AuthContext } from "../context/AuthContext";
import {
  ThumbsUp,
  ThumbsDown,
  Share2,
  Bell,
  BellOff,
  Eye,
  Calendar,
  User,
  Loader2,
  CheckCircle,
} from "lucide-react";

const formatViews = (views) => {
  if (!views) return "0 views";
  if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M views`;
  if (views >= 1000) return `${(views / 1000).toFixed(1)}K views`;
  return `${views} views`;
};

const formatDate = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const Video = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [video, setVideo] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loadingSub, setLoadingSub] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showFullDescription, setShowFullDescription] = useState(false);

  useEffect(() => {
    const fetchVideo = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/api/v1/video/get-video-by-id/${id}`);
        setVideo(res.data?.data);
      } catch (err) {
        console.error("fetch video", err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchVideo();
  }, [id]);

  useEffect(() => {
    if (!video || !user) return;
    const checkLikeAndSub = async () => {
      try {
        const lv = await api.get("/like/get-liked-videos");
        const likedVideos = (lv.data?.data || []).map((l) =>
          l.video ? l.video._id : l._id
        );
        setIsLiked(likedVideos.includes(video._id));

        const subs = await api.get(
          `/api/v1/subscription/get-subscribed-channel/${user._id}`
        );
        const channels = subs.data?.data || [];
        const isSub = channels.some((s) => {
          const channelId = s.channel
            ? typeof s.channel === "object"
              ? s.channel._id
              : s.channel
            : s.channel;
          return String(channelId) === String(video.owner?._id || video.owner);
        });
        setIsSubscribed(isSub);
      } catch (err) {
        console.error("check like/sub", err);
      }
    };
    checkLikeAndSub();
  }, [video, user]);

  const toggleLike = async () => {
    if (!user) return alert("Login to like");
    try {
      await api.patch(`/like/video-like/${video._id}`);
      setIsLiked((prev) => !prev);
    } catch (err) {
      console.error("toggle like", err);
    }
  };

  const toggleSubscribe = async () => {
    if (!user) return alert("Login to subscribe");
    try {
      setLoadingSub(true);
      const channelId = video.owner?._id || video.owner;
      await api.patch(`/api/v1/subscription/subscribe/${channelId}`);
      setIsSubscribed((prev) => !prev);
    } catch (err) {
      console.error("toggle subscribe", err);
    } finally {
      setLoadingSub(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Link copied to clipboard!");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading video...</p>
        </div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-300 mb-2">Video not found</h2>
          <p className="text-gray-500 mb-6">The video you're looking for doesn't exist.</p>
          <Link to="/" className="btn-primary">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  const ownerName = video.owner?.username || video.owner || "Unknown";
  const ownerAvatar = video.owner?.avatar || "/default-avatar.svg";
  const description = video.description || "";

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          <div className="lg:col-span-2">

            <div className="relative bg-black rounded-2xl overflow-hidden shadow-2xl shadow-black/50">
              <div className="aspect-video">
                <video
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                  src={video.videoFile}
                  poster={video.thumbnail}
                />
              </div>
            </div>


            <div className="mt-6">
              <h1 className="text-2xl font-bold text-gray-100 mb-4">
                {video.title}
              </h1>


              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-gray-800">
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span className="flex items-center gap-1.5">
                    <Eye className="w-4 h-4" />
                    {formatViews(video.views)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    {formatDate(video.createdAt)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleLike}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all
                      ${
                        isLiked
                          ? "bg-indigo-600 text-white"
                          : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                      }`}
                  >
                    <ThumbsUp
                      className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`}
                    />
                    {isLiked ? "Liked" : "Like"}
                  </button>

                  <button
                    onClick={handleShare}
                    className="flex items-center gap-2 px-4 py-2 rounded-full font-medium bg-gray-800 text-gray-300 hover:bg-gray-700 transition-all"
                  >
                    <Share2 className="w-5 h-5" />
                    Share
                  </button>
                </div>
              </div>


              <div className="flex items-center justify-between py-4 border-b border-gray-800">
                <Link
                  to={`/channel/${ownerName}`}
                  className="flex items-center gap-4 group"
                >
                  <img
                    src={ownerAvatar}
                    alt={ownerName}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-700 group-hover:ring-indigo-500 transition-all"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-100 group-hover:text-indigo-400 transition-colors">
                        {ownerName}
                      </h3>
                      <CheckCircle className="w-4 h-4 text-indigo-500" />
                    </div>
                    <p className="text-sm text-gray-500">Channel</p>
                  </div>
                </Link>

                <button
                  onClick={toggleSubscribe}
                  disabled={loadingSub}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-semibold transition-all
                    ${
                      isSubscribed
                        ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                        : "bg-gradient-to-r from-red-600 to-red-500 text-white hover:from-red-500 hover:to-red-400 shadow-lg shadow-red-500/20"
                    }`}
                >
                  {loadingSub ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : isSubscribed ? (
                    <>
                      <BellOff className="w-5 h-5" />
                      Subscribed
                    </>
                  ) : (
                    <>
                      <Bell className="w-5 h-5" />
                      Subscribe
                    </>
                  )}
                </button>
              </div>


              <div className="mt-4 p-4 bg-gray-800/50 rounded-xl">
                <p
                  className={`text-gray-300 whitespace-pre-wrap ${
                    !showFullDescription && description.length > 200
                      ? "line-clamp-3"
                      : ""
                  }`}
                >
                  {description}
                </p>
                {description.length > 200 && (
                  <button
                    onClick={() => setShowFullDescription(!showFullDescription)}
                    className="mt-2 text-indigo-400 hover:text-indigo-300 text-sm font-medium"
                  >
                    {showFullDescription ? "Show less" : "Show more"}
                  </button>
                )}
              </div>


              <div className="mt-8">
                <CommentBox videoId={video._id} />
              </div>
            </div>
          </div>


          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <h3 className="text-lg font-semibold text-gray-200 mb-4">
                Up Next
              </h3>
              <div className="space-y-4">
                <div className="p-6 bg-gray-800/50 rounded-xl text-center">
                  <User className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm">
                    Related videos coming soon
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Video;
