import React from "react";
import { Link } from "react-router-dom";

const LandingPage: React.FC = () => {
  return (
    <main className="landing-page">
      <section className="landing-hero">
        <div className="landing-copy">
          <p className="eyebrow">Independent reading starts here</p>
          <h1>The news, with a clearer point of view.</h1>
          <p className="landing-description">
            A calmer place to catch up on the stories shaping today.
          </p>
          <div className="landing-buttons">
            <Link to="/news" className="button button-primary">
              Explore the latest
            </Link>
            <Link to="/signup" className="button button-secondary">
              Create an account
            </Link>
          </div>
        </div>
        <p className="hero-caption">
          A thoughtful start to your daily briefing
        </p>
      </section>
      <section className="landing-note" aria-label="About the publication">
        <span className="note-mark">N.</span>
        <p>Less noise. More context. Stories worth your attention.</p>
        <Link to="/news">
          Read today&apos;s briefing <span aria-hidden="true">→</span>
        </Link>
      </section>
    </main>
  );
};

export default LandingPage;
