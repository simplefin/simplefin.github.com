# v2.0.0 - 2026-03-19

- **BREAKING CHANGE:** Deprecated `errors` list on `AccountSet` object in favor of new `errlist` list for structured errors.
- **BREAKING CHANGE:** Deprecated `Organization` object in favor of new, flatter `Connection` object.
- **NEW:** Added `GET /accounts?balances-only=1` parameter to skip fetching account transaction data.
- **NEW:** Added `connections` list to `AccountSet`
- **NEW:** Added `GET /accounts?account=` parameter for filtering which accounts are returned.
- **NEW:** Added `conn_id` to `Account` object to disambiguate between two different logins to the same bank.

# v1.0.7

- Started this changelog
