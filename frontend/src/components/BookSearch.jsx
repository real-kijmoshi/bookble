import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Camera as CameraIcon,
  Search,
  Loader2,
  Filter,
  ChevronDown,
} from "lucide-react";
import PropTypes from "prop-types";
import BarcodeScanner from "./BarcodeScanner";

const API_URL = import.meta.env.VITE_API_BASE;

// Book search providers
const PROVIDERS = {
  googlebooks: {
    name: "Google Books",
    search: async (query, limit) => {
      try {
        const response = await fetch(
          `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}${limit === "All" ? "" : `&maxResults=${limit}`}`,
        );
        const data = await response.json();

        return (data.items || [])
          .filter(
            (book) =>
              book.volumeInfo.imageLinks && book.volumeInfo.industryIdentifiers,
          )
          .slice(0, limit)
          .map((book) => ({
            title: book.volumeInfo.title,
            author: book.volumeInfo.authors?.[0] || "Unknown Author",
            isbn:
              book.volumeInfo.industryIdentifiers.find(
                (id) => id.type === "ISBN_13",
              )?.identifier ||
              book.volumeInfo.industryIdentifiers[0].identifier,
            cover: book.volumeInfo.imageLinks.thumbnail,
            publishDate: book.volumeInfo.publishedDate,
            source: "googlebooks.com",
          }));
      } catch (error) {
        console.error("Google Books search error:", error);
        return [];
      }
    },
  },

  bookble: {
    name: "bookble",
    search: async (query, limit) => {
      try {
        const response = await fetch(
          `${API_URL}/search?query=${encodeURIComponent(query)}&limit=${limit}`,
        );
        const data = await response.json();

        return data.books.map((book) => ({
          title: book.title,
          author: book.author,
          isbn: book.isbn,
          cover: book.cover,
          publishDate: book.publish_date,
          source: "bookble",
        }));
      } catch (error) {
        console.error("bookble search error:", error);
        return [];
      }
    },
  },
  openlibrary: {
    name: "Open Library",
    search: async (query, limit) => {
      try {
        const response = await fetch(
          `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}${limit === "All" ? "" : `&limit=${limit}`}`,
        );
        const data = await response.json();

        return data.docs
          .filter((book) => book.cover_i && book.isbn)
          .slice(0, limit)
          .map((book) => ({
            title: book.title,
            author: book.author_name?.[0] || "Unknown Author",
            isbn: book.isbn[0],
            cover: `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`,
            publishDate: book.first_publish_year,
            source: "openlibrary.org",
          }));
      } catch (error) {
        console.error("Open Library search error:", error);
        return [];
      }
    },
  },
};

const RESULT_LIMITS = [5, 10, 15, 20, "All"];

const BookSearch = ({ onAddBook, onClose }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showScanner, setShowScanner] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [currentProvider, setCurrentProvider] = useState("googlebooks");
  const [resultLimit, setResultLimit] = useState(10);
  const [showProviderDropdown, setShowProviderDropdown] = useState(false);
  const [showLimitDropdown, setShowLimitDropdown] = useState(false);

  // Provider switching
  const changeProvider = (providerKey) => {
    setCurrentProvider(providerKey);
    // Clear previous search results when switching providers
    setSearchResults([]);
    setShowProviderDropdown(false);
  };

  useEffect(() => {
    (async () => {
      if (!searchQuery.trim()) return;

      setIsSearching(true);
      try {
        const results = await PROVIDERS[currentProvider].search(
          searchQuery,
          resultLimit,
        );
        setSearchResults(results);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsSearching(false);
      }
    })();
  }, [searchQuery, currentProvider, resultLimit]);

  return (
    <>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-gray-800 rounded-3xl max-w-4xl w-full mx-auto overflow-hidden shadow-2xl relative"
      >
        <div className="p-8">
          <div className="flex items-center space-x-4 mb-6">
            <button
              onClick={onClose}
              className="bg-gray-100 dark:bg-gray-700 rounded-full p-2 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
            >
              <X className="h-6 w-6 text-gray-600 dark:text-gray-300" />
            </button>
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white flex-grow">
              Search Books
            </h2>

            {/* Provider Selector */}
            <div className="relative">
              <button
                onClick={() => setShowProviderDropdown(!showProviderDropdown)}
                className="flex items-center bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
              >
                {PROVIDERS[currentProvider].name}
                <ChevronDown className="ml-2 h-4 w-4" />
              </button>
              <AnimatePresence>
                {showProviderDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-lg shadow-lg z-50"
                  >
                    {Object.entries(PROVIDERS)
                      .filter(([key]) => key !== currentProvider)
                      .map(([key, provider]) => (
                        <button
                          key={key}
                          onClick={() => changeProvider(key)}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600"
                        >
                          {provider.name}
                        </button>
                      ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Result Limit Selector */}
            <div className="relative">
              <button
                onClick={() => setShowLimitDropdown(!showLimitDropdown)}
                className="flex items-center bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white px-4 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition"
              >
                <Filter className="mr-2 h-4 w-4" />
                {resultLimit} Results
                <ChevronDown className="ml-2 h-4 w-4" />
              </button>
              <AnimatePresence>
                {showLimitDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-32 bg-white dark:bg-gray-700 rounded-lg shadow-lg z-50"
                  >
                    {RESULT_LIMITS.filter((limit) => limit !== resultLimit).map(
                      (limit) => (
                        <button
                          key={limit}
                          onClick={() => {
                            setResultLimit(limit);
                            setShowLimitDropdown(false);
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600"
                        >
                          {limit} Results
                        </button>
                      ),
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={() => setShowScanner(true)}
              className="bg-indigo-500 text-white p-2 rounded-full hover:bg-indigo-600 transition"
            >
              <CameraIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="relative mb-6">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, author, or ISBN"
              className="w-full bg-gray-100 dark:bg-gray-700 p-4 pl-12 rounded-xl text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
          </div>

          {isSearching && (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="animate-spin text-blue-500 h-12 w-12" />
            </div>
          )}

          {!isSearching && searchResults.length === 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-gray-500 dark:text-gray-400 py-8"
            >
              No results found. Try a different search or provider.
            </motion.p>
          )}

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto max-h-96">
            <AnimatePresence>
              {searchResults.map((book) => (
                <motion.div
                  key={book.isbn}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gray-100 dark:bg-gray-700 rounded-xl overflow-hidden shadow-md cursor-pointer flex flex-col transform transition-all duration-300"
                  onClick={() => onAddBook(book.isbn, book.source)}
                >
                  <div className="relative">
                    <img
                      src={book.cover}
                      alt={book.title}
                      className="w-full h-64 object-cover"
                    />
                    <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
                      {book.source}
                    </div>
                  </div>
                  <div className="p-4 flex-grow bg-white dark:bg-gray-800">
                    <h3 className="font-bold text-base mb-1 line-clamp-2 text-gray-800 dark:text-white">
                      {book.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">
                      {book.author}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Scanner Modal */}
      {showScanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <BarcodeScanner
            onClose={() => setShowScanner(false)}
            handleAddBook={onAddBook}
          />
        </div>
      )}

      {/* Click-outside handlers for dropdowns */}
      {(showProviderDropdown || showLimitDropdown) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowProviderDropdown(false);
            setShowLimitDropdown(false);
          }}
        />
      )}
    </>
  );
};

BookSearch.propTypes = {
  onAddBook: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default BookSearch;
