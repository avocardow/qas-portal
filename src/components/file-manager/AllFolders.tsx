import React, { useState } from "react";
import FolderCard from "./FolderCard";
import { api } from "@/utils/api";

export default function AllFolders() {
  const [path, setPath] = useState<{ id: string; name: string }[]>([]);

  const currentFolderId = path[path.length - 1]?.id;

  const {
    data: rootFolders,
    isLoading: isRootLoading,
    isError: isRootError,
  } = api.sharepoint.listClientFolders.useQuery(undefined, {
    enabled: !currentFolderId,
    refetchOnWindowFocus: false,
  });

  const {
    data: contents,
    isLoading: isContentsLoading,
    isError: isContentsError,
  } = api.sharepoint.getFolderContents.useQuery(
    { folderId: currentFolderId ?? "" },
    {
      enabled: !!currentFolderId,
      refetchOnWindowFocus: false,
    }
  );

  const handleFolderClick = (folder: { id: string; name: string }) => {
    setPath((prev) => [...prev, folder]);
  };

  const handleBreadcrumbClick = (index: number) => {
    setPath((prev) => prev.slice(0, index + 1));
  };

  // Normalize folder list: rootFolders or only folder items from contents
  const folders = currentFolderId
    ? (contents ?? []).filter((item) => item.isFolder).map((item) => ({ id: item.id, name: item.name }))
    : rootFolders ?? [];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="p-4 sm:pl-6 sm:pr-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            {path.length ? path[path.length - 1].name : "All Folders"}
          </h3>
          {path.length > 0 && (
            <nav className="flex space-x-2 text-sm">
              <button onClick={() => setPath([])} className="text-brand-500 hover:underline">
                All Folders
              </button>
              {path.map((p, idx) => (
                <React.Fragment key={p.id}>
                  <span>/</span>
                  <button onClick={() => handleBreadcrumbClick(idx)} className="text-brand-500 hover:underline">
                    {p.name}
                  </button>
                </React.Fragment>
              ))}
            </nav>
          )}
        </div>
      </div>
      <div className="border-t border-gray-100 p-5 sm:p-6 dark:border-gray-800">
        {isRootLoading || isContentsLoading ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">Loading folders...</div>
        ) : isRootError || isContentsError ? (
          <div className="p-4 text-center text-red-500">Failed to load folders.</div>
        ) : folders.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6">
            {folders.map((folder) => (
              <button key={folder.id} onClick={() => handleFolderClick(folder)}>
                <FolderCard title={folder.name} fileCount="" size="" />
              </button>
            ))}
          </div>
        ) : (
          <div className="p-4 text-gray-500 dark:text-gray-400">No folders found.</div>
        )}
      </div>
    </div>
  );
}
