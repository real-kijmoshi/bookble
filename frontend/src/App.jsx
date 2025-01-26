import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Book, Loader2 } from "lucide-react";
import useProfile from "./hooks/useProfile";
import Login from "./pages/Login";
import BookSearch from "./components/BookSearch";
import BarcodeScanner from "./components/BarcodeScanner";
import BookCard from "./components/BookCard";
import NetworkToast from "./components/NetworkToast";
import BookDetailsModal from "./components/BookDetailsModal";
import AddBookFAB from "./components/AddBookFAB";
import PropTypes from "prop-types";

function App() {
  const [selectedBook, setSelectedBook] = useState(null);
  const [showAddBook, setShowAddBook] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [showNetworkToast, setShowNetworkToast] = useState(false);
  const [sortBy, setSortBy] = useState("title");

  const { profile, error, addBookToCollection, onRatingChange, onReadToggle } = useProfile();
    useProfile();

  const refresh = () => window.location.reload();

  useEffect(() => {
    if (error === "NetworkError when attempting to fetch resource.") {
      setShowNetworkToast(true);
    }
  }, [error]);

  const handleAddBook = async (book, provider) => {
    try {
      await addBookToCollection(book, provider);
      setShowAddBook(false);
    } catch (error) {
      console.error(error);
    }
  };

  if (error === "No token provided") return <Login />;
  if (new URLSearchParams(window.location.search).has("logout")) {
    localStorage.removeItem("token");
    localStorage.removeItem("profile");
    refresh();
  }

  if (error?.startsWith("can't access property")) {
    // Clear the profile from localStorage and reload the page
  }

  if (error && error !== "NetworkError when attempting to fetch resource.") {
    return <ErrorScreen error={error} onRetry={refresh} />;
  }


  if (!profile) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <NetworkToast
          visible={showNetworkToast}
          onClose={() => setShowNetworkToast(false)}
        />

        <Header />

        <BookCollection
          books={profile.collection}
          onBookSelect={setSelectedBook}
          onAddBook={() => setShowAddBook(true)}
          sortBy={sortBy}
          setSortBy={setSortBy}
        />

        <AddBookFAB onAddBook={() => setShowAddBook(true)} />

        <ScannerModal
          visible={showScanner}
          onClose={() => setShowScanner(false)}
          onAddBook={handleAddBook}
        />

        <AddBookModal
          visible={showAddBook}
          onClose={() => setShowAddBook(false)}
          onAddBook={handleAddBook}
        />

        <BookDetailsModal
          book={selectedBook}
          onRatingChange={onRatingChange}
          onReadToggle={onReadToggle}
          onClose={() => setSelectedBook(null)}
        />
      </main>
    </div>
  );
}

// Sub-components
const LoadingScreen = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700"
  >
    <div className="text-center space-y-6">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      >
        <Loader2 className="h-24 w-24 text-blue-600 dark:text-blue-400 mx-auto" />
      </motion.div>
      <h2 className="text-3xl font-bold text-gray-700 dark:text-gray-200">
        Loading Your Library...
      </h2>
    </div>
  </motion.div>
);

const ErrorScreen = ({ error, onRetry }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700"
  >
    <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl text-center max-w-md">
      <h1 className="text-4xl font-bold text-red-600 mb-4">Oops!</h1>
      <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">{error}</p>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onRetry}
        className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors"
      >
        Try Again
      </motion.button>
    </div>
  </motion.div>
);

const Header = () => (
  <motion.header
    initial={{ y: -20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    className="mb-16 text-center"
  >
    <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-purple-400">
      Your Book Collection
    </h1>
    <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
      Discover, organize, and enjoy your personal library
    </p>
  </motion.header>
);

const BookCollection = ({ books, onBookSelect, onAddBook, sortBy, setSortBy }) => (
  <section>
    <div className="flex items-center justify-between mb-8">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
        My Books ({books.length})
      </h2>
    </div>

    <div className="mb-8">
      <label htmlFor="sortBy" className="sr-only">
        Sort By
      </label>
      <select
        id="sortBy"
        name="sortBy"
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value)}
        className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 rounded-lg px-4 py-2"
      >
        <option value="title">Title</option>
        <option value="author">Author</option>
        <option value="rating-desc">Rating (High to Low)</option>
        <option value="rating-asc">Rating (Low to High)</option>
        <option value="read">Read Status (Read First)</option>
        <option value="unread">Read Status (Unread First)</option>
      </select>
    </div>

    {books.length === 0 ? (
      <EmptyCollection onAddBook={onAddBook} />
    ) : (
      <motion.div
        layout
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        <AnimatePresence>
          
          {
            books
              .sort((a, b) => {
                if (sortBy === "title") return a.bookData.title.localeCompare(b.bookData.title);
                if (sortBy === "author") return a.bookData.authors[0].name.localeCompare(b.bookData.authors[0].name);
                if (sortBy === "rating-desc") return b.rating - a.rating;
                if (sortBy === "rating-asc") return a.rating - b.rating;
                if (sortBy === "read") return b.read - a.read;
                if (sortBy === "unread") return a.read - b.read;
              })
              .map((book) => (
                <BookCard
                  key={book.isbn}
                  book={book}
                  onClick={onBookSelect}
                />
              ))
          }
        </AnimatePresence>
      </motion.div>
    )}
  </section>
);

const EmptyCollection = ({ onAddBook }) => (
  <motion.div
    initial={{ scale: 0.9, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    className="text-center py-16 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-3xl"
  >
    <Book className="h-24 w-24 mx-auto text-gray-400 dark:text-gray-500 mb-6" />
    <p className="text-xl text-gray-500 dark:text-gray-400 mb-8">
      No books in your collection yet
    </p>
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onAddBook}
      className="bg-blue-500 text-white px-8 py-3 rounded-lg hover:bg-blue-600 transition-colors"
    >
      Add Your First Book
    </motion.button>
  </motion.div>
);

const ScannerModal = ({ visible, onClose, onAddBook }) => (
  <AnimatePresence>
    {visible && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      >
        <BarcodeScanner onClose={onClose} handleAddBook={onAddBook} />
      </motion.div>
    )}
  </AnimatePresence>
);

const AddBookModal = ({ visible, onClose, onAddBook }) => (
  <AnimatePresence>
    {visible && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      >
        <BookSearch onAddBook={onAddBook} onClose={onClose} />
      </motion.div>
    )}
  </AnimatePresence>
);

// PropTypes
App.propTypes = {};

LoadingScreen.propTypes = {};

ErrorScreen.propTypes = {
  error: PropTypes.string,
  onRetry: PropTypes.function,
};

Header.propTypes = {};

BookCollection.propTypes = {
  books: PropTypes.array,
  onBookSelect: PropTypes.function,
  onAddBook: PropTypes.function,
  sortBy: PropTypes.string,
  setSortBy: PropTypes.function,
};

EmptyCollection.propTypes = {
  onAddBook: PropTypes.function,
};

ScannerModal.propTypes = {
  visible: PropTypes.bool,
  onClose: PropTypes.function,
  onAddBook: PropTypes.function,
};

AddBookModal.propTypes = {
  visible: PropTypes.bool,
  onClose: PropTypes.function,
  onAddBook: PropTypes.function,
};

export default App;
