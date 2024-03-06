export interface UrlConfig {
  portal: {
    surveyDetailsURL: string;
    surveySubmissionURL: string;
    presignedURL: string;
  };
  mobile: {
    surveyDetailsURL: string;
    surveySubmissionURL: string;
    presignedURL: string;
  };
}

export interface FeatureType {
  survey: UrlConfig;
  observation: UrlConfig;
}

export interface InputConfig {
  type: keyof FeatureType;
  solutionId?: string;
  entityId?: string;
  fetchUrl: string;
  updateUrl: string;
  accessToken?: string;
  authorization?: string;
}
