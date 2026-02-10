import { AlertCircle, CheckCircle, X } from "lucide-react";
import { useEffect, useState } from "react";

type FeedbackModalProps = {
  isOpen: boolean;
  onClose: () => void;
  type: "success" | "error";
  title: string;
  message: string;
};

const FeedbackModal = ({
  isOpen,
  onClose,
  type,
  title,
  message,
}: FeedbackModalProps) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShow(true);
    } else {
      setTimeout(() => setShow(false), 300); // Wait for exit animation
    }
  }, [isOpen]);

  if (!show && !isOpen) return null;

  const isSuccess = type === "success";

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div
        className={`relative w-full max-w-sm bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden transform transition-all duration-300 ${
          isOpen ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
        }`}
      >
        {/* Header with gradient */}
        <div
          className={`h-32 p-6 flex flex-col items-center justify-center text-white relative overflow-hidden ${
            isSuccess
              ? "bg-linear-to-br from-green-500 to-emerald-600"
              : "bg-linear-to-br from-red-500 to-rose-600"
          }`}
        >
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12"></div>
          <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/10 rounded-full -ml-10 -mb-10"></div>

          <div className="relative z-10 flex flex-col items-center">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 bg-white/20 backdrop-blur-sm ${
                isSuccess ? "animate-bounce" : "animate-pulse"
              }`}
            >
              {isSuccess ? (
                <CheckCircle size={24} className="text-white" />
              ) : (
                <AlertCircle size={24} className="text-white" />
              )}
            </div>
            <h3 className="text-xl font-bold">{title}</h3>
          </div>

          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 text-center">
          <p className="text-gray-600 dark:text-gray-300 mb-6 font-medium leading-relaxed">
            {message}
          </p>

          <button
            onClick={onClose}
            className={`w-full py-2.5 rounded-lg font-medium text-white transition-all transform active:scale-95 ${
              isSuccess
                ? "bg-green-600 hover:bg-green-700 shadow-md shadow-green-200 dark:shadow-none"
                : "bg-red-600 hover:bg-red-700 shadow-md shadow-red-200 dark:shadow-none"
            }`}
          >
            {isSuccess ? "Great, thanks!" : "Close"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackModal;
