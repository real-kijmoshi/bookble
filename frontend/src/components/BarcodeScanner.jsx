import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { X, Scan, AlertTriangle, Camera, Book } from "lucide-react";
import Quagga from "@ericblade/quagga2";
import PropTypes from "prop-types";

const PROVIDERS = [
  {
    name: "Google Books",
    fetch: async (isbn) => {
      const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`);
      const data = await response.json();
      return data.items?.[0]?.volumeInfo;
    },
  },
  {
    name: "Open Library",
    fetch: async (isbn) => {
      const response = await fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&jscmd=data&format=json`);
      const data = await response.json();
      return data[`ISBN:${isbn}`];
    },
  }
];

const BarcodeScanner = ({ onClose, handleAddBook }) => {
  const scannerRef = useRef(null);
  const [error, setError] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [hasCamera, setHasCamera] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [bookData, setBookData] = useState(null);
  const [providerName, setProviderName] = useState(null);
  const [isbn, setIsbn] = useState(null);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((stream) => {
        setHasCamera(true);
        stream.getTracks().forEach(track => track.stop());
      })
      .catch((err) => {
        console.error("Camera access error:", err);
        setError("Could not access camera. Please check permissions.");
        setHasCamera(false);
      });
  }, []);

  const handleConfirmation = (confirmed) => {
    if (confirmed && isbn && providerName) {
      handleAddBook(isbn, providerName);
    }
    setShowConfirmation(false);
    onClose();
  };

  useEffect(() => {
    if (!scannerRef.current || !hasCamera) {
      return;
    }

    const initScanner = async () => {
      try {
        setScanning(true);
        
        try {
          Quagga.stop();
        } catch (e) {
          // Ignore errors from stopping
        }

        await Quagga.init({
          inputStream: {
            name: "Live",
            type: "LiveStream",
            target: scannerRef.current,
            constraints: {
              width: { min: 640 },
              height: { min: 480 },
              aspectRatio: { min: 1, max: 2 },
              facingMode: "environment",
            },
            area: {
              top: "0%",
              right: "0%",
              left: "0%",
              bottom: "0%",
            },
            singleChannel: false
          },
          locator: {
            patchSize: "medium",
            halfSample: true,
          },
          numOfWorkers: 2,
          decoder: {
            readers: [
              "ean_reader",
              "ean_8_reader",
              "code_128_reader",
              "code_39_reader",
            ],
          },
          locate: true,
        }, function(err) {
          if (err) {
            console.error("Quagga initialization error:", err);
            setError("Failed to initialize scanner. Please try again.");
            setScanning(false);
            return;
          }
          
          Quagga.start();
        });

        const onDetected = result => {
          const code = result.codeResult.code;
          const detectedIsbn = code.length === 13 ? code : `978${code}`;
          let foundBookData = null;
          let foundProviderName = null;
          
          //pause scanning 
          Quagga.offDetected();
          Quagga.stop();

          for (const provider of PROVIDERS) {
            console.log("Fetching book data from", provider.name);
            provider.fetch(detectedIsbn)
              .then((data) => {
                if (data) {
                  foundBookData = data;
                  foundProviderName = provider.name;
                }
              }).catch((err) => {
                console.error("Provider fetch error:", err);
              });
          }

          if (!foundBookData) {
            // play scanning
            Quagga.onDetected(onDetected);

            setError("Book data not found. Please try again.");
            setTimeout(() => setError(null), 3000);
            return;
          }

          
          setBookData(foundBookData);
          setProviderName(foundProviderName);
          setIsbn(detectedIsbn);
          setShowConfirmation(true);
        };

        Quagga.onDetected(onDetected);
        Quagga.start();
      } catch (err) {
        console.error("Scanner error:", err);
        setError("Failed to initialize scanner. Please try again.");
        setScanning(false);
      }
    };

    initScanner();

    return () => {
      try {
        Quagga.offDetected();
        Quagga.stop();
      } catch (e) {
        // Ignore cleanup errors
      }
      setScanning(false);
    };
  }, [handleAddBook, onClose, hasCamera]);

  const BookConfirmationModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-gray-800 rounded-3xl max-w-md w-full mx-auto p-6 shadow-2xl relative"
      >
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Book className="w-6 h-6" />
          Add Book to Collection
        </h2>
        {bookData && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">
              {bookData.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {bookData.authors?.join(", ")}
            </p>
            {bookData.publishedDate && (
              <p className="text-sm text-gray-500 dark:text-gray-500">
                Published: {bookData.publishedDate}
              </p>
            )}
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
              ISBN: {isbn}
            </p>
          </div>
        )}
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => handleConfirmation(true)}
            className="bg-blue-500 text-white px-6 py-2 rounded-full hover:bg-blue-600"
          >
            Add Book
          </button>
          <button
            onClick={() => handleConfirmation(false)}
            className="text-blue-500 border border-blue-500 px-6 py-2 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900"
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </div>
  );

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
                {hasCamera ? (
                  <>
                    <Camera className="w-6 h-6 mr-2" />
                    Initializing camera...
                  </>
                ) : (
                  "Camera access required"
                )}
              </div>
            )}
          </div>
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            Position the barcode within the camera view. The scanner will
            automatically detect valid ISBN codes.
          </p>
        </div>
      </motion.div>
      {showConfirmation && <BookConfirmationModal />}
    </div>
  );
};

BarcodeScanner.propTypes = {
  onClose: PropTypes.func.isRequired,
  handleAddBook: PropTypes.func.isRequired,
};

export default BarcodeScanner;