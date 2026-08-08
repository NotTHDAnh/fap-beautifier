import React from 'react';
import { Alert, AlertDescription } from '@/app/components/ui/alert';

interface TuitionAlertProps {
  tuitionContent: string | undefined;
  accountBalance: string | undefined;
  className?: string;
}

const TuitionAlert = ({ tuitionContent, accountBalance, className = '' }: TuitionAlertProps) => {
  if (!tuitionContent) return null;

  return (
    <Alert className={`w-full mb-5 rounded-2xl border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/60 p-4 ${className}`}>
      <AlertDescription className="text-amber-900 dark:text-amber-200 text-xs sm:text-sm font-medium">
        <div className="font-bold text-amber-900 dark:text-amber-100">{tuitionContent}</div>
        {accountBalance && (
          <div dangerouslySetInnerHTML={{ __html: accountBalance }} className="mt-1 opacity-90" />
        )}
      </AlertDescription>
    </Alert>
  );
};

export { TuitionAlert };