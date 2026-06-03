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
        gppString: 'DBAAABA~CP1A6aAP1A6aAAMAAAENACCAAAAAAAAAAAAA',
        applicableSections: [2],
        description: 'GDPR compliance mode using Transparency & Consent Framework.'
    },
    'us_nat': {
        name: 'US National',
        flag: '🇺🇸',
        gppString: 'DBABLA~BVqqmSIA',
        applicableSections: [7],
        description: 'IAB US National Privacy string for multi-state compliance.'
    },
    'us_ca': {
        name: 'California (CCPA/CPRA)',
        flag: '🐻',
        gppString: 'DBABMA~BVqqmSIA',
        applicableSections: [8],
        description: 'California-specific privacy signals (Do Not Sell/Share).'
    },
    'us_va': {
        name: 'Virginia (VCDPA)',
        flag: '🏛️',
        gppString: 'DBABNA~BVqqmSIA',
        applicableSections: [9],
        description: 'Virginia-specific privacy signals for consumer data protection.'
    }
};
