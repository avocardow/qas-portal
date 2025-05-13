import React from "react";

export default function NotFound() {
  return (
    <div className="h-full flex flex-col items-center justify-center p-8">
      <h1 className="text-3xl font-bold">404 - Page Not Found</h1>
      <p className="mt-2 text-gray-600">Sorry, the page you are looking for does not exist.</p>
    </div>
  );
}
