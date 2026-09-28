import React from 'react';

const SavedNews: React.FC = () => {
    const [savedNews, setSavedNews] = React.useState<any[]>([]);

    React.useEffect(() => {
        // Fetch saved news from local storage or API
        const fetchSavedNews = () => {
            const news = JSON.parse(localStorage.getItem('savedNews') || '[]');
            setSavedNews(news);
        };

        fetchSavedNews();
    }, []);

    return (
        <div>
            <h2>Saved News</h2>
            {savedNews.length === 0 ? (
                <p>No saved news items.</p>
            ) : (
                <ul>
                    {savedNews.map((newsItem, index) => (
                        <li key={index}>
                            <h3>{newsItem.title}</h3>
                            <p>{newsItem.description}</p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default SavedNews;