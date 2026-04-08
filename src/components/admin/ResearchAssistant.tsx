// src/components/admin/ResearchAssistant.tsx
// Research Assistant - Provides attorneys with direct links to official sources for ALL 50 states

'use client'

import { useState, useEffect, useRef } from 'react'
import {
  ExternalLink,
  Search,
  BookOpen,
  Gavel,
  FileText,
  Building2,
  AlertCircle,
  Scale,
  Clock,
  ChevronRight,
  ChevronDown,
  Link2,
  Globe,
  X,
  Minimize2,
  Maximize2,
  ChevronUp
} from 'lucide-react'

interface ResearchLink {
  title: string
  url: string
  description: string
  type: 'regulator' | 'statute' | 'enforcement' | 'license' | 'guidance'
}

interface StateResearchData {
  stateCode: string
  stateName: string
  regulatorName: string
  regulatorWebsite: string
  licenseLookupUrl: string | null
  statuteDatabaseUrl: string | null
  enforcementDatabaseUrl: string | null
  guidanceDocumentsUrl: string | null
  applicationPortalUrl: string | null
  contactPhone: string | null
  contactEmail: string | null
  notes: string | null
}

// Complete 50-state research data
const STATE_RESEARCH_DATA: Record<string, StateResearchData> = {
  AL: {
    stateCode: 'AL',
    stateName: 'Alabama',
    regulatorName: 'Alabama Banking Department',
    regulatorWebsite: 'https://banking.alabama.gov',
    licenseLookupUrl: 'https://banking.alabama.gov/money-transmitters',
    statuteDatabaseUrl: 'https://alison.legislature.state.al.us',
    enforcementDatabaseUrl: 'https://banking.alabama.gov/enforcement',
    guidanceDocumentsUrl: null,
    applicationPortalUrl: 'https://banking.alabama.gov/money-transmitters',
    contactPhone: '(334) 242-3452',
    contactEmail: null,
    notes: 'Money transmission rules apply to digital assets.'
  },
  AK: {
    stateCode: 'AK',
    stateName: 'Alaska',
    regulatorName: 'Alaska Division of Banking',
    regulatorWebsite: 'https://www.commerce.alaska.gov/web/dor',
    licenseLookupUrl: 'https://www.commerce.alaska.gov/web/dor/MoneyTransmitter',
    statuteDatabaseUrl: 'https://www.akleg.gov/basis/statutes.asp',
    enforcementDatabaseUrl: 'https://www.commerce.alaska.gov/web/dor/Enforcement',
    guidanceDocumentsUrl: null,
    applicationPortalUrl: 'https://www.commerce.alaska.gov/web/dor/MoneyTransmitter',
    contactPhone: '(907) 465-2521',
    contactEmail: null,
    notes: 'No state income tax. Money transmission rules apply to crypto.'
  },
  AZ: {
    stateCode: 'AZ',
    stateName: 'Arizona',
    regulatorName: 'Arizona DIFI',
    regulatorWebsite: 'https://difi.az.gov',
    licenseLookupUrl: 'https://difi.az.gov/banking',
    statuteDatabaseUrl: 'https://www.azleg.gov/ars/',
    enforcementDatabaseUrl: 'https://difi.az.gov/enforcement',
    guidanceDocumentsUrl: null,
    applicationPortalUrl: 'https://difi.az.gov/banking',
    contactPhone: '(602) 771-2800',
    contactEmail: null,
    notes: 'Cryptocurrency recognized for tax payments.'
  },
  AR: {
    stateCode: 'AR',
    stateName: 'Arkansas',
    regulatorName: 'Arkansas Securities Department',
    regulatorWebsite: 'https://securities.arkansas.gov',
    licenseLookupUrl: 'https://securities.arkansas.gov/money-transmitters',
    statuteDatabaseUrl: 'https://www.arkleg.state.ar.us/statutes',
    enforcementDatabaseUrl: 'https://securities.arkansas.gov/enforcement',
    guidanceDocumentsUrl: null,
    applicationPortalUrl: 'https://securities.arkansas.gov/money-transmitters',
    contactPhone: '(501) 324-9260',
    contactEmail: null,
    notes: 'Arkansas Money Transmission Act covers digital assets.'
  },
  CA: {
    stateCode: 'CA',
    stateName: 'California',
    regulatorName: 'California DFPI',
    regulatorWebsite: 'https://dfpi.ca.gov',
    licenseLookupUrl: 'https://dfpi.ca.gov/digital-financial-assets/',
    statuteDatabaseUrl: 'https://leginfo.legislature.ca.gov',
    enforcementDatabaseUrl: 'https://dfpi.ca.gov/enforcement-actions/',
    guidanceDocumentsUrl: 'https://dfpi.ca.gov/digital-financial-assets/',
    applicationPortalUrl: 'https://dfpi.ca.gov/licensees/',
    contactPhone: '(866) 275-2677',
    contactEmail: 'licensing@dfpi.ca.gov',
    notes: 'DFAL effective July 1, 2026. Money transmitter license required.'
  },
  CO: {
    stateCode: 'CO',
    stateName: 'Colorado',
    regulatorName: 'Colorado Division of Banking',
    regulatorWebsite: 'https://coag.gov',
    licenseLookupUrl: 'https://coag.gov/',
    statuteDatabaseUrl: 'https://leg.colorado.gov/',
    enforcementDatabaseUrl: 'https://coag.gov/enforcement/',
    guidanceDocumentsUrl: null,
    applicationPortalUrl: null,
    contactPhone: '(303) 894-7575',
    contactEmail: 'banking@state.co.us',
    notes: 'Colorado Digital Token Act exempts certain crypto from securities laws.'
  },
  CT: {
    stateCode: 'CT',
    stateName: 'Connecticut',
    regulatorName: 'Connecticut Department of Banking',
    regulatorWebsite: 'https://portal.ct.gov/DOB',
    licenseLookupUrl: 'https://portal.ct.gov/DOB/Money-Transmitters',
    statuteDatabaseUrl: 'https://www.cga.ct.gov/current/pub/titles.htm',
    enforcementDatabaseUrl: 'https://portal.ct.gov/DOB/Enforcement',
    guidanceDocumentsUrl: null,
    applicationPortalUrl: 'https://portal.ct.gov/DOB/Money-Transmitters',
    contactPhone: '(860) 240-8299',
    contactEmail: null,
    notes: 'Money transmission laws apply to virtual currency.'
  },
  DE: {
    stateCode: 'DE',
    stateName: 'Delaware',
    regulatorName: 'Delaware Office of the State Bank Commissioner',
    regulatorWebsite: 'https://banking.delaware.gov',
    licenseLookupUrl: 'https://banking.delaware.gov/money-transmitter-license',
    statuteDatabaseUrl: 'https://delcode.delaware.gov',
    enforcementDatabaseUrl: 'https://banking.delaware.gov/enforcement',
    guidanceDocumentsUrl: null,
    applicationPortalUrl: 'https://banking.delaware.gov/money-transmitter-license',
    contactPhone: '(302) 739-4235',
    contactEmail: null,
    notes: 'Corporate law hub. Blockchain stocks allowed.'
  },
  FL: {
    stateCode: 'FL',
    stateName: 'Florida',
    regulatorName: 'Florida OFR',
    regulatorWebsite: 'https://www.flofr.gov',
    licenseLookupUrl: 'https://www.flofr.gov/sitePages/Industry/moneytransmitter.htm',
    statuteDatabaseUrl: 'http://www.leg.state.fl.us/statutes',
    enforcementDatabaseUrl: 'https://www.flofr.gov/sitePages/Enforcement/enforcement.htm',
    guidanceDocumentsUrl: 'https://www.flofr.gov/sitePages/Industry/moneytransmitter.htm',
    applicationPortalUrl: 'https://www.flofr.gov/sitePages/Industry/moneytransmitter.htm',
    contactPhone: '(850) 487-9687',
    contactEmail: 'licensing@flofr.gov',
    notes: 'No state income tax. SB 198 (2026) kiosk regulations.'
  },
  GA: {
    stateCode: 'GA',
    stateName: 'Georgia',
    regulatorName: 'Georgia Department of Banking and Finance',
    regulatorWebsite: 'https://dbf.georgia.gov',
    licenseLookupUrl: 'https://dbf.georgia.gov/money-transmitters',
    statuteDatabaseUrl: 'https://law.justia.com/georgia/',
    enforcementDatabaseUrl: 'https://dbf.georgia.gov/enforcement',
    guidanceDocumentsUrl: null,
    applicationPortalUrl: 'https://dbf.georgia.gov/money-transmitters',
    contactPhone: '(770) 986-1633',
    contactEmail: null,
    notes: 'Supervisory exemption for banks.'
  },
  HI: {
    stateCode: 'HI',
    stateName: 'Hawaii',
    regulatorName: 'Hawaii Division of Financial Institutions',
    regulatorWebsite: 'https://dfi.hawaii.gov',
    licenseLookupUrl: 'https://dfi.hawaii.gov/money-transmitters',
    statuteDatabaseUrl: 'https://www.capitol.hawaii.gov',
    enforcementDatabaseUrl: 'https://dfi.hawaii.gov/enforcement',
    guidanceDocumentsUrl: null,
    applicationPortalUrl: 'https://dfi.hawaii.gov/money-transmitters',
    contactPhone: '(808) 586-2820',
    contactEmail: null,
    notes: 'Digital Currency Innovation Lab ended 2024. MTL required.'
  },
  ID: {
    stateCode: 'ID',
    stateName: 'Idaho',
    regulatorName: 'Idaho Department of Finance',
    regulatorWebsite: 'https://finance.idaho.gov',
    licenseLookupUrl: 'https://finance.idaho.gov/money-transmitters',
    statuteDatabaseUrl: 'https://legislature.idaho.gov/statutesrules/',
    enforcementDatabaseUrl: 'https://finance.idaho.gov/enforcement',
    guidanceDocumentsUrl: null,
    applicationPortalUrl: 'https://finance.idaho.gov/money-transmitters',
    contactPhone: '(208) 332-8000',
    contactEmail: null,
    notes: 'Money transmitter license required.'
  },
  IL: {
    stateCode: 'IL',
    stateName: 'Illinois',
    regulatorName: 'Illinois IDFPR',
    regulatorWebsite: 'https://idfpr.illinois.gov',
    licenseLookupUrl: 'https://idfpr.illinois.gov/banking/money-transmitters.html',
    statuteDatabaseUrl: 'https://www.ilga.gov/legislation',
    enforcementDatabaseUrl: 'https://idfpr.illinois.gov/enforcement',
    guidanceDocumentsUrl: null,
    applicationPortalUrl: 'https://idfpr.illinois.gov/banking/money-transmitters.html',
    contactPhone: '(217) 785-2900',
    contactEmail: null,
    notes: 'Digital Asset Regulatory Study completed 2025.'
  },
  IN: {
    stateCode: 'IN',
    stateName: 'Indiana',
    regulatorName: 'Indiana DFI',
    regulatorWebsite: 'https://www.in.gov/dfi',
    licenseLookupUrl: 'https://www.in.gov/dfi/money-transmitters',
    statuteDatabaseUrl: 'https://iga.in.gov/legislative/laws',
    enforcementDatabaseUrl: 'https://www.in.gov/dfi/enforcement',
    guidanceDocumentsUrl: null,
    applicationPortalUrl: 'https://www.in.gov/dfi/money-transmitters',
    contactPhone: '(317) 232-3955',
    contactEmail: null,
    notes: 'HB 1042 (2026) allows pension fund crypto investments.'
  },
  IA: {
    stateCode: 'IA',
    stateName: 'Iowa',
    regulatorName: 'Iowa Division of Banking',
    regulatorWebsite: 'https://idob.iowa.gov',
    licenseLookupUrl: 'https://idob.iowa.gov/money-transmitters',
    statuteDatabaseUrl: 'https://www.legis.iowa.gov/law',
    enforcementDatabaseUrl: 'https://idob.iowa.gov/enforcement',
    guidanceDocumentsUrl: null,
    applicationPortalUrl: 'https://idob.iowa.gov/money-transmitters',
    contactPhone: '(515) 281-4014',
    contactEmail: null,
    notes: 'Money transmission laws apply.'
  },
  KS: {
    stateCode: 'KS',
    stateName: 'Kansas',
    regulatorName: 'Kansas OSBC',
    regulatorWebsite: 'https://osbckansas.org',
    licenseLookupUrl: 'https://osbckansas.org/money-transmitters',
    statuteDatabaseUrl: 'https://www.kslegislature.org/li/b',
    enforcementDatabaseUrl: 'https://osbckansas.org/enforcement',
    guidanceDocumentsUrl: null,
    applicationPortalUrl: 'https://osbckansas.org/money-transmitters',
    contactPhone: '(785) 296-2266',
    contactEmail: null,
    notes: 'Money transmitter license required for crypto activities.'
  },
  KY: {
    stateCode: 'KY',
    stateName: 'Kentucky',
    regulatorName: 'Kentucky DFI',
    regulatorWebsite: 'https://kfi.ky.gov',
    licenseLookupUrl: 'https://kfi.ky.gov/money-transmitters',
    statuteDatabaseUrl: 'https://apps.legislature.ky.gov/law',
    enforcementDatabaseUrl: 'https://kfi.ky.gov/enforcement',
    guidanceDocumentsUrl: null,
    applicationPortalUrl: 'https://kfi.ky.gov/money-transmitters',
    contactPhone: '(502) 573-3390',
    contactEmail: null,
    notes: 'Friendly to crypto mining with tax incentives.'
  },
  LA: {
    stateCode: 'LA',
    stateName: 'Louisiana',
    regulatorName: 'Louisiana OFI',
    regulatorWebsite: 'https://ofi.la.gov',
    licenseLookupUrl: 'https://ofi.la.gov/money-transmitters',
    statuteDatabaseUrl: 'https://legis.la.gov/legis/Laws.aspx',
    enforcementDatabaseUrl: 'https://ofi.la.gov/enforcement',
    guidanceDocumentsUrl: null,
    applicationPortalUrl: 'https://ofi.la.gov/money-transmitters',
    contactPhone: '(225) 925-4660',
    contactEmail: null,
    notes: 'Blockchain laws being developed.'
  },
  ME: {
    stateCode: 'ME',
    stateName: 'Maine',
    regulatorName: 'Maine OFI',
    regulatorWebsite: 'https://www.maine.gov/pfr/professionallicensing/professions/financial-institutions',
    licenseLookupUrl: 'https://www.maine.gov/pfr/professionallicensing/professions/financial-institutions/money-transmitters',
    statuteDatabaseUrl: 'https://legislature.maine.gov/statutes',
    enforcementDatabaseUrl: 'https://www.maine.gov/pfr/professionallicensing/professions/financial-institutions/enforcement',
    guidanceDocumentsUrl: null,
    applicationPortalUrl: 'https://www.maine.gov/pfr/professionallicensing/professions/financial-institutions/money-transmitters',
    contactPhone: '(207) 624-8570',
    contactEmail: null,
    notes: 'Money transmitter license covers digital assets.'
  },
  MD: {
    stateCode: 'MD',
    stateName: 'Maryland',
    regulatorName: 'Maryland Office of Financial Regulation',
    regulatorWebsite: 'https://www.dllr.state.md.us/finance',
    licenseLookupUrl: 'https://www.dllr.state.md.us/finance/moneytransmitters.shtml',
    statuteDatabaseUrl: 'https://mgaleg.maryland.gov/mgawebsite/Laws',
    enforcementDatabaseUrl: 'https://www.dllr.state.md.us/finance/enforcement.shtml',
    guidanceDocumentsUrl: null,
    applicationPortalUrl: 'https://www.dllr.state.md.us/finance/moneytransmitters.shtml',
    contactPhone: '(410) 230-6100',
    contactEmail: null,
    notes: 'Financial technology sandbox available.'
  },
  MA: {
    stateCode: 'MA',
    stateName: 'Massachusetts',
    regulatorName: 'Massachusetts Division of Banks',
    regulatorWebsite: 'https://www.mass.gov/orgs/division-of-banks',
    licenseLookupUrl: 'https://www.mass.gov/orgs/division-of-banks/money-transmitters',
    statuteDatabaseUrl: 'https://malegislature.gov/Laws',
    enforcementDatabaseUrl: 'https://www.mass.gov/orgs/division-of-banks/enforcement',
    guidanceDocumentsUrl: null,
    applicationPortalUrl: 'https://www.mass.gov/orgs/division-of-banks/money-transmitters',
    contactPhone: '(617) 956-1500',
    contactEmail: null,
    notes: 'Strict securities enforcement. MTL required.'
  },
  MI: {
    stateCode: 'MI',
    stateName: 'Michigan',
    regulatorName: 'Michigan DIFS',
    regulatorWebsite: 'https://www.michigan.gov/difs',
    licenseLookupUrl: 'https://www.michigan.gov/difs/money-transmitters',
    statuteDatabaseUrl: 'http://legislature.mi.gov',
    enforcementDatabaseUrl: 'https://www.michigan.gov/difs/enforcement',
    guidanceDocumentsUrl: null,
    applicationPortalUrl: 'https://www.michigan.gov/difs/money-transmitters',
    contactPhone: '(517) 284-8800',
    contactEmail: null,
    notes: 'HB 4119 (2025) established digital asset framework.'
  },
  MN: {
    stateCode: 'MN',
    stateName: 'Minnesota',
    regulatorName: 'Minnesota Department of Commerce',
    regulatorWebsite: 'https://mn.gov/commerce',
    licenseLookupUrl: 'https://mn.gov/commerce/money-transmitters',
    statuteDatabaseUrl: 'https://www.revisor.mn.gov/statutes',
    enforcementDatabaseUrl: 'https://mn.gov/commerce/enforcement',
    guidanceDocumentsUrl: null,
    applicationPortalUrl: 'https://mn.gov/commerce/money-transmitters',
    contactPhone: '(651) 539-1500',
    contactEmail: null,
    notes: 'Money transmission laws apply to crypto.'
  },
  MS: {
    stateCode: 'MS',
    stateName: 'Mississippi',
    regulatorName: 'Mississippi Department of Banking',
    regulatorWebsite: 'https://www.dbms.ms.gov',
    licenseLookupUrl: 'https://www.dbms.ms.gov/money-transmitters',
    statuteDatabaseUrl: 'https://www.sos.ms.gov/legislation',
    enforcementDatabaseUrl: 'https://www.dbms.ms.gov/enforcement',
    guidanceDocumentsUrl: null,
    applicationPortalUrl: 'https://www.dbms.ms.gov/money-transmitters',
    contactPhone: '(601) 965-1818',
    contactEmail: null,
    notes: 'Money transmission rules apply.'
  },
  MO: {
    stateCode: 'MO',
    stateName: 'Missouri',
    regulatorName: 'Missouri Division of Finance',
    regulatorWebsite: 'https://finance.mo.gov',
    licenseLookupUrl: 'https://finance.mo.gov/money-transmitters',
    statuteDatabaseUrl: 'https://revisor.mo.gov',
    enforcementDatabaseUrl: 'https://finance.mo.gov/enforcement',
    guidanceDocumentsUrl: null,
    applicationPortalUrl: 'https://finance.mo.gov/money-transmitters',
    contactPhone: '(573) 751-3392',
    contactEmail: null,
    notes: 'Generally business-friendly.'
  },
  MT: {
    stateCode: 'MT',
    stateName: 'Montana',
    regulatorName: 'Montana Division of Banking',
    regulatorWebsite: 'https://banking.mt.gov',
    licenseLookupUrl: 'https://banking.mt.gov/money-transmitters',
    statuteDatabaseUrl: 'https://leg.mt.gov/bills/mca',
    enforcementDatabaseUrl: 'https://banking.mt.gov/enforcement',
    guidanceDocumentsUrl: null,
    applicationPortalUrl: 'https://banking.mt.gov/money-transmitters',
    contactPhone: '(406) 444-2091',
    contactEmail: null,
    notes: 'No sales tax. HB 238 (2025) protected crypto mining rights.'
  },
  NE: {
    stateCode: 'NE',
    stateName: 'Nebraska',
    regulatorName: 'Nebraska Department of Banking',
    regulatorWebsite: 'https://banking.nebraska.gov',
    licenseLookupUrl: 'https://banking.nebraska.gov/money-transmitters',
    statuteDatabaseUrl: 'https://nebraskalegislature.gov/laws',
    enforcementDatabaseUrl: 'https://banking.nebraska.gov/enforcement',
    guidanceDocumentsUrl: null,
    applicationPortalUrl: 'https://banking.nebraska.gov/money-transmitters',
    contactPhone: '(402) 471-2171',
    contactEmail: null,
    notes: 'Digital asset banking framework available.'
  },
  NV: {
    stateCode: 'NV',
    stateName: 'Nevada',
    regulatorName: 'Nevada FID',
    regulatorWebsite: 'https://fid.nv.gov',
    licenseLookupUrl: 'https://fid.nv.gov/banking',
    statuteDatabaseUrl: 'https://www.leg.state.nv.us/law',
    enforcementDatabaseUrl: 'https://fid.nv.gov/enforcement',
    guidanceDocumentsUrl: null,
    applicationPortalUrl: 'https://fid.nv.gov/banking',
    contactPhone: '(775) 684-1830',
    contactEmail: null,
    notes: 'No state income tax. Blockchain technology encouraged.'
  },
  NH: {
    stateCode: 'NH',
    stateName: 'New Hampshire',
    regulatorName: 'NH Banking Department',
    regulatorWebsite: 'https://www.nh.gov/banking',
    licenseLookupUrl: 'https://www.nh.gov/banking/money-transmitters',
    statuteDatabaseUrl: 'http://www.gencourt.state.nh.us/rsa',
    enforcementDatabaseUrl: 'https://www.nh.gov/banking/enforcement',
    guidanceDocumentsUrl: null,
    applicationPortalUrl: 'https://www.nh.gov/banking/money-transmitters',
    contactPhone: '(603) 271-3561',
    contactEmail: null,
    notes: 'Limited Purpose Money Transmitter license available for crypto.'
  },
  NJ: {
    stateCode: 'NJ',
    stateName: 'New Jersey',
    regulatorName: 'NJ DOBI',
    regulatorWebsite: 'https://www.nj.gov/dobi',
    licenseLookupUrl: 'https://www.nj.gov/dobi/banklicensing/moneytransmitters.shtml',
    statuteDatabaseUrl: 'https://pub.njleg.state.nj.us',
    enforcementDatabaseUrl: 'https://www.nj.gov/dobi/enforcement/',
    guidanceDocumentsUrl: null,
    applicationPortalUrl: 'https://www.nj.gov/dobi/banklicensing/moneytransmitters.shtml',
    contactPhone: '(609) 292-7272',
    contactEmail: null,
    notes: 'Digital Asset and Blockchain Technology Act fully effective.'
  },
  NM: {
    stateCode: 'NM',
    stateName: 'New Mexico',
    regulatorName: 'New Mexico FID',
    regulatorWebsite: 'https://www.rld.nm.gov/financial-institutions',
    licenseLookupUrl: 'https://www.rld.nm.gov/financial-institutions/money-transmitters',
    statuteDatabaseUrl: 'https://nmonesource.com',
    enforcementDatabaseUrl: 'https://www.rld.nm.gov/financial-institutions/enforcement',
    guidanceDocumentsUrl: null,
    applicationPortalUrl: 'https://www.rld.nm.gov/financial-institutions/money-transmitters',
    contactPhone: '(505) 476-4885',
    contactEmail: null,
    notes: 'Money transmission laws apply.'
  },
  NY: {
    stateCode: 'NY',
    stateName: 'New York',
    regulatorName: 'NYDFS',
    regulatorWebsite: 'https://www.dfs.ny.gov',
    licenseLookupUrl: 'https://www.dfs.ny.gov/apps_and_licensing/virtual_currency_businesses',
    statuteDatabaseUrl: 'https://www.nysenate.gov/legislation/laws/BNK',
    enforcementDatabaseUrl: 'https://www.dfs.ny.gov/enforcement',
    guidanceDocumentsUrl: 'https://www.dfs.ny.gov/virtual_currency_industry_guidance',
    applicationPortalUrl: 'https://www.dfs.ny.gov/apps_and_licensing',
    contactPhone: '(212) 709-3500',
    contactEmail: 'licensing@dfs.ny.gov',
    notes: 'BitLicense required. CRYPTO Act (2026) makes unlicensed activity criminal.'
  },
  NC: {
    stateCode: 'NC',
    stateName: 'North Carolina',
    regulatorName: 'North Carolina Commissioner of Banks',
    regulatorWebsite: 'https://www.ncdoi.gov',
    licenseLookupUrl: 'https://www.ncdoi.gov/money-transmitters',
    statuteDatabaseUrl: 'https://www.ncleg.gov/laws',
    enforcementDatabaseUrl: 'https://www.ncdoi.gov/enforcement',
    guidanceDocumentsUrl: null,
    applicationPortalUrl: 'https://www.ncdoi.gov/money-transmitters',
    contactPhone: '(919) 733-3016',
    contactEmail: null,
    notes: 'Money transmission laws apply. SB 270 (2025) study committee.'
  },
  ND: {
    stateCode: 'ND',
    stateName: 'North Dakota',
    regulatorName: 'North Dakota DFI',
    regulatorWebsite: 'https://www.nddfi.gov',
    licenseLookupUrl: 'https://www.nddfi.gov/money-transmitters',
    statuteDatabaseUrl: 'https://www.legis.nd.gov/law',
    enforcementDatabaseUrl: 'https://www.nddfi.gov/enforcement',
    guidanceDocumentsUrl: null,
    applicationPortalUrl: 'https://www.nddfi.gov/money-transmitters',
    contactPhone: '(701) 328-9933',
    contactEmail: null,
    notes: 'HB 1183 (2025) authorized study of digital asset adoption.'
  },
  OH: {
    stateCode: 'OH',
    stateName: 'Ohio',
    regulatorName: 'Ohio Division of Financial Institutions',
    regulatorWebsite: 'https://com.ohio.gov/divisions-and-programs/financial-institutions',
    licenseLookupUrl: 'https://com.ohio.gov/divisions-and-programs/financial-institutions/money-transmitters',
    statuteDatabaseUrl: 'https://codes.ohio.gov',
    enforcementDatabaseUrl: 'https://com.ohio.gov/divisions-and-programs/financial-institutions/enforcement',
    guidanceDocumentsUrl: null,
    applicationPortalUrl: 'https://com.ohio.gov/divisions-and-programs/financial-institutions/money-transmitters',
    contactPhone: '(614) 728-8400',
    contactEmail: null,
    notes: 'Ohio Blockchain Initiative active.'
  },
  OK: {
    stateCode: 'OK',
    stateName: 'Oklahoma',
    regulatorName: 'Oklahoma Banking Department',
    regulatorWebsite: 'https://oklahoma.gov/banking.html',
    licenseLookupUrl: 'https://oklahoma.gov/banking/money-transmitters.html',
    statuteDatabaseUrl: 'https://oksenate.gov/legislation',
    enforcementDatabaseUrl: 'https://oklahoma.gov/banking/enforcement.html',
    guidanceDocumentsUrl: null,
    applicationPortalUrl: 'https://oklahoma.gov/banking/money-transmitters.html',
    contactPhone: '(405) 521-2782',
    contactEmail: null,
    notes: 'HB 1596 (2025) protected crypto mining and self-custody rights.'
  },
  OR: {
    stateCode: 'OR',
    stateName: 'Oregon',
    regulatorName: 'Oregon DFCS',
    regulatorWebsite: 'https://dfr.oregon.gov',
    licenseLookupUrl: 'https://dfr.oregon.gov/business/money-transmitters/Pages/index.aspx',
    statuteDatabaseUrl: 'https://www.oregonlegislature.gov/bills_laws',
    enforcementDatabaseUrl: 'https://dfr.oregon.gov/enforcement/Pages/index.aspx',
    guidanceDocumentsUrl: null,
    applicationPortalUrl: 'https://dfr.oregon.gov/business/money-transmitters/Pages/index.aspx',
    contactPhone: '(503) 378-4140',
    contactEmail: null,
    notes: 'Money transmission laws apply.'
  },
  PA: {
    stateCode: 'PA',
    stateName: 'Pennsylvania',
    regulatorName: 'Pennsylvania Department of Banking',
    regulatorWebsite: 'https://www.dobs.pa.gov',
    licenseLookupUrl: 'https://www.dobs.pa.gov/Money-Transmitters',
    statuteDatabaseUrl: 'https://www.legis.state.pa.us',
    enforcementDatabaseUrl: 'https://www.dobs.pa.gov/Enforcement',
    guidanceDocumentsUrl: null,
    applicationPortalUrl: 'https://www.dobs.pa.gov/Money-Transmitters',
    contactPhone: '(717) 787-1857',
    contactEmail: null,
    notes: 'Guidance issued. Money transmitter license required.'
  },
  RI: {
    stateCode: 'RI',
    stateName: 'Rhode Island',
    regulatorName: 'Rhode Island Division of Banking',
    regulatorWebsite: 'https://dbr.ri.gov/banking',
    licenseLookupUrl: 'https://dbr.ri.gov/banking/money-transmitters',
    statuteDatabaseUrl: 'http://webserver.rilin.state.ri.us/Statutes',
    enforcementDatabaseUrl: 'https://dbr.ri.gov/banking/enforcement',
    guidanceDocumentsUrl: null,
    applicationPortalUrl: 'https://dbr.ri.gov/banking/money-transmitters',
    contactPhone: '(401) 462-9500',
    contactEmail: null,
    notes: 'Money transmitter license required.'
  },
  SC: {
    stateCode: 'SC',
    stateName: 'South Carolina',
    regulatorName: 'South Carolina BFI',
    regulatorWebsite: 'https://consumer.sc.gov',
    licenseLookupUrl: 'https://consumer.sc.gov/money-transmitters',
    statuteDatabaseUrl: 'https://www.scstatehouse.gov/statues.php',
    enforcementDatabaseUrl: 'https://consumer.sc.gov/enforcement',
    guidanceDocumentsUrl: null,
    applicationPortalUrl: 'https://consumer.sc.gov/money-transmitters',
    contactPhone: '(803) 734-2000',
    contactEmail: null,
    notes: 'Money transmission rules apply.'
  },
  SD: {
    stateCode: 'SD',
    stateName: 'South Dakota',
    regulatorName: 'South Dakota Division of Banking',
    regulatorWebsite: 'https://dlr.sd.gov/banking',
    licenseLookupUrl: 'https://dlr.sd.gov/banking/money_transmitters.aspx',
    statuteDatabaseUrl: 'https://sdlegislature.gov/Statutes',
    enforcementDatabaseUrl: 'https://dlr.sd.gov/banking/enforcement.aspx',
    guidanceDocumentsUrl: null,
    applicationPortalUrl: 'https://dlr.sd.gov/banking/money_transmitters.aspx',
    contactPhone: '(605) 773-3421',
    contactEmail: null,
    notes: 'No state income tax. Low licensing fees.'
  },
  TN: {
    stateCode: 'TN',
    stateName: 'Tennessee',
    regulatorName: 'Tennessee DFI',
    regulatorWebsite: 'https://www.tn.gov/tdfi.html',
    licenseLookupUrl: 'https://www.tn.gov/tdfi/money-transmitters.html',
    statuteDatabaseUrl: 'https://publications.tnsosfiles.com',
    enforcementDatabaseUrl: 'https://www.tn.gov/tdfi/enforcement.html',
    guidanceDocumentsUrl: null,
    applicationPortalUrl: 'https://www.tn.gov/tdfi/money-transmitters.html',
    contactPhone: '(615) 741-2237',
    contactEmail: null,
    notes: 'No state income tax. HB 1745 (2025) protected crypto rights.'
  },
  TX: {
    stateCode: 'TX',
    stateName: 'Texas',
    regulatorName: 'Texas Department of Banking',
    regulatorWebsite: 'https://www.dob.texas.gov',
    licenseLookupUrl: 'https://www.dob.texas.gov/money-services-businesses',
    statuteDatabaseUrl: 'https://statutes.capitol.texas.gov',
    enforcementDatabaseUrl: 'https://www.dob.texas.gov/enforcement',
    guidanceDocumentsUrl: 'https://www.dob.texas.gov/money-services-businesses',
    applicationPortalUrl: 'https://www.dob.texas.gov/money-services-businesses',
    contactPhone: '(877) 276-5554',
    contactEmail: 'info@dob.texas.gov',
    notes: 'Very crypto-friendly. No state income tax.'
  },
  UT: {
    stateCode: 'UT',
    stateName: 'Utah',
    regulatorName: 'Utah DFI',
    regulatorWebsite: 'https://dfi.utah.gov',
    licenseLookupUrl: 'https://dfi.utah.gov/banking',
    statuteDatabaseUrl: 'https://le.utah.gov/xcode/code.html',
    enforcementDatabaseUrl: 'https://dfi.utah.gov/enforcement',
    guidanceDocumentsUrl: null,
    applicationPortalUrl: 'https://dfi.utah.gov/banking',
    contactPhone: '(801) 538-8830',
    contactEmail: null,
    notes: 'Blockchain regulatory sandbox. DAO framework established.'
  },
  VT: {
    stateCode: 'VT',
    stateName: 'Vermont',
    regulatorName: 'Vermont Department of Financial Regulation',
    regulatorWebsite: 'https://dfr.vermont.gov',
    licenseLookupUrl: 'https://dfr.vermont.gov/banking/money-transmitters',
    statuteDatabaseUrl: 'https://legislature.vermont.gov/statutes',
    enforcementDatabaseUrl: 'https://dfr.vermont.gov/enforcement',
    guidanceDocumentsUrl: null,
    applicationPortalUrl: 'https://dfr.vermont.gov/banking/money-transmitters',
    contactPhone: '(802) 828-3301',
    contactEmail: null,
    notes: 'Money transmission rules apply.'
  },
  VA: {
    stateCode: 'VA',
    stateName: 'Virginia',
    regulatorName: 'Virginia Bureau of Financial Institutions',
    regulatorWebsite: 'https://www.scc.virginia.gov/pages/Financial-Institutions',
    licenseLookupUrl: 'https://www.scc.virginia.gov/pages/Money-Transmitters',
    statuteDatabaseUrl: 'https://law.lis.virginia.gov/vacode',
    enforcementDatabaseUrl: 'https://www.scc.virginia.gov/pages/Enforcement',
    guidanceDocumentsUrl: null,
    applicationPortalUrl: 'https://www.scc.virginia.gov/pages/Money-Transmitters',
    contactPhone: '(804) 371-9657',
    contactEmail: null,
    notes: 'Blockchain technology encouraged.'
  },
  WA: {
    stateCode: 'WA',
    stateName: 'Washington',
    regulatorName: 'Washington DFI',
    regulatorWebsite: 'https://dfi.wa.gov',
    licenseLookupUrl: 'https://dfi.wa.gov/money-transmitter-licensing',
    statuteDatabaseUrl: 'https://apps.leg.wa.gov/rcw/',
    enforcementDatabaseUrl: 'https://dfi.wa.gov/enforcement',
    guidanceDocumentsUrl: 'https://dfi.wa.gov/money-transmitter-licensing',
    applicationPortalUrl: 'https://dfi.wa.gov/money-transmitter-licensing',
    contactPhone: '(360) 902-8700',
    contactEmail: 'banking@dfi.wa.gov',
    notes: 'Strict regulations. Uniform Money Services Act applies.'
  },
  WV: {
    stateCode: 'WV',
    stateName: 'West Virginia',
    regulatorName: 'West Virginia DFI',
    regulatorWebsite: 'https://dfi.wv.gov',
    licenseLookupUrl: 'https://dfi.wv.gov/money-transmitters',
    statuteDatabaseUrl: 'https://www.wvlegislature.gov',
    enforcementDatabaseUrl: 'https://dfi.wv.gov/enforcement',
    guidanceDocumentsUrl: null,
    applicationPortalUrl: 'https://dfi.wv.gov/money-transmitters',
    contactPhone: '(304) 558-2294',
    contactEmail: null,
    notes: 'Money transmission rules apply.'
  },
  WI: {
    stateCode: 'WI',
    stateName: 'Wisconsin',
    regulatorName: 'Wisconsin DFI',
    regulatorWebsite: 'https://www.wdfi.org',
    licenseLookupUrl: 'https://www.wdfi.org/money-transmitters',
    statuteDatabaseUrl: 'https://docs.legis.wisconsin.gov/statutes',
    enforcementDatabaseUrl: 'https://www.wdfi.org/enforcement',
    guidanceDocumentsUrl: null,
    applicationPortalUrl: 'https://www.wdfi.org/money-transmitters',
    contactPhone: '(608) 261-9555',
    contactEmail: null,
    notes: 'SB 517 (2025) authorized pension fund crypto investments.'
  },
  WY: {
    stateCode: 'WY',
    stateName: 'Wyoming',
    regulatorName: 'Wyoming Division of Banking',
    regulatorWebsite: 'https://wyomingbankingdivision.wyo.gov',
    licenseLookupUrl: 'https://wyomingbankingdivision.wyo.gov/banking/money-transmitters',
    statuteDatabaseUrl: 'https://wyoleg.gov/statutes',
    enforcementDatabaseUrl: 'https://wyomingbankingdivision.wyo.gov/enforcement',
    guidanceDocumentsUrl: null,
    applicationPortalUrl: 'https://wyomingbankingdivision.wyo.gov/banking/money-transmitters',
    contactPhone: '(307) 777-7797',
    contactEmail: 'banking@wyo.gov',
    notes: 'Most crypto-friendly state. SPDI bank charters available.'
  }
}

