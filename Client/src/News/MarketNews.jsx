import React, { useEffect, useState } from "react";
import "./MarketNews.css";

const MarketNews = () => {
  const [news, setNews] = useState([]);
   const API_KEY = import.meta.env.VITE_3RD_POLYGON_KEY; 
  useEffect(() => {
    fetch(
       `https://api.polygon.io/v2/reference/news?published_utc.gte=2025-12-12T00:00:00Z&order=asc&limit=20&sort=published_utc&apiKey=${API_KEY}`
    )
      .then((res) => res.json())
      .then((data) => setNews(data.results))
      .catch((err) => console.error(err));
  }, []); 
    
    console.log(news); 

  return (
    <div className="np-container">
      <h1 className="np-title">Latest Market News</h1>
      <div className="np-grid">
        {news.map((item) => (
          <div key={item.id} className="np-card">
            <img
  src={item.image_url}
  alt={item.title}
  className="np-card-image"
  crossOrigin="anonymous"
/>
            <div className="np-card-content">
              <h2 className="np-card-title">{item.title}</h2>
              <p className="np-card-description">
                {item.description.length > 150
                  ? item.description.substring(0, 150) + "..."
                  : item.description}
              </p>
              <div className="np-card-keywords">
                {item.keywords.map((kw, idx) => (
                  <span key={idx} className="np-keyword">
                    {kw}
                  </span>
                ))}
              </div>
              <div className="np-card-footer">
                <span className="np-date">
                  {new Date(item.published_utc).toLocaleDateString()}
                </span>
                <a
                  href={item.article_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="np-readmore"
                >
                  Read more
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MarketNews;