export interface Rubric {
  rubric_name: string;
  release_date: string;
  domains: RubricDomain[];
}

export interface RubricDomain {
  domain_name: string;
  indicators: RubricIndicator[];
}

export interface RubricIndicator {
  indicator_code: string;
  indicator_name: string;
  performance_levels: {
    Level_5_Exemplary: RubricPerformanceLevel;
    Level_3_Proficient: RubricPerformanceLevel;
    Level_1_Unsatisfactory: RubricPerformanceLevel;
  };
}

export interface RubricPerformanceLevel {
  description_header: string;
  descriptors: string[];
} 