import PropTypes from "prop-types";
import { motion } from "framer-motion";
import { PlusCircle } from "lucide-react";

const AddBookFAB = ({ onAddBook }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onAddBook}
      className="fixed bottom-6 right-6 bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-600 transition-colors"
    >
      <PlusCircle className="h-8 w-8" />
    </motion.button>
  );
};
AddBookFAB.propTypes = {
  onAddBook: PropTypes.function,
};

export default AddBookFAB;
