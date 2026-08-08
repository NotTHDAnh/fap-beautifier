import { useStudentTranscript } from './use-student-transcript';
import { TranscriptSummary } from './components/transcript-summary';
import { TranscriptTable } from './components/transcript-table';
import { Container } from '@/app/components/common/container';

const StudentTranscriptPage = () => {
  const { gpaList, averageGPA, averageGPA4, totalCredit, nonGpaCodes, setNonGpaCodes } = useStudentTranscript();

  // TODO: Thêm loading state nếu cần

  return (
    <Container>
      <TranscriptSummary
        averageGPA={averageGPA}
        averageGPA4={averageGPA4}
        totalCredit={totalCredit}
        nonGpaCodes={nonGpaCodes}
        setNonGpaCodes={setNonGpaCodes}
      />
      <TranscriptTable gpaList={gpaList} />
    </Container>
  );
};

export { StudentTranscriptPage }; 