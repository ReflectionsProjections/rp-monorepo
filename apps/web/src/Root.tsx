import { lazy, Suspense } from "react";

const AdminApp = lazy(() => import("./admin/App"));
const SiteApp = lazy(() => import("./site/App"));
const DashboardApp = lazy(() => import("./dashboard/App"));
const InfoApp = lazy(() => import("./info/App"));
const SponsorApp = lazy(() => import("./sponsor/App"));
const HypeApp = lazy(() => import("./hype/App"));

const HOSTNAME_MAP: Record<string, string> = {
  "admin.reflectionsprojections.org": "admin",
  "reflectionsprojections.org": "site",
  "www.reflectionsprojections.org": "site",
  "dash.reflectionsprojections.org": "dashboard",
  "info.reflectionsprojections.org": "info",
  "sponsor.reflectionsprojections.org": "sponsor",
  "hype.reflectionsprojections.org": "hype"
};

function resolveApp(): string | null {
  const hostname = window.location.hostname;
  if (hostname in HOSTNAME_MAP) return HOSTNAME_MAP[hostname];
  return new URLSearchParams(window.location.search).get("app");
}

function Picker() {
  const apps = ["admin", "site", "dashboard", "info", "sponsor", "hype"];
  return (
    <div style={{ fontFamily: "sans-serif", padding: "2rem" }}>
      <h1>R|P Dev — Select App</h1>
      <ul style={{ marginTop: "1rem", lineHeight: "2" }}>
        {apps.map((a) => (
          <li key={a}>
            <a href={`/?app=${a}`}>{a}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Root() {
  const app = resolveApp();
  if (!app) return <Picker />;
  return (
    <Suspense fallback={null}>
      {app === "admin" && <AdminApp />}
      {app === "site" && <SiteApp />}
      {app === "dashboard" && <DashboardApp />}
      {app === "info" && <InfoApp />}
      {app === "sponsor" && <SponsorApp />}
      {app === "hype" && <HypeApp />}
    </Suspense>
  );
}
