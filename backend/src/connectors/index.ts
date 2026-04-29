import { BaseConnector } from './BaseConnector';

export class LexUzConnector extends BaseConnector {
    sourceName = 'Lex.uz';
    baseUrl = 'https://lex.uz';
    trustLevel = 5;
    category = 'legal';
}

export class SoliqUzConnector extends BaseConnector {
    sourceName = 'Soliq.uz';
    baseUrl = 'https://soliq.uz';
    trustLevel = 5;
    category = 'tax';
}

export class MyGovUzConnector extends BaseConnector {
    sourceName = 'My.gov.uz';
    baseUrl = 'https://my.gov.uz';
    trustLevel = 5;
    category = 'service';
}

export class PresidentUzConnector extends BaseConnector {
    sourceName = 'President.uz';
    baseUrl = 'https://president.uz';
    trustLevel = 5;
    category = 'official';
}

export class GovUzConnector extends BaseConnector {
    sourceName = 'Gov.uz';
    baseUrl = 'https://gov.uz';
    trustLevel = 4;
    category = 'official';
}

export class AdliyaUzConnector extends BaseConnector {
    sourceName = 'Adliya.uz';
    baseUrl = 'https://adliya.uz';
    trustLevel = 5;
    category = 'legal';
}

export class CentralBankConnector extends BaseConnector {
    sourceName = 'Markaziy bank';
    baseUrl = 'https://cbu.uz';
    trustLevel = 5;
    category = 'finance';
}

export class KadastrConnector extends BaseConnector {
    sourceName = 'Kadastr agentligi';
    baseUrl = 'https://kadastr.uz';
    trustLevel = 5;
    category = 'property';
}

export class CustomsConnector extends BaseConnector {
    sourceName = 'Bojxona qo`mitasi';
    baseUrl = 'https://customs.uz';
    trustLevel = 5;
    category = 'customs';
}

export class CourtSourcesConnector extends BaseConnector {
    sourceName = 'Oliy sud';
    baseUrl = 'https://sud.uz';
    trustLevel = 5;
    category = 'legal';
}

export const getAllConnectors = (): BaseConnector[] => {
    return [
        new LexUzConnector(),
        new SoliqUzConnector(),
        new MyGovUzConnector(),
        new PresidentUzConnector(),
        new GovUzConnector(),
        new AdliyaUzConnector(),
        new CentralBankConnector(),
        new KadastrConnector(),
        new CustomsConnector(),
        new CourtSourcesConnector()
    ];
};
