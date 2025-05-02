import React from "react";

interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  desc?: string;
  actions?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({
  title = "",
  children,
  className = "",
  desc = "",
  actions,
}) => {
  return (
    <div
      className={`rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] shadow-sm ${className}`}
    >
      {(title || actions) && (
        <div className="flex items-center justify-between px-6 py-5">
          <div>
            {title && (
              <h3 className="text-base font-medium text-gray-800 dark:text-white/90">{title}</h3>
            )}
            {desc && (
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{desc}</p>
            )}
          </div>
          {actions && <div>{actions}</div>}
        </div>
      )}

      <div className="border-t border-gray-100 p-4 sm:p-6 dark:border-gray-800">
        <div className="space-y-6">{children}</div>
      </div>
    </div>
  );
};

export default Card; 