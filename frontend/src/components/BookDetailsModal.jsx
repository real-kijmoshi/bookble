import { motion, AnimatePresence } from "framer-motion";
import { X, LucideStar, Book } from "lucide-react";
import BookReadStatus from "./BookReadStatus";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";

const BookDetailsModal = ({ book, onClose, onRatingChange, onReadToggle, onRemoveBook }) => {
  const [rating, setRating] = useState(book?.rating || 0);

  useEffect(() => {
    setRating(book?.rating || 0);
  }, [book]);

  
  const handleChangeRating = (isbn, rating) => {
    setRating(rating);
    
    onRatingChange(isbn, rating);
  };
  
  if (!book) return null;
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.9 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full overflow-hidden shadow-xl relative"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <X className="h-6 w-6" />
          </button>

          <div className="grid md:grid-cols-2 gap-6 p-6">
            <div className="relative aspect-[2/3]">
              {book.bookData.cover?.large ? (
                <img
                  src={book.bookData.cover.large}
                  alt={book.bookData.title}
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                <div className="w-full h-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center rounded-xl">
                  <Book className="h-16 w-16 text-gray-400 dark:text-gray-500" />
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                {book.bookData.title}
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                by{" "}
                {book.bookData.authors?.map((a) => (<a key={a.url} href={a.url} className="text-blue-500 hover:underline">{a.name}</a>)).reduce((prev, curr) => [prev, ", ", curr]) ||
                  "Unknown Author"}
              </p>

              <BookReadStatus read={book.read} onToggle={() => onReadToggle(book.isbn)} />

              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <LucideStar
                    key={i}
                    onClick={() => handleChangeRating(book.isbn, i + 1)}
                    className={`h-5 w-5 cursor-pointer ${
                      i < Math.round(rating)
                        ? "text-yellow-400"
                        : "text-gray-300 dark:text-gray-600"
                    }`}
                  />
                ))}
                <span className="ml-2 text-gray-600 dark:text-gray-300">
                  ({rating?.toFixed(1) || "No rating"})
                </span>
              </div>

              {book.bookData.description && (
                <div className="text-gray-600 dark:text-gray-300 text-sm space-y-2">
                  <h3 className="font-semibold text-gray-800 dark:text-white">
                    Description
                  </h3>
                  <p className="line-clamp-5">{book.bookData.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Pages</p>
                  <p className="text-gray-800 dark:text-white">
                    {book.bookData.number_of_pages || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Published</p>
                  <p className="text-gray-800 dark:text-white">
                    {book.bookData.publish_date || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">ISBN</p>
                  <p className="text-gray-800 dark:text-white">{book.isbn}</p>
                </div>

                <h3 className="absolute bottom-4 right-4 text-gray-500 dark:text-gray-400">
                  Provided by {book.provider}
                </h3>

                <button
                  onClick={() => onRemoveBook(book.isbn)}
                  className="absolute bottom-4 left-4 text-red-500 cursor-pointer dark:text-red-400 hover:text-red-600 dark:hover:text-red-500"
                >
                  Remove Book
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

BookDetailsModal.propTypes = {
  book: {
    isbn: PropTypes.string,
    data: {
      read: PropTypes.bool,
      rating: PropTypes.number,
    },
    bookData: {
      title: PropTypes.string,
      authors: [
        {
          name: PropTypes.string,
          url: PropTypes.string,
        },
      ],
      cover: {
        medium: PropTypes.string,
        large: PropTypes.string,
      },
    },
    provider: PropTypes.string,
  },
  onClose: PropTypes.func,
  onRatingChange: PropTypes.func,
  onReadToggle: PropTypes.func,
  onRemoveBook: PropTypes.func,
};

export default BookDetailsModal;
