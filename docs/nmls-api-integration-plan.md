# NMLS/CSBS API Integration Blueprint

## Overview

The Nationwide Multistate Licensing System (NMLS) is the official source for money transmitter licensing data. CSBS (Conference of State Bank Supervisors) provides aggregated regulatory data. Integrating these sources will provide real-time, verified regulatory facts.

## Why NMLS/CSBS?

| Source | Trust Level | Coverage | Update Frequency |
|--------|------------|----------|------------------|
| AI-Generated | ❌ Low | Full | Never |
| Manual Attorney | ✅ High | Partial | On review |
| **NMLS API** | ✅✅ Very High | Money Transmitters | Real-time |
| **CSBS API** | ✅✅ Very High | All States | Daily |

## API Endpoints

### NMLS Public API

NMLS provides a public API for money transmitter licensing data. Request access at [NMLS.org](https://www.nmls.org/).

```http
# Get license requirements by state
GET /api/v1/money-transmitter-license/{state_code}

# Response example
{
  "state": "NY",
  "license_name": "BitLicense",
  "license_type": "Money Transmitter",
  "application_fee": 5000,
  "application_fee_unit": "USD",
  "annual_renewal_fee": 5000,
  "bond_requirement_min": 250000,
  "bond_requirement_max": 500000,
  "net_worth_requirement": 500000,
  "processing_time_min_months": 12,
  "processing_time_max_months": 18,
  "source_url": "https://www.dfs.ny.gov/apps_and_licensing/virtual_currency_businesses",
  "last_updated": "2026-03-01"
}