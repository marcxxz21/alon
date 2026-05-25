import Link from "next/link";
import type { Route } from "next";
import {
  ChartLineUp,
  ChartPieSlice,
  Database,
  GearSix,
  House,
  NotePencil,
  Plus,
  UserCircle,
  WaveSawtooth
} from "@/components/phosphor-icons";
import { ServiceWorkerRegister } from "@/components/service-worker-register";

const navItems = [
  { href: "/dashboard" as Route, label: "Home", icon: House },
  { href: "/tracker" as Route, label: "Tracker", icon: ChartPieSlice },
  { href: "/watchlist" as Route, label: "Watchlist", icon: NotePencil },
  { href: "/market" as Route, label: "Market", icon: ChartLineUp },
  { href: "/account" as Route, label: "Account", icon: UserCircle }
];

export function AppShell({
  children,
  title,
  eyebrow,
  action
}: {
  children: React.ReactNode;
  title: string;
  eyebrow: string;
  action?: React.ReactNode;
}) {
  return (
    <main className="tide-page app-page">
      <ServiceWorkerRegister />
      <div className="watermark watermark-top">Alon</div>
      <div className="watermark watermark-bottom">Portfolio Tide</div>
      <div className="wave-field" aria-hidden="true" />

      <section className="app-frame">
        <aside className="app-sidebar" aria-label="Alon navigation">
          <Link className="side-logo app-logo" href="/">
            <WaveSawtooth size={25} weight="bold" />
            <span>Alon</span>
          </Link>
          <nav className="app-nav">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
              <Link className="rail-link" href={item.href} key={item.href}>
                  <Icon size={18} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="app-sidebar-footer">
            <Database size={19} />
            <span>Supabase-backed portfolio</span>
          </div>
        </aside>

        <section className="app-workspace">
          <header className="app-header">
            <div>
              <p className="micro-label">{eyebrow}</p>
              <h1>{title}</h1>
            </div>
            {action ?? (
              <Link className="deck-button compact" href={"/tracker" as Route}>
                <GearSix size={17} />
                Manage Tracker
              </Link>
            )}
          </header>
          {children}
        </section>
      </section>

      <nav className="mobile-tabbar" aria-label="Mobile navigation">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link href={item.href} key={item.href}>
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <Link className="mobile-fab" href={"/tracker" as Route} aria-label="Add holding">
        <Plus size={32} />
      </Link>
    </main>
  );
}
