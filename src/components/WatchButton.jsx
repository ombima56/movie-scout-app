import { useState } from "react";
import { PlayIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";

function WatchButton({
  videos = [],
  imdbId = null,
  tmdbId = null,
  title = "",
  mediaType = "movie",
  className = "",
  size = "default",
}) {
  const [isLoading, setIsLoading] = useState(false);

  const handleWatchNow = async () => {
    setIsLoading(true);

    try {
      // Primary: Use vidsrc.me for direct streaming if we have TMDB ID
      if (tmdbId) {
        const vidsrcUrl =
          mediaType === "movie"
            ? `https://vidsrc.me/embed/movie?tmdb=${tmdbId}`
            : `https://vidsrc.me/embed/tv?tmdb=${tmdbId}`;
        window.open(vidsrcUrl, "_blank");
        return;
      }

      // Secondary: Find trailer or teaser video for preview
      const trailer =
        videos.find(
          (video) => video.type === "Trailer" && video.site === "YouTube"
        ) ||
        videos.find(
          (video) => video.type === "Teaser" && video.site === "YouTube"
        ) ||
        videos.find((video) => video.site === "YouTube");

      if (trailer) {
        window.open(`https://www.youtube.com/watch?v=${trailer.key}`, "_blank");
      } else if (imdbId) {
        // Fallback to IMDb
        window.open(`https://www.imdb.com/title/${imdbId}`, "_blank");
      } else {
        // Last resort: search on popular streaming platforms
        const searchQuery = encodeURIComponent(title);
        const streamingOptions = [
          {
            name: "Netflix",
            url: `https://www.netflix.com/search?q=${searchQuery}`,
          },
          {
            name: "Amazon Prime",
            url: `https://www.amazon.com/s?k=${searchQuery}&i=instant-video`,
          },
          { name: "Hulu", url: `https://www.hulu.com/search?q=${searchQuery}` },
          {
            name: "Disney+",
            url: `https://www.disneyplus.com/search?q=${searchQuery}`,
          },
        ];

        window.open(streamingOptions[0].url, "_blank");
      }
    } catch (error) {
      console.error("Error opening watch link:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case "small":
        return "px-3 py-1.5 text-xs";
      case "large":
        return "px-8 py-4 text-base";
      default:
        return "px-6 py-3 text-sm";
    }
  };

  const getIconSize = () => {
    switch (size) {
      case "small":
        return "h-3 w-3";
      case "large":
        return "h-6 w-6";
      default:
        return "h-5 w-5";
    }
  };

  const hasWatchableContent = tmdbId || videos.length > 0 || imdbId;

  return (
    <button
      onClick={handleWatchNow}
      disabled={isLoading}
      className={`
        flex items-center justify-center rounded-md font-medium transition-all duration-200
        ${
          hasWatchableContent
            ? "bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            : "bg-gray-400 text-white cursor-not-allowed"
        }
        ${getSizeClasses()}
        ${isLoading ? "opacity-75 cursor-wait" : ""}
        ${className}
      `}
      title={
        hasWatchableContent
          ? `Watch ${title}`
          : "No streaming sources available"
      }
    >
      {isLoading ? (
        <svg
          className={`animate-spin ${getIconSize()} mr-2`}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : hasWatchableContent ? (
        <PlayIcon className={`${getIconSize()} mr-2`} />
      ) : (
        <ExclamationTriangleIcon className={`${getIconSize()} mr-2`} />
      )}

      {isLoading ? "Loading..." : "Watch Now"}
    </button>
  );
}

export default WatchButton;
