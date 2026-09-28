import React from "react";
import NewsCard from "./NewsCard";
import type { NewsArticle } from "../../lib/api";

interface NewsListProps {
  newsItems?: NewsArticle[];
  savedUrls?: Set<string>;
  emptyTitle?: string;
  emptyMessage?: string;
  onSave?: (item: NewsArticle) => void;
}

const NewsList: React.FC<NewsListProps> = ({
  newsItems = [],
  savedUrls = new Set(),
  emptyTitle = "Your briefing is on its way",
  emptyMessage = "There are no stories to show right now. Please check back soon.",
  onSave,
}) => {
  if (newsItems.length === 0) {
    return (
      <section className="news-empty" aria-live="polite">
        <span className="empty-mark" aria-hidden="true">
          N.
        </span>
        <h2>{emptyTitle}</h2>
        <p>{emptyMessage}</p>
      </section>
    );
  }

  return (
    <div className="news-list">
      {newsItems.map((item) => (
        <NewsCard
          key={item.id ?? item.url}
          article={item}
          isSaved={savedUrls.has(item.url)}
          onSave={() => onSave?.(item)}
        />
      ))}
    </div>
  );
};

export default NewsList;
