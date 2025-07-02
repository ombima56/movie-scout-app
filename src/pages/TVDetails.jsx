import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useWatchlist } from "../contexts/WatchlistContext";
import { api } from "../utils/api";
import {
  StarIcon,
  TvIcon,
  PlayIcon,
  ClockIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";
import { useState } from "react";
import { Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { useNetworkStatus } from "../hooks/useNetworkStatus";
import { DetailsOfflineMessage } from "../components/OfflineMessage";
import SmartBackButton from "../components/SmartBackButton";

function TVDetails() {
  const { id } = useParams();
  const { addToWatchlist, removeFromWatchlist, watchlist } = useWatchlist();
  const isInWatchlist = watchlist.some((item) => item.id === Number(id));
  const [showPlayer, setShowPlayer] = useState(false);
  const [currentEpisode, setCurrentEpisode] = useState({ season_number: 1, episode_number: 1 });
  const { isOnline } = useNetworkStatus();

  const fetchTVDetails = async () => {
    const [tv, credits, videos, similar, reviews] = await Promise.all([
      api.getTvDetails(id), // Use the enhanced API function
      axios.get(
        `https://api.themoviedb.org/3/tv/${id}/credits?api_key=${import.meta.env.VITE_TMDB_API_KEY}`
      ),
      axios.get(
        `https://api.themoviedb.org/3/tv/${id}/videos?api_key=${import.meta.env.VITE_TMDB_API_KEY}&language=en-US`
      ),
      axios.get(
        `https://api.themoviedb.org/3/tv/${id}/similar?api_key=${import.meta.env.VITE_TMDB_API_KEY}&language=en-US&page=1`
      ),
      axios.get(
        `https://api.themoviedb.org/3/tv/${id}/reviews?api_key=${import.meta.env.VITE_TMDB_API_KEY}&language=en-US&page=1`
      ),
    ]);

    return {
      ...tv,
      credits: credits.data,
      videos: videos.data,
      similar: similar.data,
      reviews: reviews.data,
    };
  };

  const {
    data: tvShow,
    isLoading,
    error,
    refetch,
    isError,
  } = useQuery({
    queryKey: ["tv", id],
    queryFn: fetchTVDetails,
    retry: (failureCount, error) => {
      // Don't retry on 404 errors
      if (error?.status === 404) return false;
      // Retry up to 2 times for other errors
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const handleWatchlistToggle = () => {
    if (isInWatchlist) {
      removeFromWatchlist(Number(id));
    } else {
      addToWatchlist({
        id: Number(id),
        title: tvShow.name,
        poster_path: tvShow.poster_path,
        release_date: tvShow.first_air_date,
        vote_average: tvShow.vote_average,
        media_type: "tv",
      });
    }
  };

  const handleWatchNow = (seasonNumber, episodeNumber) => {
    setCurrentEpisode({ season_number: seasonNumber, episode_number: episodeNumber });
    setShowPlayer(true);
  };

  const handleNextEpisode = () => {
    if (!tvShow || !currentEpisode) return;

    const currentSeasonIndex = tvShow.seasons.findIndex(
      (s) => s.season_number === currentEpisode.season_number
    );
    const currentEpisodeIndex = tvShow.seasons[currentSeasonIndex]?.episodes.findIndex(
      (e) => e.episode_number === currentEpisode.episode_number
    );

    if (currentSeasonIndex === -1 || currentEpisodeIndex === -1) return;

    const currentSeason = tvShow.seasons[currentSeasonIndex];

    // Try to go to the next episode in the current season
    if (currentEpisodeIndex < currentSeason.episodes.length - 1) {
      setCurrentEpisode({
        season_number: currentSeason.season_number,
        episode_number: currentEpisode.episode_number + 1,
      });
    } else {
      // Try to go to the next season
      const nextSeason = tvShow.seasons[currentSeasonIndex + 1];
      if (nextSeason && nextSeason.episodes.length > 0) {
        setCurrentEpisode({
          season_number: nextSeason.season_number,
          episode_number: nextSeason.episodes[0].episode_number,
        });
      } else {
        // No more episodes or seasons
        setShowPlayer(false);
        setCurrentEpisode(null);
      }
    }
  };

  const handlePreviousEpisode = () => {
    if (!tvShow || !currentEpisode) return;

    const currentSeasonIndex = tvShow.seasons.findIndex(
      (s) => s.season_number === currentEpisode.season_number
    );
    const currentEpisodeIndex = tvShow.seasons[currentSeasonIndex]?.episodes.findIndex(
      (e) => e.episode_number === currentEpisode.episode_number
    );

    if (currentSeasonIndex === -1 || currentEpisodeIndex === -1) return;

    const currentSeason = tvShow.seasons[currentSeasonIndex];

    // Try to go to the previous episode in the current season
    if (currentEpisodeIndex > 0) {
      setCurrentEpisode({
        season_number: currentSeason.season_number,
        episode_number: currentEpisode.episode_number - 1,
      });
    } else {
      // Try to go to the previous season
      const prevSeason = tvShow.seasons[currentSeasonIndex - 1];
      if (prevSeason && prevSeason.episodes.length > 0) {
        setCurrentEpisode({
          season_number: prevSeason.season_number,
          episode_number: prevSeason.episodes[prevSeason.episodes.length - 1].episode_number,
        });
      } else {
        // No more episodes or seasons
        setShowPlayer(false);
        setCurrentEpisode(null);
      }
    }
  };

  const formatRuntime = (minutes) => {
    if (!minutes || minutes.length === 0) return "N/A";
    const runtime = minutes[0];
    const hours = Math.floor(runtime / 60);
    const mins = runtime % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  // Show offline message if not connected
  if (!isOnline) {
    return <DetailsOfflineMessage type="tv" />;
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Loading TV show details...
          </p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Failed to Load TV Show
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error?.status === 404
              ? "This TV show could not be found. It may have been removed or the ID is incorrect."
              : error?.message ||
                "We couldn't load the TV show details. Please try again."}
          </p>
          <div className="space-y-3">
            <button
              onClick={() => refetch()}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => window.history.back()}
              className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!tvShow) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-gray-400 text-6xl mb-4">📺</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            TV Show Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The requested TV show could not be found.
          </p>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pt-20">
      {/* Smart Back Button */}
      <SmartBackButton className="mb-4" />

      {/* Hero Section with Player */}
      <div className="relative">
        {showPlayer ? (
          <div className="aspect-video bg-black rounded-lg overflow-hidden">
            <iframe
              src={`https://vidsrc.me/embed/tv?tmdb=${tvShow.id}&season=${currentEpisode.season_number}&episode=${currentEpisode.episode_number}`}
              className="w-full h-full"
              allowFullScreen
              title={`Watch ${tvShow.name} S${currentEpisode.season_number}E${currentEpisode.episode_number}`}
            />
          </div>
        ) : (
          <div
            className="relative aspect-video bg-gradient-to-r mt-20 from-black/70 to-transparent rounded-lg overflow-hidden cursor-pointer group"
            style={{
              backgroundImage: tvShow.backdrop_path
                ? `url(https://image.tmdb.org/t/p/w1280${tvShow.backdrop_path})`
                : "none",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
            onClick={() => handleWatchNow(tvShow.seasons[0]?.season_number || 1, tvShow.seasons[0]?.episodes[0]?.episode_number || 1)}
          >
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white">
                <PlayIcon className="h-20 w-20 mx-auto mb-4 opacity-80 group-hover:opacity-100 transition-opacity" />
                <h2 className="text-2xl font-bold mb-2">Watch {tvShow.name}</h2>
                <p className="text-lg opacity-90">Click to start streaming</p>
              </div>
            </div>
          </div>
        )}

        {showPlayer && currentEpisode && (
          <div className="flex justify-center items-center space-x-4 mt-4">
            <button
              onClick={handlePreviousEpisode}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Previous Episode
            </button>
            <button
              onClick={handleNextEpisode}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Next Episode
            </button>
          </div>
        )}
      </div>

      {/* Seasons Section */}
      {tvShow.seasons && tvShow.seasons.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Seasons
          </h2>
          <div className="space-y-4">
            {tvShow.seasons
              .filter((season) => season.season_number > 0)
              .sort((a, b) => a.season_number - b.season_number) // Sort seasons by number
                .map((season) => (
                <Disclosure as="div" key={season.id} className="border border-gray-200 dark:border-gray-700 rounded-lg">
                  {({ open }) => (
                  <>
                    <DisclosureButton className="flex w-full justify-between rounded-lg bg-gray-100 dark:bg-gray-700 px-4 py-3 text-left text-lg font-medium text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus-visible:ring focus-visible:ring-blue-500 focus-visible:ring-opacity-75">
                    <span>
                      Season {season.season_number}{" "}
                      {season.name && season.name !== `Season ${season.season_number}` && `(${season.name})`}
                    </span>
                    <ChevronDownIcon
                      className={`${
                      open ? "rotate-180 transform" : ""
                      } h-5 w-5 text-gray-500 dark:text-gray-400`}
                    />
                    </DisclosureButton>
                    <DisclosurePanel className="px-4 pt-4 pb-2 text-sm text-gray-500 dark:text-gray-300">
                    {season.overview && (
                      <p className="mb-4">{season.overview}</p>
                    )}
                    {season.episodes && season.episodes.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {season.episodes.map((episode) => (
                        <button
                          onClick={() => handleWatchNow(season.season_number, episode.episode_number)}
                          className={`mt-auto flex text-gray-500 dark:text-gray-300 items-center justify-center px-3 py-3 rounded-lg text-sm font-medium ${
                          currentEpisode.season_number === season.season_number && 
                          currentEpisode.episode_number === episode.episode_number
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400'
                          } transition-colors text-center`}
                        >
                        <PlayIcon className="h-4 w-4 mr-1" />
                        <span className="block truncate">
                          E{episode.episode_number}. {episode.name}{" "}
                          {episode.air_date && `(${new Date(episode.air_date).getFullYear()})`}
                        </span>
                        </button>
                      ))}
                      </div>
                    ) : (
                      <p>No episodes available for this season.</p>
                    )}
                    </DisclosurePanel>
                  </>
                  )}
                </Disclosure>
                ))}
              </div>
            </div>
            )}

            {/* TV Show Info Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-1/4">
            <img
              src={`https://image.tmdb.org/t/p/w500${tvShow.poster_path}`}
              alt={tvShow.name}
              className="w-full rounded-lg shadow-md"
            />
          </div>

          <div className="lg:w-3/4 space-y-6">
            <div>
              <div className="flex items-center mb-4">
                <TvIcon className="h-8 w-8 text-blue-600 mr-3" />
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                  {tvShow.name}
                </h1>
              </div>
              <div className="flex items-center space-x-6 text-gray-600 dark:text-gray-300 mb-4">
                <div className="flex items-center">
                  <StarIcon className="h-5 w-5 text-yellow-400 mr-1" />
                  <span className="font-semibold">
                    {tvShow.vote_average?.toFixed(1)}
                  </span>
                  <span className="text-sm ml-1">/ 10</span>
                </div>
                <div className="flex items-center">
                  <CalendarIcon className="h-5 w-5 mr-1" />
                  <span>{new Date(tvShow.first_air_date).getFullYear()}</span>
                  {tvShow.status === "Ended" && tvShow.last_air_date && (
                    <span>
                      {" "}
                      - {new Date(tvShow.last_air_date).getFullYear()}
                    </span>
                  )}
                </div>
                <div className="flex items-center">
                  <ClockIcon className="h-5 w-5 mr-1" />
                  <span>{formatRuntime(tvShow.episode_run_time)}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Overview
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {tvShow.overview}
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                  Status
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {tvShow.status}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                  Seasons
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {tvShow.number_of_seasons}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                  Episodes
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {tvShow.number_of_episodes}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                  Network
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {tvShow.networks?.map((network) => network.name).join(", ") ||
                    "N/A"}
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Genres
              </h3>
              <div className="flex flex-wrap gap-2">
                {tvShow.genres?.map((genre) => (
                  <span
                    key={genre.id}
                    className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleWatchlistToggle}
                className="flex items-center px-6 py-3 rounded-lg text-sm font-medium bg-gray-600 text-white hover:bg-gray-700 transition-colors"
              >
                {isInWatchlist ? "Remove from Watchlist" : "Add to Watchlist"}
              </button>
              {!showPlayer && (
                <button
                  onClick={handleWatchNow}
                  className="flex items-center px-6 py-3 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors"
                >
                  <PlayIcon className="h-5 w-5 mr-2" />
                  Watch Now
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Cast Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Cast & Crew
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {tvShow.credits?.cast?.slice(0, 12).map((cast) => (
            <div key={cast.id} className="text-center">
              <img
                src={
                  cast.profile_path
                    ? `https://image.tmdb.org/t/p/w185${cast.profile_path}`
                    : "/placeholder-person.jpg"
                }
                alt={cast.name}
                className="w-full aspect-[2/3] object-cover rounded-lg mb-3"
              />
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                {cast.name}
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {cast.character}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Similar TV Shows Section */}
      {tvShow.similar?.results?.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Similar TV Shows
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {tvShow.similar.results.slice(0, 12).map((similarShow) => (
              <div key={similarShow.id} className="group cursor-pointer">
                <img
                  src={
                    similarShow.poster_path
                      ? `https://image.tmdb.org/t/p/w300${similarShow.poster_path}`
                      : "/placeholder-movie.jpg"
                  }
                  alt={similarShow.name}
                  className="w-full aspect-[2/3] object-cover rounded-lg mb-3 group-hover:scale-105 transition-transform"
                />
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                  {similarShow.name}
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {new Date(similarShow.first_air_date).getFullYear()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reviews Section */}
      {tvShow.reviews?.results?.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Reviews
          </h2>
          <div className="space-y-6">
            {tvShow.reviews.results.slice(0, 3).map((review) => (
              <div
                key={review.id}
                className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-b-0"
              >
                <div className="flex items-center mb-3">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {review.author}
                  </h3>
                  {review.author_details?.rating && (
                    <div className="ml-4 flex items-center">
                      <StarIcon className="h-4 w-4 text-yellow-400 mr-1" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {review.author_details.rating}/10
                      </span>
                    </div>
                  )}
                </div>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {review.content.length > 500
                    ? `${review.content.substring(0, 500)}...`
                    : review.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default TVDetails;
