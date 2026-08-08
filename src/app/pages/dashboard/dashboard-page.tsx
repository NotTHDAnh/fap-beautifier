import { Container } from '@/app/components/common/container';
import { MainMenu } from './components/MainMenu';
import { TuitionAlert } from './components/TuitionAlert';
import { FeedbackNotification } from './components/FeedbackNotification';
import { useDashboard } from '@/app/hooks/useDashboard';

const DashboardPage = () => {
  const { isRequireFeedback, tuitionContent, accountBalance } = useDashboard();

  return (
    <Container width="fluid" className="w-full max-w-full p-0">
      <FeedbackNotification isVisible={!!isRequireFeedback} />
      
      {!isRequireFeedback && (
        <div className="space-y-6 w-full">
          <TuitionAlert 
            tuitionContent={tuitionContent || undefined} 
            accountBalance={accountBalance || undefined} 
            className="w-full"
          />
          
          <div className="w-full">
            <MainMenu />
          </div>
        </div>
      )}
    </Container>
  );
};

export { DashboardPage };
