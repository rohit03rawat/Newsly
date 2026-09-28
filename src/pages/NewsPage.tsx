import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import NewsList from "../components/news/NewsList";
import {
  fetchLatestNews,
  fetchSavedNews,
  getAccessToken,
  saveNews,
  searchNews,
} from "../lib/api";
import type { NewsArticle } from "../lib/api";

type NewsResponse = Awaited<ReturnType<typeof fetchLatestNews>>;

const NewsPage: React.FC = () => {
  const [newsItems, setNewsItems] = useState<NewsArticle[]>([]);
  const [savedUrls, setSavedUrls] = useState<Set<string>>(new Set());
  const [view, setView] = useState<"latest" | "saved">("latest");
  const [searchInput, setSearchInput] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshCount, setRefreshCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let timeout: ReturnType<typeof setTimeout>;
    let pollAttempts = 0;
    const maxPollAttempts = 20;

    const loadNews = async () => {
      setLoading(true);
      setError("");
      try {
        if (!getAccessToken())
          throw new Error("Sign in to read and save stories.");

        if (view === "saved") {
          const savedArticles = await fetchSavedNews();
          if (cancelled) return;
          setNewsItems(savedArticles);
          setSavedUrls(new Set(savedArticles.map((article) => article.url)));
          setLoading(false);
          return;
        }

        const result: NewsResponse = activeQuery
          ? await searchNews(activeQuery)
          : await fetchLatestNews();
        if (cancelled) return;

        if (Array.isArray(result)) {
          const savedArticles = await fetchSavedNews();
          if (cancelled) return;
          setNewsItems(result);
          setSavedUrls(new Set(savedArticles.map((article) => article.url)));
          setLoading(false);
          return;
        }

        if (result.status === "processing") {
          pollAttempts += 1;
          if (pollAttempts >= maxPollAttempts) {
            setError(
              "News generation is taking too long. Check that the Celery worker is running, then refresh.",
            );
            setLoading(false);
            return;
          }
          timeout = setTimeout(loadNews, 3000);
          return;
        }

        setError(
          result.message || "The newsroom could not load stories right now.",
        );
        setLoading(false);
      } catch (loadError) {
        if (cancelled) return;
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load stories.",
        );
        setLoading(false);
      }
    };

    void loadNews();
    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [activeQuery, refreshCount, view]);

  const handleSave = async (article: NewsArticle) => {
    try {
      await saveNews(article);
      setSavedUrls((current) => new Set(current).add(article.url));
      setError("");
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Unable to save this story.",
      );
    }
  };

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setView("latest");
    setActiveQuery(searchInput.trim());
  };

  return (
    <main className="news-page">
      <header className="news-heading">
        <p className="eyebrow">The daily edition</p>
        <h1>Today&apos;s stories</h1>
        <p>A considered look at what is happening now.</p>
      </header>
      <div className="news-toolbar">
        <div className="news-tabs" role="group" aria-label="Story list">
          <button
            type="button"
            className={view === "latest" ? "active" : ""}
            onClick={() => setView("latest")}
          >
            Latest
          </button>
          <button
            type="button"
            className={view === "saved" ? "active" : ""}
            onClick={() => setView("saved")}
          >
            Saved stories
          </button>
        </div>
        <form className="news-search" onSubmit={handleSearch}>
          <input
            aria-label="Search stories"
            placeholder="Search stories"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
          />
          <button type="submit" disabled={!searchInput.trim()}>
            Search
          </button>
        </form>
      </div>
      {error && (
        <p className="news-error" role="alert">
          {error}
          {!getAccessToken() && (
            <>
              {" "}
              <Link to="/login">Sign in</Link>
            </>
          )}
        </p>
      )}
      {loading ? (
        <section className="news-empty" aria-live="polite">
          <span className="empty-mark" aria-hidden="true">
            N.
          </span>
          <h2>
            {view === "saved"
              ? "Loading your saved stories"
              : "Preparing your briefing"}
          </h2>
          <p>
            {view === "saved"
              ? "Fetching your reading list."
              : "News summaries are being prepared. This can take a moment."}
          </p>
        </section>
      ) : (
        <NewsList
          newsItems={newsItems}
          savedUrls={savedUrls}
          onSave={handleSave}
          emptyTitle={
            view === "saved" ? "No saved stories yet" : "No stories found"
          }
          emptyMessage={
            view === "saved"
              ? "Save an article and it will be collected here."
              : "Try another search or check back soon."
          }
        />
      )}
      {view === "latest" && (
        <button
          className="news-refresh"
          type="button"
          onClick={() => setRefreshCount((count) => count + 1)}
        >
          Refresh stories
        </button>
      )}
    </main>
  );
};

export default NewsPage;
