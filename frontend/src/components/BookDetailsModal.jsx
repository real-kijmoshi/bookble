import { motion, AnimatePresence } from "framer-motion";
import { X, LucideStar, Book } from "lucide-react";
import BookReadStatus from "./BookReadStatus";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";

const BookDetailsModal = ({
  book = {},
  onClose = () => {},
  onRatingChange = () => {},
  onReadToggle = () => {},
  onDelete = () => {},
}) => {
  const [rating, setRating] = useState(0);

  useEffect(() => {
    setRating(book?.rating || 0);
  }, [book]);

  const handleChangeRating = (isbn, rating) => {
    setRating(rating);
    onRatingChange(isbn, rating);
  };

  // Safely extract nested properties with default values
  const bookData = book?.bookData || {};
  const authors = bookData.authors || [];
  const cover = bookData.cover || {};

  if (!book) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.9 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full overflow-y-auto max-h-[90vh] shadow-xl relative"
        >
          <button
            onClick={onClose}
            className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>

          <div className="flex flex-col md:grid md:grid-cols-2 gap-4 sm:gap-6 p-4 sm:p-6">
            <div className="relative w-full max-w-[240px] mx-auto md:max-w-none aspect-[2/3]">
              {cover.large ? (
                <img
                  src={cover.large}
                  alt={bookData.title || 'Book Cover'}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <div className="w-full h-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center rounded-lg">
                  <Book className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 dark:text-gray-500" />
                </div>
              )}
            </div>

            <div className="space-y-3 sm:space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">
                {bookData.title || 'Untitled Book'}
              </h2>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                by{" "}
                {authors.length > 0
                  ? authors
                      .map((a) => (
                        <a
                          key={a.url || Math.random()}
                          href={a.url}
                          className="text-blue-500 hover:underline"
                        >
                          {a.name}
                        </a>
                      ))
                      .reduce((prev, curr) => [prev, ", ", curr])
                  : "Unknown Author"}
              </p>

              <BookReadStatus
                read={book.read || false}
                onToggle={() => onReadToggle(book.isbn)}
              />

              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <LucideStar
                    key={i}
                    onClick={() => handleChangeRating(book.isbn, i + 1)}
                    className={`h-4 w-4 sm:h-5 sm:w-5 cursor-pointer ${
                      i < Math.round(rating)
                        ? "text-yellow-400"
                        : "text-gray-300 dark:text-gray-600"
                    }`}
                  />
                ))}
                <span className="ml-2 text-sm sm:text-base text-gray-600 dark:text-gray-300">
                  {rating ? `(${rating?.toFixed(1)})` : "No rating"}
                </span>
              </div>

              {bookData.description && (
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 space-y-1 sm:space-y-2">
                  <h3 className="font-semibold text-gray-800 dark:text-white">
                    Description
                  </h3>
                  <p className="line-clamp-4 sm:line-clamp-5">
                    {bookData.description}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm mt-4">
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Pages</p>
                  <p className="text-gray-800 dark:text-white">
                    {bookData.number_of_pages || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Published</p>
                  <p className="text-gray-800 dark:text-white">
                    {bookData.publish_date || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">ISBN</p>
                  <p className="text-gray-800 dark:text-white">
                    {book.isbn || "Unknown"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center p-4 mt-2 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => onDelete(book?.isbn)}
              className="text-xs sm:text-sm text-red-500 cursor-pointer dark:text-red-400 hover:text-red-600 dark:hover:text-red-500"
            >
              Remove Book
            </button>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Provided by {book?.provider || 'Unknown'}
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

BookDetailsModal.propTypes = {
  book: PropTypes.shape({
    isbn: PropTypes.string,
    rating: PropTypes.number,
    read: PropTypes.bool,
    bookData: PropTypes.shape({
      title: PropTypes.string,
      authors: PropTypes.arrayOf(PropTypes.shape({
        name: PropTypes.string,
        url: PropTypes.string,
      })),
      cover: PropTypes.shape({
        medium: PropTypes.string,
        large: PropTypes.string,
      }),
      description: PropTypes.string,
      number_of_pages: PropTypes.number,
      publish_date: PropTypes.string,
    }),
    provider: PropTypes.string,
  }),
  onClose: PropTypes.func,
  onRatingChange: PropTypes.func,
  onReadToggle: PropTypes.func,
  onDelete: PropTypes.func,
};

export default BookDetailsModal;