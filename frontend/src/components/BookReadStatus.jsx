import { useState } from "react";
import { BookOpen, Check } from "lucide-react";
import PropTypes from "prop-types";

const BookReadStatus = ({ read = false, onToggle }) => {
  const [isRead, setIsRead] = useState(read);

  const handleToggleReadStatus = () => {
    const newReadStatus = !isRead;
    setIsRead(newReadStatus);
    onToggle && onToggle(newReadStatus);
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-700 rounded-xl p-4 flex items-center space-x-4">
      {isRead ? (
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-3 text-green-600">
            <Check className="h-6 w-6 animate-pulse" />
            <span className="font-semibold text-sm uppercase tracking-wider dark:text-green-400">
              Completed
            </span>
          </div>
          <button
            onClick={handleToggleReadStatus}
            className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors"
          >
            Reset Progress
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-3 text-blue-600 dark:text-blue-400">
            <BookOpen className="h-6 w-6" />
            <span className="font-medium text-sm dark:text-gray-300">
              Not Read
            </span>
          </div>
          <button
            onClick={handleToggleReadStatus}
            className="text-sm bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500 transition-colors"
          >
            Mark as Read
          </button>
        </div>
      )}
    </div>
  );
};

BookReadStatus.propTypes = {
  read: PropTypes.bool,
  onToggle: PropTypes.func,
};

export default BookReadStatus;
