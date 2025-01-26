import { motion } from "framer-motion";
import { Book, Check, LucideStar } from "lucide-react";
import PropTypes from "prop-types";

const BookCard = ({ book, onClick }) => {
  return (
    <motion.div
      layout
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => onClick(book)}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden cursor-pointer group"
    >
      <div className="relative aspect-[2/3]">
        {book.bookData.cover?.medium ? (
          <img
            src={book.bookData.cover.medium}
            alt={book.bookData.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
            <Book className="h-16 w-16 text-gray-400 dark:text-gray-500" />
          </div>
        )}

        {book.read && (
          <div className="flex items-center space-x-3 text-green-600 absolute top-4 right-4 bg-white dark:bg-gray-800 p-2 rounded-full shadow-md">
            <Check className="h-6 w-6 animate-pulse" />
            <span className="font-semibold text-sm uppercase tracking-wider dark:text-green-400">
              Completed
            </span>
          </div>
        )}

        {book.rating && (
          <div className="flex items-center space-x-3 text-yellow-400 absolute bottom-4 right-4 bg-white dark:bg-gray-800 p-2 rounded-full shadow-md">
            {[...Array(book.rating)].map((_, i) => (
              <LucideStar key={i} className="h-5 w-5" />
            ))}
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-gray-800 dark:text-white truncate">
          {book.bookData.title}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
          {book.bookData.authors?.map((a) => a.name).join(", ") ||
            "Unknown Author"}
        </p>
      </div>
    </motion.div>
  );
};

BookCard.propTypes = {
  book: PropTypes.shape({
    isbn: PropTypes.string,
    read: PropTypes.bool,
    rating: PropTypes.number,
    bookData: PropTypes.shape({
      title: PropTypes.string,
      authors: PropTypes.arrayOf(
        PropTypes.shape({
          name: PropTypes.string,
          url: PropTypes.string,
        }),
      ),
      cover: PropTypes.shape({
        medium: PropTypes.string,
        large: PropTypes.string,
      }),
    }),
    provider: PropTypes.string,
  }),
  onClick: PropTypes.function,
};

export default BookCard;
