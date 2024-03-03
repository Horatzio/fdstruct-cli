export interface FDStructConfig {
  debug: boolean;
  variables: Record<string, string>;
}

export const fdstructVariableRegex = /\$[a-zA-Z0-9_]+/;