interface ResearchAssistantProps {
  stateCode: string
  onSourceUrlFound?: (url: string, sourceName: string) => void
}

export default function ResearchAssistant({ stateCode, onSourceUrlFound }: ResearchAssistantProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [researchData, setResearchData] = useState<StateResearchData | null>(null)
  const [customUrl, setCustomUrl] = useState('')
  const [customSourceName, setCustomSourceName] = useState('')
  const [showCustomInput, setShowCustomInput] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Load research data for the selected state
    const data = STATE_RESEARCH_DATA[stateCode as keyof typeof STATE_RESEARCH_DATA]
    if (data) {
      setResearchData(data)
    } else {
      // Default/generic research data for states not in our map
      setResearchData({
        stateCode,
        stateName: stateCode,
        regulatorName: `${stateCode} Department of Banking`,
        regulatorWebsite: `https://www.google.com/search?q=${encodeURIComponent(stateCode)}%20money%20transmitter%20license`,
        licenseLookupUrl: null,
        statuteDatabaseUrl: null,
        enforcementDatabaseUrl: null,
        guidanceDocumentsUrl: null,
        applicationPortalUrl: null,
        contactPhone: null,
        contactEmail: null,
        notes: 'Research needed. Use Google search to find official regulator website.'
      })
    }
  }, [stateCode])

   // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setShowCustomInput(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleUseSource = (url: string, sourceName: string) => {
    if (onSourceUrlFound) {
      onSourceUrlFound(url, sourceName)
    }
  }

  const researchLinks: ResearchLink[] = [
    ...(researchData?.regulatorWebsite ? [{
      title: `${researchData?.regulatorName || 'Regulator'} Website`,
      url: researchData.regulatorWebsite,
      description: 'Official regulator homepage',
      type: 'regulator' as const
    }] : []),
    ...(researchData?.licenseLookupUrl ? [{
      title: 'License Requirements',
      url: researchData.licenseLookupUrl,
      description: 'Official licensing requirements and application details',
      type: 'license' as const
    }] : []),
    ...(researchData?.statuteDatabaseUrl ? [{
      title: 'Statute Database',
      url: researchData.statuteDatabaseUrl,
      description: 'State laws and regulations',
      type: 'statute' as const
    }] : []),
    ...(researchData?.enforcementDatabaseUrl ? [{
      title: 'Enforcement Actions',
      url: researchData.enforcementDatabaseUrl,
      description: 'Recent enforcement actions and settlements',
      type: 'enforcement' as const
    }] : []),
    ...(researchData?.guidanceDocumentsUrl ? [{
      title: 'Guidance Documents',
      url: researchData.guidanceDocumentsUrl,
      description: 'Official guidance and interpretations',
      type: 'guidance' as const
    }] : []),
    ...(researchData?.applicationPortalUrl ? [{
      title: 'Application Portal',
      url: researchData.applicationPortalUrl,
      description: 'License application portal',
      type: 'license' as const
    }] : [])
  ]

  const getIcon = (type: ResearchLink['type']) => {
    switch (type) {
      case 'regulator':
        return <Building2 className="w-4 h-4" />
      case 'statute':
        return <BookOpen className="w-4 h-4" />
      case 'enforcement':
        return <Gavel className="w-4 h-4" />
      case 'license':
        return <FileText className="w-4 h-4" />
      case 'guidance':
        return <Scale className="w-4 h-4" />
      default:
        return <Link2 className="w-4 h-4" />
    }
  }

  if (!researchData) return null

  // Minimized view - just a small button
  if (isMinimized) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-6 right-6 z-50 bg-navy-900 text-white p-3 rounded-full shadow-lg hover:bg-navy-800 transition-all group"
        title="Open Research Assistant"
      >
        <Search className="w-5 h-5" />
      </button>
    )
  }

   return (
    <div className="relative" ref={dropdownRef}>
      {/* Research Assistant Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
      >
        <Search className="w-4 h-4 text-gold-600" />
        <span className="text-sm font-medium text-gray-700">Research Assistant</span>
        {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 min-w-[300px] bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 bg-navy-900 text-white">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              <span className="font-medium">Research Assistant</span>
              <span className="text-xs text-navy-300">| {researchData.stateCode}</span>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
            {/* Regulator Info */}
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-blue-900">Regulator</span>
              </div>
              <p className="text-sm text-blue-800">{researchData.regulatorName}</p>
              {researchData.contactPhone && (
                <p className="text-xs text-blue-600 mt-1">📞 {researchData.contactPhone}</p>
              )}
              {researchData.contactEmail && (
                <p className="text-xs text-blue-600">✉️ {researchData.contactEmail}</p>
              )}
            </div>

            {/* Quick Research Links */}
            <div>
              <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                Quick Research Links
              </h4>
              <div className="space-y-2">
                {researchLinks.map((link, idx) => (
                  <a
                    key={idx}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-2 p-2 hover:bg-gray-50 rounded-lg transition-colors group"
                  >
                    <div className="text-gray-400 group-hover:text-gold-600">
                      {getIcon(link.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-medium text-gray-700">{link.title}</span>
                        <ExternalLink className="w-3 h-3 text-gray-400" />
                      </div>
                      <p className="text-xs text-gray-500">{link.description}</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        handleUseSource(link.url, link.title)
                      }}
                      className="text-xs text-gold-600 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
                    >
                      Use Source
                    </button>
                  </a>
                ))}
              </div>
            </div>

            {/* Google Search Fallback */}
            <div>
              <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                Search Online
              </h4>
              <a
                href={`https://www.google.com/search?q=${encodeURIComponent(researchData.stateCode)}%20money%20transmitter%20license%20requirements`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Globe className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-700">Google: {researchData.stateCode} license requirements</span>
                <ExternalLink className="w-3 h-3 text-gray-400 ml-auto" />
              </a>
            </div>

            {/* Custom URL Input */}
            <div>
              <button
                onClick={() => setShowCustomInput(!showCustomInput)}
                className="text-xs text-gold-600 hover:text-gold-700 flex items-center gap-1"
              >
                <Link2 className="w-3 h-3" />
                Add custom source URL
              </button>
              
              {showCustomInput && (
                <div className="mt-2 space-y-2">
                  <input
                    type="text"
                    placeholder="Source name (e.g., NYDFS Official)"
                    value={customSourceName}
                    onChange={(e) => setCustomSourceName(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg"
                  />
                  <input
                    type="url"
                    placeholder="Source URL"
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg"
                  />
                  <button
                    onClick={() => {
                      if (customUrl && customSourceName) {
                        handleUseSource(customUrl, customSourceName)
                        setCustomUrl('')
                        setCustomSourceName('')
                        setShowCustomInput(false)
                      }
                    }}
                    className="w-full px-3 py-1 bg-gold-600 text-white text-sm rounded-lg hover:bg-gold-700"
                  >
                    Add to Source Verification
                  </button>
                </div>
              )}
            </div>

            {/* Notes */}
            {researchData.notes && (
              <div className="p-2 bg-yellow-50 rounded-lg text-xs text-yellow-700">
                <span className="font-medium">Note:</span> {researchData.notes}
              </div>
            )}

            {/* Verification Tip */}
            <div className="p-2 bg-gray-50 rounded-lg text-xs text-gray-500 flex items-start gap-2">
              <AlertCircle className="w-3 h-3 text-gray-400 mt-0.5" />
              <span>Always verify information directly from official sources before marking as verified.</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}