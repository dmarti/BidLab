export const JURISDICTIONS = {
    'none': {
        name: 'No Restrictions',
        flag: '🌐',
        gppString: null,
        applicableSections: [],
        description: 'Standard global behavior with no privacy signals.'
    },
    'eu_tcf': {
        name: 'EU (TCF v2.2)',
        flag: '🇪🇺',
        gppString: 'DBABMA~CQmDUEAQmDUEAAAAAAENAAFgAIAAAAAAAAAAAAAAAAAA.IAAA.YAAAAAAAAAAA',
        applicableSections: [2],
        description: 'GDPR compliance mode using Transparency & Consent Framework.'
    },
    'us_nat': {
        name: 'US National',
        flag: '🇺🇸',
        gppString: 'DBACaYA~A~BAAAAAAAAABA.QA',
        gppStringGpc: 'DBACaYA~G~BAAVAAAAAABA.YA',
        applicableSections: [7, 1],
        description: 'IAB US National Privacy string for multi-state compliance.'
    },
    'us_ca': {
        name: 'California (CCPA/CPRA)',
        flag: '🐻',
        gppString: 'DBACZYA~A~BAAAAABA.QA',
        gppStringGpc: 'DBACZYA~G~BAUAAABA.YA',
        applicableSections: [8, 1],
        description: 'California-specific privacy signals (Do Not Sell/Share).'
    },
    'us_va': {
        name: 'Virginia (VCDPA)',
        flag: '🏛️',
        gppString: 'DBACYMA~A~BAAAABA',
        gppStringGpc: 'DBACYMA~G~BAUAABA',
        applicableSections: [9, 1],
        description: 'Virginia-specific privacy signals for consumer data protection.'
    }
};
