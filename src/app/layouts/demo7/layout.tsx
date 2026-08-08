import { useState, useEffect } from 'react';
import { Download, Loader2, Search, Bell, Building, Moon, Sun, ShoppingCart } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useIntl } from 'react-intl';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { MENU_SIDEBAR } from '@/app/config/menu.config';
import { useMenu } from '@/app/hooks/use-menu';
import { useFapData, useFapDataSelector } from '@/app/providers/fap-data-provider';
import { useSettings } from '@/app/providers/settings-provider';
import { Button } from '@/app/components/ui/button';
import { ErrorBoundary } from '@/app/errors/error-boundary';
import { useDashboard } from '@/app/pages/dashboard/use-dashboard';
import { Sidebar } from './components/sidebar';
import { UserDropdownMenu } from '@/app/partials/topbar/user-dropdown-menu';
import { useTheme } from 'next-themes';

const Demo7Layout = () => {
  const { setOption } = useSettings();
  const { pathname } = useLocation();
  const { getCurrentItem } = useMenu(pathname);
  const item = getCurrentItem(MENU_SIDEBAR);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setOption('layout', 'demo7');
  }, [setOption]);

  const { EOSClientDownloadLink } = useDashboard();
  const { shouldShowFallback } = useFapData();
  const dataSelector = useFapDataSelector({
    campusName: '#ctl00_lblCampusName',
    rollNumber: '#ctl00_lblLogIn',
    fullName: '#ctl00_lblLogIn',
  });

  const rollNumberMatch = dataSelector.rollNumber?.match(/([A-Z]{2,}\d{5,})/i);
  const rollNumber = rollNumberMatch ? rollNumberMatch[1] : '';
  const fullName = dataSelector.fullName?.replace(/\([^)]*\)/g, '').trim() || 'F';
  const intl = useIntl();

  return (
    <>
      <Helmet>
        <title>
          {intl.formatMessage({ id: item?.title || 'COMMON.TITLE', defaultMessage: 'FAP - Academic Portal' })}
        </title>
      </Helmet>

      <div className="min-h-screen w-full min-w-full bg-slate-50 dark:bg-slate-950 flex text-slate-900 dark:text-slate-100 font-sans antialiased overflow-x-hidden">
        {/* 📌 Persistent Left Sidebar */}
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        {/* 💻 Main Layout Container (Offset by Sidebar Width - Guaranteed 100% Full Width) */}
        <div
          className={`flex-1 w-full min-w-0 flex flex-col transition-all duration-300 ${
            sidebarCollapsed ? 'ml-18' : 'ml-64'
          }`}
        >
          {/* 🔝 Sticky SaaS Top Bar */}
          <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-6 flex items-center justify-between gap-4 w-full">
            {/* Global Search Input */}
            <div className="flex-1 max-w-md relative hidden md:block">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <input
                type="text"
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                placeholder="Tìm kiếm môn học, lịch thi, điểm danh... (Ctrl + K)"
                className="w-full pl-10 pr-12 py-2 text-sm bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 rounded-xl border-0 focus:ring-2 focus:ring-blue-500/30 transition-all"
              />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold px-1.5 py-0.5 rounded bg-white dark:bg-slate-700 text-slate-400 border border-slate-200 dark:border-slate-600 shadow-2xs">
                ⌘K
              </kbd>
            </div>

            {/* Top Right Bar Controls */}
            <div className="flex items-center gap-3 ml-auto">
              {/* Campus Badge */}
              {dataSelector.campusName && (
                <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold border border-slate-200 dark:border-slate-700">
                  <Building className="size-3.5 text-blue-600 dark:text-blue-400" />
                  <span>{dataSelector.campusName.replace('CAMPUS: ', '')}</span>
                </div>
              )}

              {/* ShoppingCart Tuition Link */}
              <Link
                to="/FrontOffice/SubjectFees.aspx"
                className="relative size-9 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors"
                title="Học phí & Giỏ thanh toán"
              >
                <ShoppingCart className="size-4.5" />
              </Link>

              {/* Download EOS Client Button */}
              {pathname.includes('/Student.aspx') && EOSClientDownloadLink && (
                <Button size="sm" variant="outline" asChild className="hidden sm:inline-flex rounded-xl gap-1.5 text-xs font-semibold">
                  <a href={EOSClientDownloadLink} target="_blank" rel="noreferrer">
                    <Download className="size-3.5 text-blue-600" />
                    <span>EOS Client</span>
                  </a>
                </Button>
              )}

              {/* Notification Bell with Counter */}
              <Link
                to="/App/AcadAppView.aspx"
                className="relative size-9 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors"
                title="Thông báo mới"
              >
                <Bell className="size-4.5" />
                <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-blue-600 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
              </Link>

              {/* Dark / Light Mode Toggle Button */}
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="size-9 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors"
                title="Chuyển chế độ giao diện"
              >
                {theme === 'dark' ? <Sun className="size-4.5 text-amber-400" /> : <Moon className="size-4.5" />}
              </button>

              <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1 hidden sm:block" />

              {/* Student Profile User Dropdown */}
              <UserDropdownMenu
                trigger={
                  <div className="cursor-pointer size-9 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-400 font-bold flex items-center justify-center overflow-hidden border border-blue-200 dark:border-blue-800 hover:ring-2 hover:ring-blue-500/30 transition-all">
                    {rollNumber ? (
                      <img
                        src={`https://fap.fpt.edu.vn/user/image.aspx?id=${rollNumber}`}
                        alt="Avatar"
                        className="size-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <span>{fullName.charAt(0) || 'F'}</span>
                    )}
                  </div>
                }
              />
            </div>
          </header>

          {/* 📄 Main Content Canvas Area (Guaranteed 100% Full Width) */}
          <main className="flex-1 px-6 py-6 w-full min-w-full block" role="content">
            <ErrorBoundary>
              {shouldShowFallback ? (
                <div className="flex flex-col items-center justify-center h-64 gap-3">
                  <Loader2 className="size-8 text-blue-600 animate-spin" />
                  <p className="text-sm font-medium text-slate-500">Đang tải dữ liệu FAP...</p>
                </div>
              ) : (
                <Outlet />
              )}
            </ErrorBoundary>
          </main>
        </div>
      </div>
    </>
  );
};

export { Demo7Layout };
