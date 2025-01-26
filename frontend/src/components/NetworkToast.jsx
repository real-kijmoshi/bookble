import { motion } from "framer-motion";
import { X } from "lucide-react";
import PropTypes from "prop-types";

const NetworkToast = ({ visible, onClose }) => {
  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: visible ? 0 : -20, opacity: visible ? 1 : 0 }}
      className="fixed top-4 right-4 bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg flex items-center shadow-lg"
    >
      <p className="text-sm">
        No connection with the server. Some features may not work as expected.
      </p>
      <button
        onClick={onClose}
        className="ml-3 text-red-700 hover:text-red-900 transition-colors"
      >
        <X className="h-5 w-5" />
      </button>
    </motion.div>
  );
};

NetworkToast.propTypes = {
  visible: PropTypes.bool,
  onClose: PropTypes.function,
};

export default NetworkToast;
