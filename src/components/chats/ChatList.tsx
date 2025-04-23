"use client";
import React, { useEffect, useRef } from "react";
import { api } from "@/utils/api";

interface ChatListProps {
  isOpen?: boolean;
  onToggle?: () => void;
}

export default function ChatList({
  isOpen = true,
  onToggle = () => {},
}: ChatListProps) {
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = api.chat.listRecent.useInfiniteQuery(
    {},
    {
      getNextPageParam: (lastPage) => lastPage.nextSkip,
    }
  );

  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasNextPage) {
        fetchNextPage();
      }
    });
    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }
    return () => {
      observer.disconnect();
    };
  }, [fetchNextPage, hasNextPage]);

  return (
    <div className={`p-4 ${isOpen ? "block" : "hidden"} xl:block`}>
      <button className="mb-4 xl:hidden" onClick={onToggle}>
        Close
      </button>
      {isLoading && <p>Loading chats...</p>}
      {isError && <p>Error loading chats.</p>}
      <ul className="space-y-2 overflow-auto">
        {data?.pages
          .flatMap((page) => page.chats)
          .map((chat) => (
            <li key={chat.id} className="cursor-pointer p-2 hover:bg-gray-100">
              {chat.topic}
            </li>
          ))}
      </ul>
      <div ref={loadMoreRef} className="h-2">
        {isFetchingNextPage && <p>Loading more...</p>}
        {!hasNextPage && <p>No more chats.</p>}
      </div>
    </div>
  );
}
