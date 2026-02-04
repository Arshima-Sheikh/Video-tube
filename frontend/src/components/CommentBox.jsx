import React, { useEffect, useState, useContext } from "react";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import {
  MessageCircle,
  Send,
  ChevronLeft,
  ChevronRight,
  Loader2,
  User,
} from "lucide-react";

const CommentBox = ({ videoId }) => {
  const { user } = useContext(AuthContext);
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [posting, setPosting] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const getUserAvatar = (u) => {
    if (!u) return "/default-avatar.svg";
    if (typeof u === "string") return u;
    if (typeof u.avatar === "string") return u.avatar;
    if (typeof u.avatar === "object" && u.avatar !== null) {
      return u.avatar.url || "/default-avatar.png";
    }
    return "/default-avatar.svg";
  };

  const fetchComments = async (p = 1) => {
    setLoading(true);
    try {
      const res = await api.get(
        `/comment/get-comments/${videoId}?page=${p}&limit=10`
      );
      const data = res.data?.data || [];
      setComments(data);
      setHasMore(data.length === 10);
    } catch (err) {
      console.error("fetchComments", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (videoId) fetchComments(page);
  }, [videoId, page]);

  const submit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    setPosting(true);
    try {
      const res = await api.post(`/comment/add/${videoId}`, { content });
      setComments((prev) => [res.data?.data, ...prev]);
      setContent("");
    } catch (err) {
      console.error("submit comment", err);
      alert(err.response?.data?.message || "Failed to add comment");
    } finally {
      setPosting(false);
    }
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
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    return past.toLocaleDateString();
  };

  return (
    <div className="mt-8">

      <div className="flex items-center gap-3 mb-6">
        <MessageCircle className="w-6 h-6 text-indigo-400" />
        <h2 className="text-xl font-semibold text-gray-100">Comments</h2>
        <span className="px-2 py-0.5 text-sm bg-gray-800 text-gray-400 rounded-full">
          {comments.length}
        </span>
      </div>


      <form onSubmit={submit} className="mb-8">
        <div className="flex gap-4">
          <div className="flex-shrink-0">
            {user ? (
              <img
                src={getUserAvatar(user)}
                alt="Your avatar"
                className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-700"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                <User className="w-5 h-5 text-gray-500" />
              </div>
            )}
          </div>

          <div className="flex-1">
            <div className="relative">
              <input
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all pr-24"
                placeholder={
                  user
                    ? "Add a comment..."
                    : "Login to add a comment"
                }
                disabled={!user}
              />
              <button
                type="submit"
                disabled={!user || posting || !content.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {posting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Post
              </button>
            </div>
          </div>
        </div>
      </form>


      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-12 bg-gray-800/30 rounded-xl">
          <MessageCircle className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">No comments yet</p>
          <p className="text-gray-500 text-sm">Be the first to comment!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {comments.map((c, index) => (
            <div
              key={c._id}
              className="flex gap-4 animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <img
                src={getUserAvatar(c.user || c.owner)}
                alt="Commenter"
                className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-700 flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-gray-200">
                    {c.user?.username || c.owner?.username || "User"}
                  </span>
                  <span className="text-gray-500 text-sm">
                    {formatTime(c.createdAt)}
                  </span>
                </div>
                <p className="text-gray-300 whitespace-pre-wrap break-words">
                  {c.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}


      {comments.length > 0 && (
        <div className="flex items-center justify-center gap-4 mt-8 pt-6 border-t border-gray-800">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          <span className="text-gray-500">Page {page}</span>

          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={!hasMore}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default CommentBox;
