import {
  documentTemplates,
  employeeClearanceItems,
  exitDocumentsStats,
  recentlyClearedDocuments,
} from '@/features/hr/exit/documents/mock-data';
import {
  DocumentsStatsGrid,
  DocumentTemplatesSection,
  EmployeeDocumentClearanceSection,
  RecentlyClearedDocumentsSection,
} from '@/features/hr/exit/documents/components';

export * from '@/features/hr/exit/documents/components';
export * from '@/features/hr/exit/documents/types';

export function ExitDocumentsContent() {
  return (
    <main className="mx-auto w-full max-w-[1024px] space-y-4 px-4 py-4 md:px-5 md:py-5">
      <DocumentsStatsGrid items={exitDocumentsStats} />
      <EmployeeDocumentClearanceSection items={employeeClearanceItems} />
      <DocumentTemplatesSection items={documentTemplates} />
      <RecentlyClearedDocumentsSection items={recentlyClearedDocuments} />
    </main>
  );
}
