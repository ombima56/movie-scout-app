import './App.css'

function App() {
  return (
    <main className="landing-container">
      <header className="landing-header">
        <h1> Movie-Scout-App</h1>
        <p>Discover your next favorite movie or show. Search, explore, and build your personal watchlist.</p>
        <a href="#explore" className="cta-button">Start Exploring</a>
      </header>

      <section className="features" id="explore">
        <div className="feature">
          <h2>🔍 Smart Search</h2>
          <p>Find movies and TV shows with real-time results powered by TMDB and OMDB APIs.</p>
        </div>
        <div className="feature">
          <h2>🔥 Trending Now</h2>
          <p>Explore what's popular across genres and platforms today.</p>
        </div>
        <div className="feature">
          <h2>📋 Your Watchlist</h2>
          <p>Keep track of what you've watched and what you plan to watch.</p>
        </div>
        <div className="feature">
          <h2>🌟 Ratings & Recommendations</h2>
          <p>See ratings from IMDB, Rotten Tomatoes, and get personalized picks.</p>
        </div>
      </section>

      <footer className="footer">
        <p>&copy; 2025 Movie-Scout-App </p>
      </footer>
    </main>
  )
}

export default App
