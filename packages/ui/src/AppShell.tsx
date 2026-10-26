import { PUBLIC_NAV_ITEMS } from '@liuzu/domain';
import { useState, type ReactNode } from 'react';
import { Link, NavLink } from 'react-router-dom';

export interface AppShellProps {
  children: ReactNode;
  footerNote?: string;
}

export function AppShell({
  children,
  footerNote = '部分内容为规划中演示，事实信息以核验来源为准。',
}: AppShellProps) {
  const [audioNotice, setAudioNotice] = useState('');

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        跳到主要内容
      </a>
      <header className="site-header">
        <div className="site-header__inner">
          <Link className="brand" to="/" aria-label="六祖云游首页">
            <strong className="brand__text">六祖云游</strong>
          </Link>
          <nav className="main-nav" aria-label="主导航">
            {PUBLIC_NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  isActive ? 'main-nav__link is-active' : 'main-nav__link'
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="header-tools">
            <button
              type="button"
              className="audio-control"
              aria-label="开启环境音"
              aria-pressed="false"
              onClick={() => setAudioNotice('环境音素材待接入，当前保持静音。')}
            >
              环境音
            </button>
            {audioNotice ? (
              <span
                className="audio-notice"
                role="status"
                aria-label="环境音状态"
              >
                {audioNotice}
              </span>
            ) : null}
          </div>
        </div>
      </header>
      <p className="demo-boundary" role="note">公开演示：离线示意地图与本机集章；景点路线待核验，不提供导航、预约或在线 AI。</p>
      <main id="main-content" className="site-main">
        {children}
      </main>
      <footer className="site-footer">
        <div className="site-footer__inner">
          <p>
            <strong>六祖云游</strong> ｜ 云浮禅文化数字文旅展示
          </p>
          <p>{footerNote}</p>
        </div>
      </footer>
    </div>
  );
}
