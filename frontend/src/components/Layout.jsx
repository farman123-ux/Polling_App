import React, { useState, useRef } from "react";
import { NavLink, Outlet, useNavigate, useSearchParams } from "react-router-dom";
import {
  Bookmark,
  CheckCircle2,
  LayoutGrid,
  PenLine,
  PlusSquare,
  Search,
  LogOut,
  Settings,
  User,
  X,
} from "lucide-react";
import { useAuth } from "../Context/AuthContext";
import useClickOutside from "../hooks/UseClickOutside";
import NotificationDropdown from "./NotificationDropdown";
import { ProfileCard, TrendingWidget } from "./RightRailWidgets";
import { layoutStyles as s, uiElementStyles as ui } from "../assets/dummyStyles";

const NAV = [
  { to: "/dashboard", label: "Dashboard", Icon: LayoutGrid },
  { to: "/create-poll", label: "Create", Icon: PlusSquare },
  { to: "/my-polls", label: "My Polls", Icon: PenLine },
  { to: "/voted-polls", label: "Voted", Icon: CheckCircle2 },
  { to: "/bookmarked-polls", label: "Saved", Icon: Bookmark },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [userOpen, setUserOpen] = useState(false);
  const [mobileSearch, setMobileSearch] = useState(false);

  const q = searchParams.get("q") || "";
  const userRef = useRef(null);

  useClickOutside(userRef, () => setUserOpen(false), userOpen);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    if (val) {
      setSearchParams({ q: val });
    } else {
      setSearchParams({});
    }
  };

  return (
    <div className={s.container}>
      {/* Header */}
      <header className={s.header}>
        <div className={s.headerInner}>
          <NavLink to="/dashboard" className={s.logoLink}>
            <img src="/favicon.svg" alt="logo" className={s.logoImg} />
            <span className={s.logoSpan}>pollify</span>
          </NavLink>

          {/* Desktop Search */}
          <div className={s.searchDesktop}>
            <Search size={14} className={s.searchIcon} />
            <input
              type="text"
              placeholder="Search polls..."
              value={q}
              onChange={handleSearchChange}
              className={s.searchInput}
            />
          </div>

          {/* Right Cluster */}
          <div className={s.rightCluster}>
            <button
              onClick={() => setMobileSearch(!mobileSearch)}
              className={s.mobileSearchToggle}
              title="Search"
            >
              {mobileSearch ? <X size={18} /> : <Search size={18} />}
            </button>

            <NavLink to="/create-poll" className={s.createButton}>
              <PlusSquare size={16} />
              <span>Create Poll</span>
            </NavLink>

            <NotificationDropdown />

            {/* User Dropdown Avatar */}
            <div className={s.avatarWrapper} ref={userRef}>
              <button
                onClick={() => setUserOpen(!userOpen)}
                className="cursor-pointer block rounded-full focus:outline-none"
              >
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className={`${s.avatarClass} ${ui.avatarImg}`}
                  />
                ) : (
                  <div className={`${s.avatarClass} ${ui.avatarPlaceholder}`}>
                    {user?.name ? user.name[0].toUpperCase() : "U"}
                  </div>
                )}
              </button>

              {userOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl z-50 py-1.5 space-y-0.5">
                  <div className="px-3.5 py-2 border-b border-zinc-800">
                    <p className="text-xs font-semibold text-zinc-200 truncate">
                      {user?.name}
                    </p>
                    <p className="text-[11px] text-zinc-500 truncate">
                      @{user?.username}
                    </p>
                  </div>

                  <NavLink
                    to={`/u/${user?.username}`}
                    onClick={() => setUserOpen(false)}
                    className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                  >
                    <User size={14} />
                    Profile
                  </NavLink>

                  <NavLink
                    to="/settings"
                    onClick={() => setUserOpen(false)}
                    className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                  >
                    <Settings size={14} />
                    Settings
                  </NavLink>

                  <button
                    onClick={() => {
                      setUserOpen(false);
                      logout();
                      navigate("/login");
                    }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                  >
                    <LogOut size={14} />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Search Expanded */}
        {mobileSearch && (
          <div className={s.mobileSearchContainer}>
            <div className={s.mobileSearchInner}>
              <Search size={14} className={s.searchIcon} />
              <input
                type="text"
                placeholder="Search polls..."
                value={q}
                onChange={handleSearchChange}
                className={s.mobileSearchInput}
                autoFocus
              />
            </div>
          </div>
        )}
      </header>

      {/* Main Body */}
      <div className={s.bodyContainer}>
        {/* Left Sidebar */}
        <aside className={s.leftSidebar}>
          <div className={s.menuLabel}>Navigation</div>
          <nav className={s.navContainer}>
            {NAV.map(({ to, label, Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `${s.sideLinkBase} ${
                    isActive ? s.sideLinkActive : s.sideLinkInactive
                  }`
                }
              >
                <Icon size={18} />
                <span>{label}</span>
              </NavLink>
            ))}
            <NavLink
              to="/settings"
              className={({ isActive }) =>
                `${s.sideLinkBase} ${
                  isActive ? s.sideLinkActive : s.sideLinkInactive
                }`
              }
            >
              <Settings size={18} />
              <span>Settings</span>
            </NavLink>
          </nav>

          <div className={s.sidebarBottom}>
            <button
              onClick={() => {
                logout();
                navigate("/login");
              }}
              className={s.logoutButton}
            >
              <LogOut size={18} />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className={s.mainContent}>
          <Outlet />
        </main>

        {/* Right Rail */}
        <aside className={s.rightRail}>
          <ProfileCard />
          <TrendingWidget />
        </aside>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className={s.bottomNav}>
        {NAV.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `${s.bottomLinkBase} ${
                isActive ? s.bottomLinkActive : s.bottomLinkInactive
              }`
            }
          >
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
