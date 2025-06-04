declare module 'ofx-js' {
  interface OfxTransaction {
    TRNAMT: string;
    TRNTYPE: string;
    MEMO: string;
    DTPOSTED: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  }

  interface OfxBankTransactionList {
    STMTTRN: OfxTransaction[];
  }

  interface OfxStatementResponse {
    BANKTRANLIST: OfxBankTransactionList;
  }

  interface OfxStatementTransaction {
    STMTRS: OfxStatementResponse;
  }

  interface OfxBankMessages {
    STMTTRNRS: OfxStatementTransaction;
  }

  interface OfxParsedData {
    OFX?: {
      BANKMSGSRSV1?: OfxBankMessages;
      // Adicione outras propriedades se necessário
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      [key: string]: any;
    };
    // Para compatibilidade, mantenha também:
    BANKMSGSRSV1?: OfxBankMessages;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  }

  export function parse(ofxString: string): Promise<OfxParsedData>;
}
