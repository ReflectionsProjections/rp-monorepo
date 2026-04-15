import { BrowserRouter, Route, Routes } from "react-router-dom";
import AuthCallback from "./routes/auth/AuthCallback";
import AuthRefresh from "./routes/auth/AuthRefresh";
import AdminApp from "./sections/admin/App";
import DashboardApp from "./sections/dashboard/App";
import HypeApp from "./sections/hype/App";
import InfoApp from "./sections/info/App";
import SiteApp from "./sections/home/App";
import SponsorApp from "./sections/sponsor/App";
import Unauthorized from "@components/auth/Unauthorized";

export default function Root() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth/refresh" element={<AuthRefresh />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/admin/*" element={<AdminApp />} />
        <Route path="/info/*" element={<InfoApp />} />
        <Route path="/sponsor/*" element={<SponsorApp />} />
        <Route path="/dashboard/*" element={<DashboardApp />} />
        <Route path="/hype/*" element={<HypeApp />} />
        <Route path="/*" element={<SiteApp />} />
      </Routes>
    </BrowserRouter>
  );
}
