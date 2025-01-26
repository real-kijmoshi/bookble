import { useState, useEffect } from "react";
import { User, Mail, Lock, ArrowRight } from "lucide-react";
import PropTypes from "prop-types";

export function Input({
  className = "",
  label,
  error,
  icon: Icon,
  rightIcon: RightIcon,
  onRightIconClick,
  type,
  value,
  ...props
}) {
  const [inputType, setInputType] = useState("");
  const [identificationLabel, setIdentificationLabel] = useState("");

  useEffect(() => {
    if (type === "text") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (emailRegex.test(value)) {
        setInputType("email");
        setIdentificationLabel("Email");
      } else if (value.length >= 3) {
        setInputType("username");
        setIdentificationLabel("Username");
      } else {
        setInputType("");
        setIdentificationLabel("");
      }
    }
  }, [value, type]);

  const getIcon = () => {
    if (type === "text") {
      return inputType === "email" ? Mail : User;
    }
    return Icon || Lock;
  };

  const DynamicIcon = getIcon();

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </label>
        )}
        {identificationLabel && (
          <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
            <ArrowRight className="h-4 w-4 mr-1" />
            {identificationLabel}
          </span>
        )}
      </div>
      <div className="relative">
        {DynamicIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <DynamicIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
          </div>
        )}
        <input
          className={`
            w-full
            ${DynamicIcon ? "pl-10" : "pl-3"}
            ${RightIcon ? "pr-10" : "pr-3"}
            py-2
            border
            rounded-md
            bg-white
            dark:bg-gray-800
            dark:text-white
            dark:border-gray-600
            focus:outline-none
            focus:ring-2
            focus:ring-blue-500
            transition-all
            duration-200
            ${
              error
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 dark:border-gray-600"
            }
            ${className}
          `}
          {...props}
          type={type}
          value={value}
        />
        {RightIcon && (
          <button
            type="button"
            onClick={onRightIconClick}
            className="absolute inset-y-0 right-0 pr-3 flex items-center focus:outline-none"
            aria-label="Toggle visibility"
          >
            <RightIcon className="h-5 w-5 text-gray-400 dark:text-gray-500 hover:text-gray-600" />
          </button>
        )}
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-500 animate-pulse">{error}</p>
      )}
    </div>
  );
}

Input.propTypes = {
  className: PropTypes.string,
  label: PropTypes.string,
  error: PropTypes.string,
  icon: PropTypes.elementType,
  rightIcon: PropTypes.elementType,
  onRightIconClick: PropTypes.func,
  type: PropTypes.string,
  value: PropTypes.string,
};
