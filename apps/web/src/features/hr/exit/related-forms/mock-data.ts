import type {
  ExitInterviewFormItem,
  ExitRelatedFormStat,
  ExitTemplateFormItem,
} from '@/features/hr/exit/related-forms/types';

export const exitRelatedFormStats: ExitRelatedFormStat[] = [
  { id: 'exit-interview-form', label: 'Exit Interview Form', value: '1' },
  { id: 'resignation-templates', label: 'Resignation Templates', value: '2' },
  { id: 'satisfaction-surveys', label: 'Satisfaction Surveys', value: '1' },
  { id: 'letter-templates', label: 'Letter Templates', value: '2' },
];

export const exitInterviewForm: ExitInterviewFormItem = {
  id: 'interview-form',
  title: 'Exit Interview Form',
  category: 'interview',
  version: 'v2.1',
  description: 'Comprehensive exit interview questionnaire',
  updatedAt: '2024-01-15',
  usedCount: '45',
  fields: [
    'Employee Information',
    'Reason for Leaving',
    'Job Satisfaction Rating',
    'Management Feedback',
    'Work Environment',
    'Career Development',
    'Suggestions for Improvement',
    'Would Recommend Company',
  ],
};

const resignationPreview = [
  'Dear [Manager Name],',
  '',
  'I am writing to formally notify you of my resignation from my position as [Position] at [Company Name]. My last working day will be [Date], providing the required [Notice Period] notice.',
].join('\n');

export const exitTemplateForms: ExitTemplateFormItem[] = [
  {
    id: 'template-a',
    title: 'Resignation Letter Template',
    category: 'resignation',
    version: 'v1.5',
    description: 'Standard resignation letter format for employees',
    updatedAt: '2023-12-10',
    usedCount: '78',
    previewTitle: 'Template Preview:',
    previewText: resignationPreview,
    actions: ['download', 'delete'],
  },
  {
    id: 'template-b',
    title: 'Resignation Letter Template',
    category: 'resignation',
    version: 'v1.5',
    description: 'Standard resignation letter format for employees',
    updatedAt: '2023-12-10',
    usedCount: '78',
    previewTitle: 'Template Preview:',
    previewText: resignationPreview,
    actions: ['delete', 'edit'],
  },
];
