import PropTypes from "prop-types";

export function Button({
  className = "",
  variant = "primary",
  size = "md",
  ...props
}) {
  const variants = {
    primary:
      "bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700",
    secondary:
      "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600",
    outline:
      "border border-blue-500 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30",
  };

  const sizes = {
    sm: "px-3 py-1 text-sm",
    md: "px-4 py-2",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <button
      className={`
        rounded-md
        transition-all
        duration-300
        ease-in-out
        transform
        hover:scale-[1.02]
        focus:outline-none
        focus:ring-2
        focus:ring-offset-2
        focus:ring-blue-300
        disabled:opacity-50
        disabled:cursor-not-allowed
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
      {...props}
    />
  );
}

Button.propTypes = {
  className: PropTypes.string,
  variant: PropTypes.oneOf(["primary", "secondary", "outline"]),
  size: PropTypes.oneOf(["sm", "md", "lg"]),
};
