# Security Documentation

The security file, `security.py`, is mainly meant to prevent invalid inputs.
*Usage of security.py does not guarantee protection from SQL Injections!*
Discipline when programming database accesses must be ensured to prevent
SQLi. Namely, always use parameterized inputs: 

- UNSAFE: `cur.execute(f"SQL CODE HERE... where FIELD = '{userinput}'")`
- SAFE:   `cur.execute(f"SQL CODE HERE... where FIELD = ?", (userinput,))`

### Security Exception
The exception `SecError` is simply the name for the security exception. There
is no special functionality currently.

### Procedures
Function: `validate_item(data)`. This is the main validation function for JSON
inputs within the database.

- `data`: The raw JSON

Function: `validate_str(val, max_len, field)`. This performs sanity checks for
string inputs. Namely, that the input is not null, is a string, not empty, and
is within length constraints.

- `val`: the string to be checked
- `max_len`: the maximum allowed length, see [Constants](#Constants)
- `field`: name of the JSON field

Function: `validate_date(val, max_len, field="exp")`. This performs sanity checks for
date inputs. Namely, all of the checks within `validate_str` as well as the string
conforming to the ISO date format (YYYY-MM-DD).

- `val`: the string to be checked
- `max_len`: the maximum allowed length, see [Constants](#Constants)
- `field`: name of the JSON field

Function: `validate_amount(val, field="amount")`. This performs sanity checks for
float inputs, namely for the "amount" JSON field. Namely, it must exist, be a number,
and it cannot be negative.

- `val`: the string to be checked
- `field`: name of the JSON field

### Constants
- `MAX_NAME_LEN`: the maximum allowed name length, to prevent absurdly long names
- `MAX_DESC_LEN`: the maximum allowed description length, to prevent absurdly long descriptions
- `MAX_DATE_LEN`: the maximum allowed date input length
- `MAX_AMOUNT`: the maxmimum amount for the `amount` JSON field

