import React, { useContext, useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import VideoCard from "../components/VideoCard";
import {
  Users,
  Eye,
  Video,
  MessageCircle,
  Settings,
  Camera,
  Loader2,
  CheckCircle,
  Heart,
  Bell,
  BellOff,
} from "lucide-react";

const Channel = () => {
  const { username } = useParams();
  const { user } = useContext(AuthContext);
  const [channelData, setChannelData] = useState(null);
  const [stats, setStats] = useState(null);
  const [videos, setVideos] = useState([]);
  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("videos");
  const [isOwnChannel, setIsOwnChannel] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscribing, setSubscribing] = useState(false);

  const getUserAvatar = (u) => {
    if (!u) return "/default-avatar.svg";
    if (typeof u.avatar === "string") return u.avatar;
    if (typeof u.avatar === "object" && u.avatar !== null) {
      return u.avatar.url || "/default-avatar.svg";
    }
    return "/default-avatar.svg";
  };

  const getCoverImage = (u) => {
    if (!u) return null;
    if (typeof u.coverImage === "string") return u.coverImage;
    if (typeof u.coverImage === "object" && u.coverImage !== null) {
      return u.coverImage.url || null;
    }
    return null;
  };

  const calculateTotalViews = (videosList) => {
    return videosList.reduce((sum, v) => sum + (v.views || 0), 0);
  };

  useEffect(() => {
    const loadChannel = async () => {
      setLoading(true);
      try {
        if (username) {
          const channelRes = await api.get(`/api/v1/users/c/${username}`);
          const channelInfo = channelRes.data?.data;
          setChannelData(channelInfo);
          setIsOwnChannel(user && user.username === username);
          setIsSubscribed(channelInfo?.isSubscribed || false);

          if (channelInfo?._id) {
            const vidsRes = await api.get(
              `/api/v1/video/?userId=${channelInfo._id}&page=1&limit=24`
            );
            const vids = vidsRes.data?.data || [];
            setVideos(vids);

            setStats({
              totalVideos: vids.length,
              totalSubscribers: channelInfo?.subscribersCount || 0,
              view: calculateTotalViews(vids),
            });
          }
        } else if (user) {
          setChannelData(user);
          setIsOwnChannel(true);

          try {
            const statsRes = await api.get("/dashboard/stats");
            setStats(statsRes.data?.data || null);
          } catch (e) {
            console.error("Stats error", e);
          }

          const vidsRes = await api.get(
            `/api/v1/video/?userId=${user._id}&page=1&limit=24`
          );
          setVideos(vidsRes.data?.data || []);

          try {
            const tweetsRes = await api.get("/api/v1/tweet/get-user-tweets");
            setTweets(tweetsRes.data?.data || []);
          } catch (e) {
            console.error("Tweets error", e);
          }
        }
      } catch (err) {
        console.error("Channel load error", err);
      } finally {
        setLoading(false);
      }
    };

    loadChannel();
  }, [user, username]);

  const handleSubscribe = async () => {
    if (!user) {
      alert("Please login to subscribe");
      return;
    }
    if (!channelData?._id) return;

    setSubscribing(true);
    try {
      await api.patch(`/api/v1/subscription/subscribe/${channelData._id}`);
      setIsSubscribed((prev) => !prev);
      setStats((prev) => ({
        ...prev,
        totalSubscribers: isSubscribed
          ? (prev?.totalSubscribers || 1) - 1
          : (prev?.totalSubscribers || 0) + 1,
      }));
    } catch (err) {
      console.error("Subscribe error", err);
    } finally {
      setSubscribing(false);
    }
  };

  const tabs = [
    { id: "videos", label: "Videos", icon: Video, count: videos.length },
    { id: "tweets", label: "Tweets", icon: MessageCircle, count: tweets.length },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading channel...</p>
        </div>
      </div>
    );
  }

  if (!channelData && !user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-300 mb-2">
            Channel not found
          </h2>
          <p className="text-gray-500 mb-4">Please login to view your channel</p>
          <Link to="/login" className="btn-primary">
            Login
          </Link>
        </div>
      </div>
    );
  }

  const displayUser = channelData || user;
  const coverImage = getCoverImage(displayUser);

  return (
    <div className="min-h-screen bg-gray-900">

      <div className="relative h-48 md:h-64 lg:h-80 bg-gradient-to-br from-indigo-900 via-purple-900 to-gray-900 overflow-hidden">
        {coverImage ? (
          <img
            src={coverImage}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent" />


        {isOwnChannel && (
          <Link
            to="/settings"
            className="absolute top-4 right-4 flex items-center gap-2 px-4 py-2 bg-black/50 backdrop-blur-sm rounded-lg text-white hover:bg-black/70 transition-colors"
          >
            <Camera className="w-4 h-4" />
            <span className="hidden sm:inline">Edit Cover</span>
          </Link>
        )}
      </div>


      <div className="max-w-6xl mx-auto px-4">
        <div className="relative -mt-16 md:-mt-20 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-end gap-6">

            <div className="relative">
              <img
                src={getUserAvatar(displayUser)}
                alt={displayUser?.username}
                className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover ring-4 ring-gray-900 shadow-xl"
              />
              {isOwnChannel && (
                <Link
                  to="/settings"
                  className="absolute bottom-2 right-2 p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors"
                >
                  <Camera className="w-4 h-4 text-gray-300" />
                </Link>
              )}
            </div>


            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl md:text-4xl font-bold text-white">
                  {displayUser?.fullName || displayUser?.username}
                </h1>
                <CheckCircle className="w-6 h-6 text-indigo-500" />
              </div>
              <p className="text-gray-400 text-lg mb-4">
                @{displayUser?.username}
              </p>


              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-gray-500" />
                  <span className="text-gray-300">
                    <span className="font-semibold text-white">
                      {stats?.totalSubscribers || displayUser?.subscribersCount || 0}
                    </span>{" "}
                    subscribers
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Video className="w-5 h-5 text-gray-500" />
                  <span className="text-gray-300">
                    <span className="font-semibold text-white">
                      {stats?.totalVideos || videos.length}
                    </span>{" "}
                    videos
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-gray-500" />
                  <span className="text-gray-300">
                    <span className="font-semibold text-white">
                      {stats?.view || 0}
                    </span>{" "}
                    views
                  </span>
                </div>
                {stats?.totalLikes !== undefined && (
                  <div className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-gray-500" />
                    <span className="text-gray-300">
                      <span className="font-semibold text-white">
                        {stats?.totalLikes || 0}
                      </span>{" "}
                      likes
                    </span>
                  </div>
                )}
              </div>
            </div>


            <div className="flex gap-3">
              {isOwnChannel ? (
                <Link to="/settings" className="btn-secondary flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Edit Profile
                </Link>
              ) : (
                <button
                  onClick={handleSubscribe}
                  disabled={subscribing}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-semibold transition-all ${
                    isSubscribed
                      ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      : "bg-gradient-to-r from-red-600 to-red-500 text-white hover:from-red-500 hover:to-red-400 shadow-lg shadow-red-500/20"
                  }`}
                >
                  {subscribing ? (
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
              )}
            </div>
          </div>
        </div>


        <div className="border-b border-gray-800 mb-8">
          <div className="flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition-all relative
                  ${
                    activeTab === tab.id
                      ? "text-indigo-400"
                      : "text-gray-400 hover:text-gray-200"
                  }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
                <span
                  className={`px-2 py-0.5 text-xs rounded-full ${
                    activeTab === tab.id
                      ? "bg-indigo-600/20 text-indigo-400"
                      : "bg-gray-800 text-gray-500"
                  }`}
                >
                  {tab.count}
                </span>
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500" />
                )}
              </button>
            ))}
          </div>
        </div>


        <div className="pb-12">
          {activeTab === "videos" && (
            <>
              {videos.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Video className="w-10 h-10 text-gray-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-300 mb-2">
                    No videos yet
                  </h3>
                  <p className="text-gray-500 mb-6">
                    {isOwnChannel
                      ? "Start sharing your content with the world!"
                      : "This channel hasn't uploaded any videos yet."}
                  </p>
                  {isOwnChannel && (
                    <Link to="/upload" className="btn-primary">
                      Upload Your First Video
                    </Link>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {videos.map((v, index) => (
                    <div
                      key={v._id}
                      style={{ animationDelay: `${index * 50}ms` }}
                      className="animate-fade-in"
                    >
                      <VideoCard video={v} />
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === "tweets" && (
            <>
              {tweets.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="w-10 h-10 text-gray-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-300 mb-2">
                    No tweets yet
                  </h3>
                  <p className="text-gray-500 mb-6">
                    {isOwnChannel
                      ? "Share your thoughts with your audience!"
                      : "This channel hasn't posted any tweets yet."}
                  </p>
                  {isOwnChannel && (
                    <Link to="/tweets" className="btn-primary">
                      Post Your First Tweet
                    </Link>
                  )}
                </div>
              ) : (
                <div className="max-w-2xl mx-auto space-y-4">
                  {tweets.map((t) => (
                    <div key={t._id} className="card p-4 animate-fade-in">
                      <div className="flex gap-3">
                        <img
                          src={getUserAvatar(t.owner || displayUser)}
                          alt="avatar"
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-gray-200">
                              {t.owner?.username || displayUser?.username}
                            </span>
                            <span className="text-gray-500 text-sm">
                              {new Date(t.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-gray-300">{t.content}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Channel;
