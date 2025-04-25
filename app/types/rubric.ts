export type RubricContent = {
  document_title: string;
  release_date: string;
  issuing_organization: string;
  partnership: string;
  contact_info: {
    website: string;
    address: string;
    city: string;
    state: string;
    zip: string;
  };
  overview: {
    purpose: string;
    grounding: string;
    focus_domains: string[];
    performance_levels: {
      defined: number[];
      observer_judgment: number[];
      notes: string;
    };
  };
  domains: Domain[];
  definitions: {
    term: string;
    definition: string;
  }[];
};

export type Domain = {
  name: string;
  performance_level_descriptions: {
    "Level 5 Exemplary": string;
    "Level 3 Proficient": string;
    "Level 1 Unsatisfactory": string;
  };
  indicators: Indicator[];
};

export type Indicator = {
  name: string;
  acronym?: string;
  rubric: {
    "Level 5 Exemplary": string[];
    "Level 3 Proficient": string[];
    "Level 1 Unsatisfactory": string[];
  };
}; 