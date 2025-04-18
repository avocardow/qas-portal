import React from "react";

export default function PopoverWithLink() {
  return (
    <div className="custom-scrollbar max-w-full overflow-auto sm:overflow-visible">
      <div className="min-w-[750px]">
        <div className="flex flex-col flex-wrap items-center gap-4 sm:flex-row sm:gap-5">
          <div>
            <button className="bg-brand-500 shadow-theme-xs hover:bg-brand-600 inline-flex rounded-lg px-4 py-3 text-sm font-medium text-white">
              Popover on Bottom
            </button>
          </div>{" "}
          <div>
            <button className="bg-brand-500 shadow-theme-xs hover:bg-brand-600 inline-flex rounded-lg px-4 py-3 text-sm font-medium text-white">
              Popover on Right
            </button>
          </div>{" "}
          <div>
            <button className="bg-brand-500 shadow-theme-xs hover:bg-brand-600 inline-flex rounded-lg px-4 py-3 text-sm font-medium text-white">
              Popover on Left
            </button>
          </div>{" "}
          <div>
            <button className="bg-brand-500 shadow-theme-xs hover:bg-brand-600 inline-flex rounded-lg px-4 py-3 text-sm font-medium text-white">
              Popover on Top
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
