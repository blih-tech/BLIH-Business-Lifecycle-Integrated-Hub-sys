export type ExitRelatedFormStat = {
  id: string;
  label: string;
  value: string;
};

export type ExitInterviewFormItem = {
  id: string;
  title: string;
  category: string;
  version: string;
  description: string;
  updatedAt: string;
  usedCount: string;
  fields: string[];
};

export type ExitTemplateFormItem = {
  id: string;
  title: string;
  category: string;
  version: string;
  description: string;
  updatedAt: string;
  usedCount: string;
  previewTitle: string;
  previewText: string;
  actions: ('download' | 'delete' | 'edit')[];
};
