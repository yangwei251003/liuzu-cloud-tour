import { AppShell } from '@liuzu/ui';
import { MotionConfig } from 'motion/react';
import { Link, Route, Routes } from 'react-router-dom';

import { AboutPage } from './public/AboutPage';
import { MapPage } from './interactive/MapPage';
import { CertificatePage, StampsPage } from './interactive/StampPages';
import { ViewerPage } from './interactive/ViewerPage';
import { AchievementDetailPage, AchievementsPage } from './public/AchievementPages';
import { HomePage } from './public/HomePage';
import { NotFoundState } from './public/PageElements';
import { RouteDetailPage, RoutesPage } from './public/RoutePages';
import { SpotDetailPage, SpotsPage } from './public/SpotsPages';
import { FloatingAssistant } from './assistant/FloatingAssistant';
import './public/public.css';
import './interactive/interactive.css';
import './assistant/assistant.css';

function PublicNotFoundPage() {
  return (
    <NotFoundState
      title="页面未找到"
      description="当前链接不存在，您可以返回首页继续浏览。"
      to="/"
      linkLabel="返回首页"
    />
  );
}

export function App() {
  return (
    <MotionConfig reducedMotion="user">
      <AppShell>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/spots" element={<SpotsPage />} />
          <Route path="/spots/:spotId" element={<SpotDetailPage />} />
          <Route path="/spots/:spotId/3d" element={<ViewerPage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/stamps" element={<StampsPage />} />
          <Route path="/stamps/certificate" element={<CertificatePage />} />
          <Route path="/routes" element={<RoutesPage />} />
          <Route path="/routes/:routeId" element={<RouteDetailPage />} />
          <Route path="/achievements" element={<AchievementsPage />} />
          <Route path="/achievements/:type" element={<AchievementDetailPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="*" element={<PublicNotFoundPage />} />
        </Routes>
        <FloatingAssistant />
      </AppShell>
    </MotionConfig>
  );
}

export function PublicRouteLink({ to, label }: { to: string; label: string }) {
  return <Link to={to}>{label}</Link>;
}
