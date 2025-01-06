// types/pdf-parse.d.ts
declare module 'pdf-parse' {
    interface PDFVersion {
      major: number;
      minor: number;
    }
  
    interface PDFData {
      numpages: number;
      numrender: number;
      info: {
        PDFFormatVersion: string;
        IsAcroFormPresent: boolean;
        IsXFAPresent: boolean;
        [key: string]: any;
      };
      metadata: any;
      text: string;
      version: PDFVersion;
    }
  
    function PDFParse(
      dataBuffer: Buffer,
      options?: {
        pagerender?: (pageData: any) => string;
        max?: number;
      }
    ): Promise<PDFData>;
  
    export = PDFParse;
  }