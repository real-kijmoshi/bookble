import PropTypes from "prop-types";

export function Card({ children, className, ...props }) {
  return (
    <div
      className={`
        bg-white 
        dark:bg-gray-800 
        rounded-xl 
        shadow-lg 
        hover:shadow-xl 
        transition-shadow 
        duration-300 
        border 
        border-gray-100 
        dark:border-gray-700 
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className, ...props }) {
  return (
    <div
      className={`
        px-6 
        py-4 
        border-b 
        border-gray-200 
        dark:border-gray-700 
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardContent({ children, className, ...props }) {
  return (
    <div
      className={`
        p-6 
        dark:text-gray-300 
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({ children, className, ...props }) {
  return (
    <h2
      className={`
        text-xl 
        font-bold 
        text-gray-800 
        dark:text-white 
        ${className}
      `}
      {...props}
    >
      {children}
    </h2>
  );
}

Card.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
};

CardHeader.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
};

CardContent.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
};

CardTitle.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
};
