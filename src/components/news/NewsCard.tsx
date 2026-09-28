import React from "react";
import type { NewsArticle } from "../../lib/api";

interface NewsCardProps {
  article: NewsArticle;
  isSaved: boolean;
  onSave: () => void;
}

const NewsCard: React.FC<NewsCardProps> = ({ article, isSaved, onSave }) => {
  const publishedDate = new Date(article.published_at);

  return (
    <div className="news-card">
      <p className="news-card-meta">
        {article.source} ·{" "}
        {Number.isNaN(publishedDate.getTime())
          ? "Latest"
          : publishedDate.toLocaleDateString()}
      </p>
      <h3>{article.title}</h3>
      <p>{article.summary}</p>
      <div className="news-card-actions">
        <a href={article.url} target="_blank" rel="noreferrer">
          Read full story
        </a>
        <button type="button" onClick={onSave} disabled={isSaved}>
          {isSaved ? "Saved" : "Save story"}
        </button>
      </div>
    </div>
  );
};

export default NewsCard;
