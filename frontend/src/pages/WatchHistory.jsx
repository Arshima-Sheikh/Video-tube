import React, { useEffect, useState, useContext } from "react";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import VideoCard from "../components/VideoCard";
import { History, Loader2, Trash2, Play } from "lucide-react";
import { Link } from "react-router-dom";

const WatchHistory = () => {
  const { user } = useContext(AuthContext);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const res = await api.get("/api/v1/users/history");
        setHistory(res.data?.data || []);
      } catch (err) {
        console.error("fetch history", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <History className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-300 mb-2">
            Sign in to view history
          </h2>
          <p className="text-gray-500 mb-6">
            Your watch history will appear here
          </p>
          <Link to="/login" className="btn-primary">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <History className="w-8 h-8 text-indigo-500" />
              Watch History
            </h1>
            <p className="text-gray-400 mt-1">
              Videos you've watched recently
            </p>
          </div>
        </div>


        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
            <p className="text-gray-400">Loading history...</p>
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <Play className="w-12 h-12 text-gray-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-300 mb-2">
              No watch history
            </h3>
            <p className="text-gray-500 mb-6">
              Videos you watch will appear here
            </p>
            <Link to="/" className="btn-primary">
              Browse Videos
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-4 text-gray-400">
              {history.length} videos in your history
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {history.map((video, index) => (
                <div
                  key={video._id}
                  style={{ animationDelay: `${index * 50}ms` }}
                  className="animate-fade-in"
                >
                  <VideoCard video={video} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default WatchHistory;
