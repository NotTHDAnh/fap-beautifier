import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  BookOpen,
  GraduationCap,
  FileCheck,
  Clock,
  ShoppingCart,
  UserCheck,
  Bell,
  User,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useFapDataSelector } from '@/app/providers/fap-data-provider';

export interface SidebarItem {
  title: string;
  subtitle?: string;
  path: string;
  icon: React.ElementType;
  badge?: string;
}

export const sidebarNavigationGroups: { heading: string; items: SidebarItem[] }[] = [
  {
    heading: 'MAIN',
    items: [
      { title: 'Dashboard', subtitle: 'Tổng quan học tập', path: '/Student.aspx', icon: LayoutDashboard },
      { title: 'Schedule', subtitle: 'Thời khóa biểu tuần', path: '/Report/ScheduleOfWeek.aspx', icon: Calendar, badge: 'Today' },
      { title: 'Courses', subtitle: 'Lịch học toàn trường', path: '/Course/Courses.aspx', icon: BookOpen },
    ],
  },
  {
    heading: 'ACADEMIC',
    items: [
      { title: 'Grades', subtitle: 'Bảng điểm môn học', path: '/Grade/StudentGrade.aspx', icon: GraduationCap },
      { title: 'Attendance', subtitle: 'Báo cáo điểm danh', path: '/Report/ViewAttendstudent.aspx', icon: FileCheck },
      { title: 'Exams', subtitle: 'Lịch thi kỳ này', path: '/Exam/ScheduleExams.aspx', icon: Clock },
    ],
  },
  {
    heading: 'SERVICES',
    items: [
      { title: 'Tuition & Cart', subtitle: 'Học phí & giao dịch', path: '/FrontOffice/SubjectFees.aspx', icon: ShoppingCart },
      { title: 'Registration', subtitle: 'Đăng ký môn & lớp', path: '/FrontOffice/RegisterCourse.aspx?code=R5', icon: UserCheck },
      { title: 'Notifications', subtitle: 'Thông báo & Đơn từ', path: '/App/AcadAppView.aspx', icon: Bell, badge: 'New' },
    ],
  },
  {
    heading: 'ACCOUNT',
    items: [
      { title: 'Profile', subtitle: 'Hồ sơ sinh viên', path: '/User/Profile.aspx', icon: User },
      { title: 'Settings', subtitle: 'Cập nhật thông tin', path: '/User/verProfile.aspx', icon: Settings },
    ],
  },
];

interface SidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed = false, onToggleCollapse }) => {
  const { pathname } = useLocation();
  const { theme, setTheme } = useTheme();
  
  const studentData = useFapDataSelector({
    fullName: '#ctl00_lblLogIn',
    rollNumber: '#ctl00_lblLogIn',
  });

  const rollNumberMatch = studentData.rollNumber?.match(/([A-Z]{2,}\d{5,})/i);
  const rollNumber = rollNumberMatch ? rollNumberMatch[1] : '';
  const fullName = studentData.fullName?.replace(/\([^)]*\)/g, '').trim() || 'Sinh viên FPT';

  const isCurrentPath = (path: string) => {
    if (path === '/Student.aspx' && (pathname === '/' || pathname === '/Student.aspx')) return true;
    return pathname.toLowerCase() === path.toLowerCase();
  };

  return (
    <aside
      className={`fixed top-0 left-0 bottom-0 z-40 flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 ease-in-out ${
        collapsed ? 'w-18' : 'w-64'
      }`}
    >
      {/* 🚀 Sidebar Header & Branding */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200/80 dark:border-slate-800/80 shrink-0">
        <Link to="/Student.aspx" className="flex items-center gap-3 overflow-hidden">
          <div className="size-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black shadow-md shadow-blue-500/20 shrink-0">
            FAP
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="font-extrabold text-sm text-slate-900 dark:text-white tracking-tight leading-none truncate">
                FPT University
              </span>
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1 truncate">
                Academic Portal
              </span>
            </div>
          )}
        </Link>

        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="size-7 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 flex items-center justify-center transition-colors shrink-0"
            title={collapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'}
          >
            {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
          </button>
        )}
      </div>

      {/* 📋 Sidebar Navigation Scroll Region */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6 custom-scrollbar">
        {sidebarNavigationGroups.map((group, groupIdx) => (
          <div key={group.heading + groupIdx} className="space-y-1">
            {!collapsed && (
              <div className="px-3 text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase mb-2">
                {group.heading}
              </div>
            )}

            {group.items.map((item) => {
              const Icon = item.icon;
              const active = isCurrentPath(item.path);

              return (
                <Link
                  key={item.title + item.path}
                  to={item.path}
                  title={collapsed ? `${item.title} - ${item.subtitle}` : undefined}
                  className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                    active
                      ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-semibold shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {/* Left Active Accent Indicator */}
                  {active && (
                    <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-blue-600 dark:bg-blue-400" />
                  )}

                  <Icon
                    className={`size-5 shrink-0 transition-transform group-hover:scale-105 ${
                      active ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300'
                    }`}
                  />

                  {!collapsed && (
                    <div className="flex-1 min-w-0 flex items-center justify-between">
                      <span className="truncate">{item.title}</span>
                      {item.badge && (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            active
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* 👤 Bottom Student Profile Widget */}
      <div className="p-3 border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40 shrink-0">
        <div className="flex items-center justify-between">
          <Link
            to="/User/Profile.aspx"
            className="flex items-center gap-3 overflow-hidden group flex-1 min-w-0 pr-2"
          >
            <div className="size-9 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 font-bold flex items-center justify-center overflow-hidden border border-blue-200 dark:border-blue-800 shrink-0">
              {rollNumber ? (
                <img
                  src={`https://fap.fpt.edu.vn/user/image.aspx?id=${rollNumber}`}
                  alt="Student Avatar"
                  className="size-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                <User className="size-5" />
              )}
            </div>

            {!collapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-blue-600 transition-colors">
                  {fullName}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {rollNumber || 'Student Portal'}
                </span>
              </div>
            )}
          </Link>

          {!collapsed && (
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="size-8 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 flex items-center justify-center transition-colors shrink-0"
              title="Đổi chế độ Sáng / Tối"
            >
              {theme === 'dark' ? <Sun className="size-4 text-amber-400" /> : <Moon className="size-4 text-slate-600" />}
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
