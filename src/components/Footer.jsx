import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Movie Scout
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Discover your next favorite movie or TV show. Explore trending content,
              create your watchlist, and dive into detailed information.
            </p>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-600 dark:text-gray-400 hover:text-primary-500">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/trending" className="text-gray-600 dark:text-gray-400 hover:text-primary-500">
                  Trending
                </Link>
              </li>
              <li>
                <Link to="/watchlist" className="text-gray-600 dark:text-gray-400 hover:text-primary-500">
                  My Watchlist
                </Link>
              </li>
              <li>
                <Link to="/search" className="text-gray-600 dark:text-gray-400 hover:text-primary-500">
                  Search
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              About
            </h4>
            <ul className="space-y-2">
              <li>
                <a href="/about" className="text-gray-600 dark:text-gray-400 hover:text-primary-500">
                  About Us
                </a>
              </li>
              <li>
                <a href="/privacy" className="text-gray-600 dark:text-gray-400 hover:text-primary-500">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="/terms" className="text-gray-600 dark:text-gray-400 hover:text-primary-500">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800">
          <p className="text-center text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} Movie Scout. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
