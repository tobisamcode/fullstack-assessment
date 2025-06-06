export interface Consultant {
  id: string;
  name: string;
  role: string;
  location: string;
  yearsOfExp: number;
  skills: string[];
  bio: string;
}

export interface Evaluation {
  fitScore: number;
  summary: string;
  pros: string[];
  cons: string[];
  questions: string[];
}


export interface ConsultantCardProps {
  consultant: Consultant;
  evaluation?: Evaluation | null;
}

export interface FilterValues {
  selectedLocation: string;
  selectedExperience: string;
  keyword: string;
}

export interface FilterPanelProps {
  consultants: Consultant[];
  onFilterChange: (filters: FilterValues) => void;
}


export interface EvaluationMap {
  [consultantId: string]: Evaluation
}


export interface Filters {
  selectedLocation: string;
  selectedExperience: string;
  keyword: string;
}



export type JobDescription = string;