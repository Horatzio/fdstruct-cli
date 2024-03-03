export interface FDStructConfig {
  basePath: string;
  useHardLinks: boolean;
  variables: Record<string, string>;

  scan: {
    useGitignorePatterns: boolean;
    ignorePatterns: string[];
    includePatterns: string[];
  },
  watch: {
    shouldDeleteDiffs: boolean
  }

  debug: boolean;
}

export const DEFAULTS: FDStructConfig = {
  basePath: null,
  useHardLinks: false,
  variables: {},

  scan: {
    useGitignorePatterns: true,
    ignorePatterns: [],
    includePatterns: []
  },
  watch: {
    shouldDeleteDiffs: false
  },

  debug: false,
};

export const fdstructVariableRegex = /\$[a-zA-Z0-9_]+/;