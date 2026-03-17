export type RelatedFormType = {
  id: string;
  icon: string;
  label: string;
  formsCount: number;
};

export type RelatedFormsStat = {
  id: string;
  label: string;
  value: string;
  icon: "file" | "check" | "questions" | "responses";
};

export type RelatedFormItem = {
  id: string;
  icon: string;
  title: string;
  status: string;
  category: string;
  description: string;
  questions: number;
  sections: number;
  responses: number;
  modifiedAt: string;
};
