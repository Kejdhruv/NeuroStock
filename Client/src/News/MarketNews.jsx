import React, { useEffect, useState } from "react";
import "./MarketNews.css";

const MarketNews = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_KEY = import.meta.env.VITE_3RD_POLYGON_KEY;

  useEffect(() => {
    // Note: In 2026, we fetch the most recent data
    fetch(
      `https://api.polygon.io/v2/reference/news?order=desc&limit=20&apiKey=${API_KEY}`
    )
      .then((res) => res.json())
      .then((data) => {
        setNews(data.results || []);
        setLoading(false);
      })
      .catch((err) => console.error(err));
  }, []);

  if (loading) return <div className="np-loader">Updating Market Feed...</div>;

  return (
    <div className="np-container">
      <header className="np-header">
        <span className="np-pretitle">Intelligence</span>
        <h1 className="np-title">Market <br/>Perspectives</h1>
        <p className="np-subtitle">Real-time insights from the world's leading financial desks.</p>
      </header>

      <div className="np-grid">
        {news.map((item, index) => {
          const isHero = index === 0; // Make the first item a featured hero card
          return (
            <div key={item.id} className={`np-card ${isHero ? "np-card--hero" : ""}`}>
              <div className="np-image-wrapper">
                <img
                  src={item.image_url || "https://images.unsplash.com/photo-1611974717483-9b25022ecf78?q=80&w=1000"}
                  alt=""
                  className="np-card-image"
                  loading="lazy"
                />
                <div className="np-source-badge">{item.publisher.name}</div>
              </div>

              <div className="np-card-content">
                <div className="np-meta">
                   <span className="np-date">
                    {new Date(item.published_utc).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                  <span className="np-dot">•</span>
                  <span className="np-reading-time">5 min read</span>
                </div>

                <h2 className="np-card-title">{item.title}</h2>
                
                <p className="np-card-description">
                  {item.description}
                </p>

                <div className="np-card-footer">
                  <div className="np-keywords">
                    {item.keywords?.slice(0, 2).map((kw, idx) => (
                      <span key={idx} className="np-tag">#{kw}</span>
                    ))}
                  </div>
                  <a
                    href={item.article_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="np-btn"
                  >
                    Read Article
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MarketNews;