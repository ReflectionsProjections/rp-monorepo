import { Suspense, lazy, type ReactNode } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Fallback from './Fallback';
import SiteApp from './sections/home/App';
import Unauthorized from '@components/auth/Unauthorized';

const AdminApp = lazy(() => import('./sections/admin/App'));
const DashboardApp = lazy(() => import('./sections/dashboard/App'));
const HypeApp = lazy(() => import('./sections/hype/App'));
const InfoApp = lazy(() => import('./sections/info/App'));
const SponsorApp = lazy(() => import('./sections/sponsor/App'));
const ArchivedApp = lazy(() => import('./sections/2025/App'));

function LazySection({ children }: { children: ReactNode }) {
    return <Suspense fallback={<Fallback />}>{children}</Suspense>;
}

export default function Root() {
    return (
        <BrowserRouter>
            <Routes>
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
                <Route path="/*" element={<SiteApp />} />
            </Routes>
        </BrowserRouter>
    );
}
