import React from "react";

export default function PrimaryButtonGroup() {
  return (
    <div className="custom-scrollbar xsm:pb-0 max-w-full overflow-x-auto pb-3">
      <div className="min-w-[309px]">
        <div className="shadow-theme-xs inline-flex items-center">
          <button
            type="button"
            className="bg-brand-500 ring-brand-500 hover:bg-brand-500 inline-flex items-center gap-2 px-4 py-3 text-sm font-medium text-white ring-1 ring-inset transition first:rounded-l-lg last:rounded-r-lg"
          >
            Button Text
          </button>
          <button
            type="button"
            className="text-brand-500 ring-brand-500 hover:bg-brand-500 -ml-px inline-flex items-center gap-2 bg-transparent px-4 py-3 text-sm font-medium ring-1 ring-inset first:rounded-l-lg last:rounded-r-lg hover:text-white"
          >
            Button Text
          </button>
          <button
            type="button"
            className="text-brand-500 ring-brand-500 hover:bg-brand-500 -ml-px inline-flex items-center gap-2 bg-transparent px-4 py-3 text-sm font-medium ring-1 ring-inset first:rounded-l-lg last:rounded-r-lg hover:text-white"
          >
            Button Text
          </button>
        </div>
      </div>
    </div>
  );
}
