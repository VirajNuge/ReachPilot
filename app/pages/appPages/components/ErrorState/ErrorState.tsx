"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  BsExclamationTriangleFill,
  BsArrowClockwise,
  BsInfoCircleFill,
} from "react-icons/bs";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  variant?: "error" | "warning" | "info";
}

const variants = {
  error: {
    bg: "bg-red-50",
    border: "border-red-200",
    icon: "text-red-500",
    title: "text-red-800",
    text: "text-red-600",
    button: "bg-red-600 hover:bg-red-700",
  },
  warning: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    icon: "text-amber-500",
    title: "text-amber-800",
    text: "text-amber-600",
    button: "bg-amber-600 hover:bg-amber-700",
  },
  info: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    icon: "text-blue-500",
    title: "text-blue-800",
    text: "text-blue-600",
    button: "bg-blue-600 hover:bg-blue-700",
  },
};

// Full page error state
export const ErrorState: React.FC<ErrorStateProps> = ({
  title = "Analysis Failed",
  message = "We couldn't analyze this profile. Please check the URL and try again.",
  onRetry,
  variant = "error",
}) => {
  const styles = variants[variant];

  return (
    <motion.div
      className="flex flex-col items-center justify-center min-h-[400px] p-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div
        className={`${styles.bg} ${styles.border} border-2 rounded-2xl p-8 max-w-md text-center`}
      >
        <div
          className={`w-16 h-16 mx-auto mb-4 rounded-full ${styles.bg} flex items-center justify-center`}
        >
          <BsExclamationTriangleFill className={styles.icon} size={32} />
        </div>
        <h3 className={`text-xl font-bold ${styles.title} mb-2`}>{title}</h3>
        <p className={`${styles.text} text-sm mb-6`}>{message}</p>
        {onRetry && (
          <motion.button
            className={`${styles.button} text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 mx-auto transition-colors`}
            onClick={onRetry}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <BsArrowClockwise size={18} />
            Retry Analysis
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};

// Inline "No Data" placeholder for individual sections
export const NoDataPlaceholder: React.FC<{
  section: string;
  message?: string;
}> = ({ section, message }) => (
  <motion.div
    className="bg-gray-50 rounded-xl p-6 border-2 border-dashed border-gray-200 text-center"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
  >
    <BsInfoCircleFill className="text-gray-400 mx-auto mb-2" size={24} />
    <p className="text-gray-600 font-medium text-sm">{section}</p>
    <p className="text-gray-400 text-xs mt-1">
      {message || "Data not available"}
    </p>
  </motion.div>
);

// Inline error for individual components
export const ComponentError: React.FC<{
  message?: string;
  onRetry?: () => void;
}> = ({ message = "Failed to load", onRetry }) => (
  <div className="bg-red-50 rounded-lg p-4 border border-red-100">
    <div className="flex items-center gap-2 text-red-600">
      <BsExclamationTriangleFill size={14} />
      <span className="text-xs font-medium">{message}</span>
    </div>
    {onRetry && (
      <button
        onClick={onRetry}
        className="text-xs text-red-600 hover:text-red-700 font-medium mt-2 underline"
      >
        Try again
      </button>
    )}
  </div>
);

// Connection error overlay
export const ConnectionError: React.FC<{
  onRetry?: () => void;
}> = ({ onRetry }) => (
  <motion.div
    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    <motion.div
      className="bg-white rounded-2xl p-8 max-w-sm text-center shadow-xl"
      initial={{ scale: 0.9 }}
      animate={{ scale: 1 }}
    >
      <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
        <BsExclamationTriangleFill className="text-red-500" size={40} />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">Connection Lost</h3>
      <p className="text-gray-500 text-sm mb-6">
        Unable to connect to the server. Please check your internet connection.
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="bg-gray-900 text-white px-6 py-3 rounded-xl font-medium inline-flex items-center gap-2 hover:bg-gray-800 transition-colors"
        >
          <BsArrowClockwise size={18} />
          Reconnect
        </button>
      )}
    </motion.div>
  </motion.div>
);

export default ErrorState;
