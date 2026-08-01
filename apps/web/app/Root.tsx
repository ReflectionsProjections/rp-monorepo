import { Suspense, lazy, type ReactNode } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ChakraProvider } from "@chakra-ui/react";
import { customTheme } from "@app/theme";
import Fallback from "./Fallback";
import AuthCallback from "./routes/auth/AuthCallback";
import AuthRefresh from "./routes/auth/AuthRefresh";
import SiteApp from "./sections/home/App";
import Unauthorized from "@components/auth/Unauthorized";

const AdminApp = lazy(() => import("./sections/admin/App"));
const DashboardApp = lazy(() => import("./sections/dashboard/App"));
const HypeApp = lazy(() => import("./sections/hype/App"));
const InfoApp = lazy(() => import("./sections/info/App"));
const SponsorApp = lazy(() => import("./sections/sponsor/App"));
const ArchivedApp = lazy(() => import("./sections/2025/App"));
const RegisterPage = lazy(
  () => import("./sections/home/routes/RegisterPage")
);

function LazySection({ children }: { children: ReactNode }) {
  return <Suspense fallback={<Fallback />}>{children}</Suspense>;
}

export default function Root() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth/refresh" element={<AuthRefresh />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route
          path="/admin/*"
          element={
            <LazySection>
              <AdminApp />
            </LazySection>
          }
        />
        <Route
          path="/info/*"
          element={
            <LazySection>
              <InfoApp />
            </LazySection>
          }
        />
        <Route
          path="/sponsor/*"
          element={
            <LazySection>
              <SponsorApp />
            </LazySection>
          }
        />
        <Route
          path="/dashboard/*"
          element={
            <LazySection>
              <DashboardApp />
            </LazySection>
          }
        />
        <Route
          path="/hype/*"
          element={
            <LazySection>
              <HypeApp />
            </LazySection>
          }
        />
        <Route
          path="/2025/*"
          element={
            <LazySection>
              <ArchivedApp />
            </LazySection>
          }
        />
        <Route
          path="/register"
          element={
            <ChakraProvider theme={customTheme}>
              <LazySection>
                <RegisterPage />
              </LazySection>
            </ChakraProvider>
          }
        />
        <Route path="/*" element={<SiteApp />} />
      </Routes>
    </BrowserRouter>
  );
}
