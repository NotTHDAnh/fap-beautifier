import React from 'react';
import { Link } from 'react-router-dom';
import { useFapData } from '@/app/providers/fap-data-provider';

const NoSupportedRoute = () => {
  const { getData } = useFapData();
  const rawElement = getData();

  if (rawElement) {
    return (
      <div className="w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
        <div
          className="fap-legacy-content text-slate-900 dark:text-slate-100 text-sm overflow-x-auto"
          dangerouslySetInnerHTML={{ __html: rawElement.innerHTML }}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-4 p-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
      <h2 className="text-xl font-bold text-slate-900 dark:text-white">Trang FAP Đang Được Tải</h2>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md">
        Nội dung tính năng này đang được đồng bộ trực tiếp từ cổng thông tin đào tạo FPT.
      </p>
      <Link
        to="/Student.aspx"
        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors"
      >
        Trở về Trang chủ Dashboard
      </Link>
    </div>
  );
};

export default NoSupportedRoute;