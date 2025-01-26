import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { X, Scan, AlertTriangle } from "lucide-react";
import Quagga from "@ericblade/quagga2";
import PropTypes from "prop-types";

const BarcodeScanner = ({ onClose, handleAddBook }) => {
  const scannerRef = useRef(null);
  const [error, setError] = useState(null);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    if (!scannerRef.current) {
      return;
    }

    const initScanner = async () => {
      try {
        setScanning(true);
        await Quagga.init({
          inputStream: {
            name: "Live",
            type: "LiveStream",
            target: scannerRef.current,
            constraints: {
              width: 640,
              height: 480,
              facingMode: "environment",
            },
            area: {
              top: "0%",
              right: "0%",
              left: "0%",
              bottom: "0%",
            },
          },
          locator: {
            patchSize: "medium",
            halfSample: true,
          },
          numOfWorkers: navigator.hardwareConcurrency || 4,
          decoder: {
            readers: [
              "ean_reader",
              "ean_8_reader",
              "code_128_reader",
              "code_39_reader",
            ],
          },
          locate: true,
        });

        Quagga.start();

        Quagga.onDetected((result) => {
          const code = result.codeResult.code;
          if (code && (code.length === 10 || code.length === 13)) {
            handleAddBook(code);
            onClose();
          } else {
            setError("Invalid barcode format. Please try again.");
            setTimeout(() => setError(null), 3000);
          }
        });
      } catch (err) {
        console.error(err);
        setError("Could not access camera. Please check permissions.");
        setScanning(false);
      }
    };

    initScanner();

    return () => {
      Quagga.offDetected();
      Quagga.stop();
      setScanning(false);
    };
  }, [handleAddBook, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-gray-800 rounded-3xl max-w-3xl w-full mx-auto overflow-hidden shadow-2xl relative"
      >
        <div className="p-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="w-6 h-6" />
          </button>

          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Scan className="w-6 h-6" />
            Scan Book Barcode
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              {error}
            </div>
          )}

          <div
            ref={scannerRef}
            className="relative w-full aspect-video bg-black rounded-lg overflow-hidden"
          >
            {!scanning && (
              <div className="absolute inset-0 flex items-center justify-center text-white">
                Initializing camera...
              </div>
            )}
          </div>

          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            Position the barcode within the camera view. The scanner will
            automatically detect valid ISBN codes.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

BarcodeScanner.propTypes = {
  onClose: PropTypes.function,
  handleAddBook: PropTypes.function,
};

export default BarcodeScanner;
