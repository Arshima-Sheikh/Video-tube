import React, { useEffect, useState, useContext } from "react";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import {
  Heart,
  Share2,
  Loader2,
  Send,
  Sparkles,
  MessageCircle,
} from "lucide-react";

const Tweets = () => {
  const { user } = useContext(AuthContext);
  const [tweets, setTweets] = useState([]);
  const [content, setContent] = useState("");
  const [likedSet, setLikedSet] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  const fetchTweets = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/v1/tweet/get-all-tweets");
      setTweets(res.data?.data || []);

      if (user) {
        try {
          const likesRes = await api.get("/like/get-liked-tweets");
          const likedIds = new Set(
            (likesRes.data?.data || []).map((t) => t._id)
          );
          setLikedSet(likedIds);
        } catch (e) {
          console.error("fetch liked tweets", e);
        }
      }
    } catch (err) {
      console.error("fetch tweets", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTweets();
  }, [user]);

  const submit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setPosting(true);
    try {
      const res = await api.post("/api/v1/tweet/create-tweet", { content });
      setTweets((prev) => [res.data?.data, ...prev]);
      setContent("");
    } catch (err) {
      alert(err.response?.data?.message || "Tweet failed");
    } finally {
      setPosting(false);
    }
  };

  const toggleLike = async (tweetId) => {
    if (!user) return alert("Login to like");
    try {
      await api.patch(`/like/tweet-like/${tweetId}`);
      setLikedSet((prev) => {
        const next = new Set(prev);
        if (next.has(tweetId)) next.delete(tweetId);
        else next.add(tweetId);
        return next;
      });
    } catch (err) {
      console.error("toggle like", err);
    }
  };

  const getOwnerName = (owner) => {
    if (!owner) return "unknown";
    if (typeof owner === "object" && owner !== null)
      return owner.username || "unknown";
    return String(owner);
  };

  const getOwnerAvatar = (owner) => {
    if (!owner) return "/default-avatar.svg";
    if (typeof owner === "object" && owner !== null)
      return owner.avatar || "/default-avatar.png";
    return "/default-avatar.svg";
  };

  const getUserAvatar = (u) => {
    if (!u) return "/default-avatar.svg";
    if (typeof u.avatar === "string") return u.avatar;
    if (typeof u.avatar === "object" && u.avatar !== null) {
      return u.avatar.url || "/default-avatar.png";
    }
    return "/default-avatar.svg";
  };

  const formatTime = (date) => {
    if (!date) return "";
    const now = new Date();
    const past = new Date(date);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return past.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold gradient-text flex items-center gap-2">
              <Sparkles className="w-8 h-8 text-indigo-500" />
              Tweets
            </h1>
            <p className="text-gray-400 mt-1">
              Share your thoughts with the community
            </p>
          </div>
        </div>


        {user ? (
          <div className="card p-4 mb-8">
            <form onSubmit={submit}>
              <div className="flex gap-4">
                <img
                  src={getUserAvatar(user)}
                  alt="Your avatar"
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-700 flex-shrink-0"
                />
                <div className="flex-1">
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="What's happening?"
                    rows={3}
                    maxLength={280}
                    className="w-full bg-transparent text-gray-100 placeholder-gray-500 resize-none focus:outline-none text-lg"
                  />

                  <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                    <div className="text-sm text-gray-500">
                      {content.length}/280
                    </div>
                    <button
                      type="submit"
                      disabled={!content.trim() || posting}
                      className="btn-primary flex items-center gap-2"
                    >
                      {posting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                      Tweet
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        ) : (
          <div className="card p-6 mb-8 text-center">
            <p className="text-gray-400 mb-4">Login to share your thoughts</p>
            <a href="/login" className="btn-primary">
              Login to Tweet
            </a>
          </div>
        )}


        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
            <p className="text-gray-400">Loading tweets...</p>
          </div>
        ) : tweets.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-10 h-10 text-gray-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-300 mb-2">
              No tweets yet
            </h3>
            <p className="text-gray-500">Be the first to tweet something!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tweets.map((t, index) => {
              const ownerName = getOwnerName(t.owner);
              const ownerAvatar = getOwnerAvatar(t.owner);
              const isLiked = likedSet.has(t._id);

              return (
                <div
                  key={t._id}
                  className="card p-4 hover:bg-gray-800/80 transition-colors animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex gap-4">

                    <a href={`/channel/${ownerName}`} className="flex-shrink-0">
                      <img
                        src={ownerAvatar}
                        alt={ownerName}
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-700 hover:ring-indigo-500 transition-all"
                      />
                    </a>


                    <div className="flex-1 min-w-0">

                      <div className="flex items-center gap-2 mb-1">
                        <a
                          href={`/channel/${ownerName}`}
                          className="font-semibold text-gray-100 hover:text-indigo-400 transition-colors"
                        >
                          {ownerName}
                        </a>
                        <span className="text-gray-500">·</span>
                        <span className="text-gray-500 text-sm">
                          {formatTime(t.createdAt)}
                        </span>
                      </div>


                      <p className="text-gray-200 whitespace-pre-wrap break-words mb-3">
                        {t.content}
                      </p>


                      <div className="flex items-center gap-6">
                        <button
                          onClick={() => toggleLike(t._id)}
                          className={`flex items-center gap-2 text-sm transition-colors group ${
                            isLiked
                              ? "text-pink-500"
                              : "text-gray-500 hover:text-pink-500"
                          }`}
                        >
                          <div
                            className={`p-2 rounded-full transition-colors ${
                              isLiked
                                ? "bg-pink-500/10"
                                : "group-hover:bg-pink-500/10"
                            }`}
                          >
                            <Heart
                              className={`w-5 h-5 ${
                                isLiked ? "fill-current" : ""
                              }`}
                            />
                          </div>
                          <span>{isLiked ? "Liked" : "Like"}</span>
                        </button>

                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(window.location.origin + `/tweets#${t._id}`);
                            alert("Link copied!");
                          }}
                          className="flex items-center gap-2 text-sm text-gray-500 hover:text-green-400 transition-colors group"
                        >
                          <div className="p-2 rounded-full group-hover:bg-green-500/10 transition-colors">
                            <Share2 className="w-5 h-5" />
                          </div>
                          <span>Share</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Tweets;
