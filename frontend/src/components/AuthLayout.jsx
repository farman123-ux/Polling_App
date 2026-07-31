import React from "react";
import { Outlet } from "react-router-dom";
import { authLayoutStyles as s } from "../assets/dummyStyles";

export default function AuthLayout() {
  return (
    <div className={s.container}>
      {/* Left Panel */}
      <div className={s.leftPanel}>
        <div className={s.glowTop} />
        <div className={s.glowBottom} />
        <div className="absolute inset-0 opacity-15" style={s.gridPatternStyle} />

        <div className={s.logoContainer}>
          <img src="/favicon.svg" alt="logo" className={s.logoImg} />
          <span className={s.logoText}>pollify</span>
        </div>

        <div className={s.mainCopyContainer}>
          <div className={s.mainCopyInner}>
            <div className={s.liveBadge}>
              <span className={s.dot} />
              <span>Real-time Community Voting</span>
            </div>
            <h1 className={s.heading}>
              Voice Your <span className={s.emeraldText}>Opinion.</span> Shape the Future.
            </h1>
            <p className={s.description}>
              Create polls, share rating scales, compare image choices, and gather insights from a global network of voters.
            </p>
          </div>

          <div className={s.statsGrid}>
            <div className={s.statCard}>
              <div className={s.statValue}>5 Poll</div>
              <div className={s.statLabel}>Interactive Types</div>
            </div>
            <div className={s.statCard}>
              <div className={s.statValue}>100%</div>
              <div className={s.statLabel}>Instant Results</div>
            </div>
            <div className={s.statCard}>
              <div className={s.statValue}>Realtime</div>
              <div className={s.statLabel}>Community Feed</div>
            </div>
          </div>
        </div>

        <div className={s.footer}>
          &copy; {new Date().getFullYear()} Pollify Inc. All rights reserved.
        </div>
      </div>

      {/* Right Panel */}
      <div className={s.rightPanel}>
        <div className={s.formContainer}>
          {/* Mobile Logo Header */}
          <div className={s.mobileLogoContainer}>
            <img src="/favicon.svg" alt="logo" className={s.mobileLogoImg} />
            <span className={s.mobileLogoText}>pollify</span>
          </div>

          <Outlet />
        </div>
      </div>
    </div>
  );
}
