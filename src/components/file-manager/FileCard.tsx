import React from "react";

interface FileCardProps {
  icon: React.ReactNode;
  title: string;
  usage: string;
  fileCount: number;
  storageUsed: string;
  iconStyle: string;
}

const FileCard: React.FC<FileCardProps> = ({
  icon,
  title,
  usage,
  fileCount,
  storageUsed,
  iconStyle,
}) => {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-4 xl:pr-5 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex items-center gap-4">
        <div
          className={`flex size-[52px] items-center justify-center rounded-xl ${iconStyle}`}
        >
          {icon}
        </div>
        <div>
          <h4 className="mb-1 text-sm font-medium text-gray-800 dark:text-white/90">
            {title}
          </h4>
          <span className="block text-sm text-gray-500 dark:text-gray-400">
            {usage}
          </span>
        </div>
      </div>

      <div>
        <span className="mb-1 block text-right text-sm text-gray-500 dark:text-gray-400">
          {fileCount} files
        </span>
        <span className="block text-right text-sm text-gray-500 dark:text-gray-400">
          {storageUsed}
        </span>
      </div>
    </div>
  );
};

export default FileCard;
