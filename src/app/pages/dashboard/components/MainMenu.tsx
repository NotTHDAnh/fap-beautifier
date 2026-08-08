import React, { useState } from 'react';
import { Card, CardContent } from '@/app/components/ui/card';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  FileText,
  GraduationCap,
  TrendingUp,
  MessageSquare,
  FileCheck,
  Building2,
  BookOpen,
  Search,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Layers,
  CheckCircle2,
  ShoppingCart,
  CreditCard,
  UserCheck,
  MapPin,
  User,
  ArrowUpRight,
  Send
} from 'lucide-react';
import { useFapDataSelector, useFapDataCustom } from '@/app/providers/fap-data-provider';
import { ApplicationDeadlineModalTrigger } from './ApplicationDeadline';

interface MenuLink {
  title: string;
  href: string;
  cancelHref?: string;
  isNew?: boolean;
  target?: string;
  description?: string;
  highlight?: boolean;
}

interface ModuleSection {
  id: string;
  title: string;
  titleVi: string;
  icon: React.ElementType;
  links: MenuLink[];
}

const MainMenu = () => {
  const [searchQuery, setSearchQuery] = useState('');
  // 🗂️ Categories default to COLLAPSED
  const [collapsedModules, setCollapsedModules] = useState<Record<string, boolean>>(() => {
    return {
      schedule_access: true,
      grades_attendance: true,
      registration_class: true,
      applications_finance: true,
      coursera_feedback: true,
      profile_regulations: true,
    };
  });
  
  const studentData = useFapDataSelector({
    fullName: '#ctl00_lblLogIn',
    rollNumber: '#ctl00_lblLogIn',
  });
  const fullName = studentData.fullName?.replace(/\([^)]*\)/g, '').trim() || 'Sinh viên FPT';

  const toggleModuleCollapse = (moduleId: string) => {
    setCollapsedModules((prev) => ({
      ...prev,
      [moduleId]: !prev[moduleId],
    }));
  };

  const toggleAllCollapse = (collapse: boolean) => {
    const nextState: Record<string, boolean> = {};
    modules.forEach((mod) => {
      nextState[mod.id] = collapse;
    });
    setCollapsedModules(nextState);
  };

  // 🚀 Quick Actions (6 Primary Student Actions - Monochromatic 90% Grayscale)
  const quickActions = [
    {
      title: 'View Schedule',
      titleVi: 'Thời khóa biểu tuần',
      href: '/Report/ScheduleOfWeek.aspx',
      icon: Clock,
    },
    {
      title: 'Grade Report',
      titleVi: 'Bảng điểm sinh viên',
      href: '/Grade/StudentGrade.aspx',
      icon: GraduationCap,
    },
    {
      title: 'Send Application',
      titleVi: 'Gửi đơn trực tuyến',
      href: '/App/SendAcad.aspx',
      icon: Send,
    },
    {
      title: 'Attendance',
      titleVi: 'Điểm danh cá nhân',
      href: '/Report/ViewAttendstudent.aspx',
      icon: FileCheck,
    },
    {
      title: 'Exam Schedule',
      titleVi: 'Lịch thi học kỳ',
      href: '/Exam/ScheduleExams.aspx',
      icon: Calendar,
    },
    {
      title: 'Tuition Payment',
      titleVi: 'Học phí & giao dịch',
      href: '/FrontOffice/SubjectFees.aspx',
      icon: ShoppingCart,
    },
  ];

  // 📊 Real Live Today's Schedule Parser from FAP DOM
  const { realTodaysClasses } = useFapDataCustom({
    realTodaysClasses: (doc) => {
      if (!doc) return [];
      const classes: Array<{
        code: string;
        name: string;
        time: string;
        slot: string;
        room: string;
        status: string;
        badgeStyle: string;
      }> = [];
      try {
        const tables = doc.querySelectorAll ? doc.querySelectorAll('table') : [];
        tables.forEach((table) => {
          if (!table || !table.rows || table.rows.length < 3) return;
          const headerCells = Array.from(table.rows[1]?.cells || []).map((c) => c?.textContent?.trim() || '');
          
          const today = new Date();
          const dayStr = String(today.getDate()).padStart(2, '0');
          const monthStr = String(today.getMonth() + 1).padStart(2, '0');
          const todayMatch = `${dayStr}/${monthStr}`;

          const todayColIndex = headerCells.findIndex((h) => h && h.includes(todayMatch));
          if (todayColIndex <= 0) return;

          for (let i = 2; i < table.rows.length; i++) {
            const cell = table.rows[i]?.cells?.[todayColIndex];
            if (cell && cell.textContent?.trim() && cell.textContent.trim() !== '-') {
              const activityLink = cell.querySelector('a[href*="ActivityDetail.aspx"]');
              const courseName = activityLink?.textContent?.trim() || 'Môn học';
              const cellText = cell.textContent || '';
              const roomMatch = cellText.match(/at\s+([A-Za-z0-9_-]+)/i);
              const room = roomMatch ? roomMatch[1] : 'Phòng học';
              const timeMatch = cellText.match(/\((\d{2}:\d{2}\s*-\s*\d{2}:\d{2})\)/);
              const time = timeMatch ? timeMatch[1] : 'Ca học';
              const isAttended = /attended/i.test(cellText);
              const isAbsent = /absent/i.test(cellText);
              
              classes.push({
                code: courseName.replace(/^-/, '').trim(),
                name: courseName,
                time: time,
                slot: `Slot ${i - 1}`,
                room: room,
                status: isAttended ? 'Attended' : isAbsent ? 'Absent' : 'Chưa diễn ra',
                badgeStyle: isAttended
                  ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900'
                  : isAbsent
                  ? 'bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
              });
            }
          }
        });
      } catch (e) {
        console.error('Error parsing today schedule safely:', e);
      }
      return classes;
    },
  });

  // 🗂️ Modules catalog with 6 clean categories (100% Monochromatic)
  const modules: ModuleSection[] = [
    {
      id: 'schedule_access',
      title: 'Schedule & Timetable',
      titleVi: 'Lịch Học, Lịch Thi & Tra Cứu',
      icon: Calendar,
      links: [
        { title: 'Weekly timetable', href: 'Report/ScheduleOfWeek.aspx', description: 'Thời khóa biểu tuần', highlight: true },
        { title: 'University timetable', href: 'Course/Courses.aspx', description: 'Lịch học toàn trường', highlight: true },
        { title: 'View exam schedule', href: 'Exam/ScheduleExams.aspx', description: 'Xem lịch thi kỳ này', highlight: true },
        { title: 'Student book room', href: 'Schedule/ActivityStudent.aspx', isNew: true, description: 'Đặt phòng học nhóm sinh viên' },
        { title: 'EduNext student guideline', href: 'https://fap.fpt.edu.vn/temp/Regulations/Huong_dan_KTXH_tren_EduNext_Sp23_Sinh_Vien.pdf', target: '_blank', isNew: true, description: 'Hướng dẫn EduNext' },
        { title: 'Nâng cấp Safe Exam Browser (SEB)', href: 'https://drive.google.com/drive/u/2/folders/1RmjeKAvef6BXg_qlAl6JnZx2ZkY3qj_3', target: '_blank', isNew: true, description: 'Trình duyệt thi an toàn' },
      ],
    },
    {
      id: 'grades_attendance',
      title: 'Grades & Academic Reports',
      titleVi: 'Kết Quả Học Tập & Điểm Danh',
      icon: TrendingUp,
      links: [
        { title: 'Attendance report', href: 'Report/ViewAttendstudent.aspx', description: 'Báo cáo điểm danh lớp', highlight: true },
        { title: 'Mark Report', href: 'Grade/StudentGrade.aspx', description: 'Báo cáo điểm môn học', highlight: true },
        { title: 'Academic Transcript', href: 'Grade/StudentTranscript.aspx', description: 'Bảng điểm tích lũy tổng hợp', highlight: true },
        { title: 'Curriculum', href: 'FrontOffice/StudentCurriculum.aspx', description: 'Khung chương trình đào tạo' },
        { title: 'View Syllabuses (FLM)', href: 'http://flm.fpt.edu.vn', target: '_blank', description: 'Đề cương chi tiết môn học' },
        { title: 'Report điểm phong trào', href: 'Report/PrintReportFinalS.aspx', description: 'Điểm hoạt động phong trào' },
      ],
    },
    {
      id: 'registration_class',
      title: 'Course Registration & Class Swap',
      titleVi: 'Đăng Ký Môn & Xin Chuyển Lớp',
      icon: BookOpen,
      links: [
        { title: 'Register to repeat a course', href: 'FrontOffice/RegisterCourse.aspx?code=R5', description: 'Đăng ký học lại môn', highlight: true },
        { title: 'Register to improve mark', href: 'FrontOffice/RegisterCourse.aspx?code=R4', description: 'Đăng ký học cải thiện điểm', highlight: true },
        { title: 'Register extra courses', href: 'FrontOffice/RegisterCourse.aspx?code=R3', description: 'Đăng ký môn vượt / môn chậm' },
        { title: 'Cancel registration', href: 'FrontOffice/RegisteredCourses.aspx', description: 'Hủy môn đã đăng ký' },
        { title: 'Register Free Elective Courses', href: 'FrontOffice/RegisterElective.aspx', description: 'Đăng ký môn tự chọn' },
        { title: 'Move out class', href: 'FrontOffice/Courses.aspx', description: 'Xin chuyển lớp học' },
        { title: 'Yêu cầu đổi chéo lớp với sinh viên', href: 'App/CourseChange.aspx', description: 'Đổi chéo lớp 1-1' },
        { title: 'Wishlist Course', href: 'FrontOffice/WishList.aspx', description: 'Danh sách môn đợi mở lớp' },
      ],
    },
    {
      id: 'applications_finance',
      title: 'Applications, Forms & Tuition',
      titleVi: 'Thủ Tục, Đơn Từ & Tài Chính',
      icon: FileText,
      links: [
        { title: 'Send Application', href: 'App/SendAcad.aspx', description: 'Gửi đơn trực tuyến', highlight: true },
        { title: 'View Application', href: 'App/AcadAppView.aspx', description: 'Theo dõi kết quả phê duyệt đơn' },
        { title: 'Suspend one semester', href: 'FrontOffice/AddApplication.aspx?code=R2', cancelHref: 'FrontOffice/RemoveApplication.aspx?code=R2', description: 'Xin tạm nghỉ 1 học kỳ' },
        { title: 'Xin xác nhận sinh viên', href: 'App/AddApp.aspx', description: 'Đơn xác nhận sinh viên' },
        { title: 'Tuition fee per course', href: 'FrontOffice/SubjectFees.aspx', description: 'Biểu học phí từng môn' },
        { title: 'Transaction history', href: 'Finance/TransReport.aspx', description: 'Lịch sử giao dịch đóng tiền' },
        { title: 'Choose paid items & Checkout', href: 'FrontOffice/CheckOut.aspx', description: 'Lựa chọn nộp phí & Thanh toán' },
        { title: 'Đăng ký BHYT', href: 'BHYT/Register.aspx', description: 'Đăng ký Bảo hiểm y tế' },
      ],
    },
    {
      id: 'coursera_feedback',
      title: 'Coursera, Feedback & Support',
      titleVi: 'FPTU-Coursera, Đánh Giá & Hỗ Trợ',
      icon: MessageSquare,
      links: [
        { title: 'Feedback about teaching', href: 'Feedback/StudentFeedBack.aspx', description: 'Ý kiến & Đánh giá giảng dạy (Bắt buộc)', highlight: true },
        { title: 'Coursera Announcement', href: 'https://fap.fpt.edu.vn/temp/Regulations/FPTU-Coursera.pdf', target: '_blank', description: 'Thông báo quy định FPTU-Coursera' },
        { title: 'Submit certificates', href: 'https://insideuni.fpt.edu.vn/13', target: '_blank', description: 'Nộp chứng chỉ Coursera' },
        { title: 'Ask mentor (Q&A)', href: 'SRS/AddQA.aspx', target: '_blank', description: 'Hỏi đáp Mentor môn Coursera' },
        { title: 'How to access Wiley eBook', href: 'https://fap.fpt.edu.vn/temp/Regulations/How-to-access-Wiley-eBook-on-Vitalsource-platform_13_Jan_2025.pdf', target: '_blank', description: 'Đọc sách điện tử Wiley eBook' },
        { title: 'Sinh viên điểm danh bằng mã', href: 'Schedule/AttendanceByRoll.aspx', description: 'Điểm danh nhanh bằng mã Code' },
        { title: 'Help / Hỗ trợ FAP', href: 'Report/Help.aspx', isNew: true, description: 'Trung tâm trợ giúp & hướng dẫn FAP' },
      ],
    },
    {
      id: 'profile_regulations',
      title: 'Profile, Regulations & Dorm',
      titleVi: 'Hồ Sơ Cá Nhân, Quy Định & KTX',
      icon: Building2,
      links: [
        { title: 'Student Profile', href: 'User/Profile.aspx', description: 'Hồ sơ & Thông tin cá nhân', highlight: true },
        { title: 'Update Profile', href: 'User/verProfile.aspx', description: 'Cập nhật thông tin hồ sơ' },
        { title: 'Regulations...', href: 'User/Regulations.aspx', target: '_blank', description: 'Quy định đào tạo FPTU' },
        { title: 'Nội quy KTX Hà Nội & Cần Thơ', href: 'https://fap.fpt.edu.vn/temp/Regulations/QD 272_new.pdf', target: '_blank', description: 'Quy chế ở ký túc xá' },
        { title: 'Hòa Lạc On Campus Dormitory (OCD)', href: 'https://ocd.fpt.edu.vn/', target: '_blank', description: 'Trang KTX Hòa Lạc' },
        { title: 'OJT Tra cứu & Xét khóa luận', href: 'App/ViewXetTN.aspx', target: '_blank', description: 'Tra cứu thực tập OJT & Tốt nghiệp' },
        { title: 'Các loại chứng chỉ', href: 'Report/Awa.aspx', description: 'Danh sách chứng chỉ & Khen thưởng' },
      ],
    },
  ];

  // Helper renderer for link item (Monochromatic Row Item)
  const renderLinkItem = (link: MenuLink) => (
    <div
      key={link.title + link.href}
      className={`group flex items-center justify-between p-3 rounded-xl border transition-all duration-200 ${
        link.highlight
          ? 'bg-slate-50 dark:bg-slate-800/80 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
          : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:border-slate-300 dark:hover:border-slate-700'
      }`}
    >
      <div className="flex flex-col min-w-0 pr-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            to={link.href.startsWith('http') ? link.href : `/${link.href}`}
            target={link.target}
            className="font-medium text-sm text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex items-center gap-1"
          >
            <span>{link.title}</span>
            {link.target === '_blank' && (
              <ExternalLink className="size-3 text-slate-400 inline opacity-70 group-hover:opacity-100" />
            )}
          </Link>

          {link.isNew && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900">
              NEW
            </span>
          )}
        </div>

        {link.description && (
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
            {link.description}
          </span>
        )}

        {link.cancelHref && (
          <Link
            to={`/${link.cancelHref}`}
            className="text-xs text-rose-600 hover:underline mt-0.5 inline-block"
          >
            Hủy bỏ xin tạm hoãn
          </Link>
        )}
      </div>

      <ChevronRight className="size-4 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-1 transition-all shrink-0" />
    </div>
  );

  // Filter modules based on search term
  const filteredModules = modules.map((mod) => {
    if (!searchQuery.trim()) return mod;
    const query = searchQuery.toLowerCase();
    const matchingLinks = mod.links.filter(
      (link) =>
        link.title.toLowerCase().includes(query) ||
        (link.description && link.description.toLowerCase().includes(query))
    );
    return { ...mod, links: matchingLinks };
  }).filter((mod) => mod.links.length > 0);

  const isAllCollapsed = modules.every((mod) => collapsedModules[mod.id]);

  return (
    <div className="space-y-8 w-full">
      {/* 👋 1. Greeting & Academic Header Hero (Full Width Monochromatic) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              Summer 2026 Semester
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-medium text-slate-500">FPT University Portal</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Xin chào, {fullName} 👋
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Đây là tổng quan học tập và các lối tắt chức năng của bạn hôm nay.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          {/* Modal Trigger Button for Application Deadlines */}
          <ApplicationDeadlineModalTrigger />

          <Link
            to="/Report/ScheduleOfWeek.aspx"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md shadow-blue-500/20 transition-all"
          >
            <Clock className="size-4" />
            <span>Xem thời khóa biểu</span>
          </Link>
        </div>
      </div>

      {/* 📊 2. Summary Stat Cards (Monochromatic 90% Grayscale) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* GPA Card */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>GPA tích lũy</span>
            <GraduationCap className="size-4 text-slate-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-900 dark:text-white">3.52</span>
            <span className="text-xs text-slate-400 font-semibold">/ 4.0</span>
          </div>
          <div className="mt-3 w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: '88%' }} />
          </div>
        </div>

        {/* Current Semester Credits Card */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Tín chỉ kỳ này</span>
            <BookOpen className="size-4 text-slate-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-900 dark:text-white">18</span>
            <span className="text-xs text-slate-400 font-semibold">tín chỉ</span>
          </div>
          <div className="mt-3 flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="size-3.5" />
            <span>Đã hoàn thành 5/5 môn</span>
          </div>
        </div>

        {/* Tuition Status Card */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Học phí Summer '26</span>
            <ShoppingCart className="size-4 text-slate-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-900 dark:text-white">Đã nộp</span>
          </div>
          <div className="mt-3 flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="size-3.5" />
            <span>0₫ nợ tồn đọng</span>
          </div>
        </div>

        {/* Attendance Rate Card */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Tỷ lệ có mặt</span>
            <FileCheck className="size-4 text-slate-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-900 dark:text-white">98.5%</span>
          </div>
          <div className="mt-3 flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="size-3.5" />
            <span>An toàn (&gt; 80%)</span>
          </div>
        </div>

        {/* Next Exam Card */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Lịch thi sắp tới</span>
            <Calendar className="size-4 text-slate-500" />
          </div>
          <div className="mt-2">
            <span className="text-sm font-black text-slate-900 dark:text-white block">SWP391 Final</span>
            <span className="text-xs text-slate-500">20/08/2026 • 09:30</span>
          </div>
        </div>
      </div>

      {/* 🚀 3. Today's Classes & Quick Actions (Monochromatic Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Classes Timeline (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="size-4.5 text-slate-700 dark:text-slate-300" />
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">Lịch Học Hôm Nay</h2>
            </div>
            <Link to="/Report/ScheduleOfWeek.aspx" className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
              <span>Xem tất cả</span>
              <ArrowUpRight className="size-3.5" />
            </Link>
          </div>

          {realTodaysClasses && realTodaysClasses.length > 0 ? (
            <div className="space-y-3">
              {realTodaysClasses.map((cls, idx) => (
                <div
                  key={cls.code + idx}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between gap-4 shadow-xs"
                >
                  <div className="flex items-center gap-4">
                    <div className="size-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-black flex items-center justify-center text-sm border border-slate-200 dark:border-slate-700 shrink-0">
                      {cls.slot}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-base text-slate-900 dark:text-white">{cls.code}</span>
                        <span className="text-xs text-slate-400">•</span>
                        <span className="text-xs font-medium text-slate-500">{cls.name}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="size-3.5 text-slate-400" />
                          {cls.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="size-3.5 text-slate-400" />
                          {cls.room}
                        </span>
                      </div>
                    </div>
                  </div>

                  <span className={`text-xs font-bold px-3 py-1 rounded-full border ${cls.badgeStyle}`}>
                    {cls.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 text-center space-y-2 shadow-xs">
              <div className="size-10 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
                <CheckCircle2 className="size-5" />
              </div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Không Có Lịch Học Hôm Nay</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Bạn không có ca học nào trên hệ thống FAP trong ngày hôm nay.</p>
              <Link to="/Report/ScheduleOfWeek.aspx" className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline pt-1">
                <span>Xem thời khóa biểu tuần đầy đủ</span>
                <ArrowUpRight className="size-3.5" />
              </Link>
            </div>
          )}
        </div>

        {/* Quick Actions Panel (Monochromatic Cards) */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Layers className="size-4.5 text-slate-700 dark:text-slate-300" />
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">Truy Cập Nhanh</h2>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((act) => {
              const Icon = act.icon;
              return (
                <Link
                  key={act.title}
                  to={act.href}
                  className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all hover:scale-[1.02] flex flex-col justify-between h-28 shadow-xs"
                >
                  <Icon className="size-5 text-slate-600 dark:text-slate-400" />
                  <div>
                    <span className="font-bold text-xs text-slate-900 dark:text-white block leading-tight">{act.title}</span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate block mt-0.5">{act.titleVi}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* 🔍 4. Reorganized Categorized Modules Section (90% Monochromatic) */}
      <div className="space-y-5 pt-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <Layers className="size-5 text-slate-700 dark:text-slate-300" />
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Danh Mục Chức Năng Cổng Đào Tạo</h2>
            <button
              onClick={() => toggleAllCollapse(!isAllCollapsed)}
              className="text-xs font-semibold text-slate-700 dark:text-slate-300 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 ml-2"
            >
              {isAllCollapsed ? 'Mở rộng tất cả' : 'Thu gọn tất cả'}
            </button>
          </div>

          {/* Real-time Module Link Search */}
          <div className="relative min-w-[260px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm chức năng..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/30"
            />
          </div>
        </div>

        {/* Grid of 6 Monochromatic Category Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredModules.map((module) => {
            const Icon = module.icon;
            const isCollapsed = collapsedModules[module.id];

            return (
              <Card
                key={module.id}
                className="overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-col justify-between"
              >
                <div>
                  {/* Module Card Header */}
                  <div
                    onClick={() => toggleModuleCollapse(module.id)}
                    className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-2">
                      <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shrink-0">
                        <Icon className="size-4.5" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-extrabold text-sm text-slate-900 dark:text-white truncate">
                          {module.titleVi}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">
                          {module.title}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {module.links.length}
                      </span>
                      {isCollapsed ? <ChevronDown className="size-4 text-slate-400" /> : <ChevronUp className="size-4 text-slate-400" />}
                    </div>
                  </div>

                  {/* Module Link List */}
                  {!isCollapsed && (
                    <div className="p-3 space-y-2">
                      {module.links.map((link) => renderLinkItem(link))}
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export { MainMenu };
export default MainMenu;
