export type Result = {
    filePath: string;
    codeContent: string;
    repositoryName: string;
    repositoryUrl: string;
    maliciousIntent: RegExp[];
    foundIn: string;
  };
  