import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/axios";
import VideoCard from "../components/VideoCard";
import { Search, TrendingUp, Clock, Filter, X, Loader2 } from "lucide-react";

const Home = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortType, setSortType] = useState("desc");

  const searchQuery = searchParams.get("search") || "";

  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      try {
        let url = `/api/v1/video/?page=1&limit=24&sortBy=${sortBy}&sortType=${sortType}`;
        if (searchQuery) {
          url += `&query=${encodeURIComponent(searchQuery)}`;
        }
        const res = await api.get(url);
        setVideos(res.data?.data || []);
      } catch (err) {
        console.error("fetch videos", err);
        setVideos([]);
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, [searchQuery, sortBy, sortType]);

  const clearSearch = () => {
    setSearchParams({});
  };

  const filters = [
    { id: "createdAt", label: "Latest", icon: Clock },
    { id: "views", label: "Popular", icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-gray-900">

      <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-indigo-950/30 to-gray-900 border-b border-gray-800">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM0ZjQ2ZTUiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        
        <div className="relative max-w-7xl mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="gradient-text">Discover Amazing Videos</span>
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Watch, share, and explore content from creators around the world
            </p>
          </div>


          {searchQuery && (
            <div className="flex items-center justify-center gap-3 mb-6 animate-fade-in">
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-800/80 backdrop-blur-sm rounded-full border border-gray-700">
                <Search className="w-4 h-4 text-indigo-400" />
                <span className="text-gray-300">
                  Results for: <span className="text-indigo-400 font-medium">"{searchQuery}"</span>
                </span>
                <button
                  onClick={clearSearch}
                  className="ml-2 p-1 hover:bg-gray-700 rounded-full transition-colors"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>
          )}


          <div className="flex items-center justify-center gap-3 flex-wrap">
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setSortBy(filter.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full font-medium text-sm transition-all duration-200
                  ${
                    sortBy === filter.id
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30"
                      : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200"
                  }`}
              >
                <filter.icon className="w-4 h-4" />
                {filter.label}
              </button>
            ))}

            <button
              onClick={() => setSortType(sortType === "desc" ? "asc" : "desc")}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full font-medium text-sm bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200 transition-all duration-200"
            >
              <Filter className="w-4 h-4" />
              {sortType === "desc" ? "Newest First" : "Oldest First"}
            </button>
          </div>
        </div>
      </div>


      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
            <p className="text-gray-400">Loading videos...</p>
          </div>
        ) : videos.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-12 h-12 text-gray-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-300 mb-2">No videos found</h3>
            <p className="text-gray-500">
              {searchQuery
                ? "Try different keywords or clear your search"
                : "Be the first to upload a video!"}
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-200">
                {searchQuery ? `Found ${videos.length} videos` : "All Videos"}
              </h2>
            </div>

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
          </>
        )}
      </div>
    </div>
  );
};

export default Home;
