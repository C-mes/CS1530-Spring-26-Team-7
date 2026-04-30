# This module implements some security features
# This is meant to protect against malformed input
# (type error, large inputs, data corruption)

from datetime import datetime

# Input limiters to prevent large inputs, adjust as needed
MAX_NAME_LEN = 128
MAX_DESC_LEN = 512
MAX_DATE_LEN = 64
MAX_AMOUNT = 1000000

# initialize this class
class SecError(Exception):
    pass #TODO make a more sophisticated Exception

# Sanity checks for strings.
def validate_str(val, max_len, field):
    if val is None:
        raise  SecError(f"{field} is required")
    if not isinstance(val, str):
        raise SecError(f"{field} not a string")
    val = val.strip()
    if len(val) == 0:
        raise SecError(f"{field} empty")
    if len(val) > max_len:
        raise SecError(f"{field} too long, maximum = {max_len}")
    return val

# Sanity checks for date inputs
# TODO: check with integration conflicts due to ISO date format
# requirement
def validate_date(val, max_len, field="exp"):
    if val == "":
        return None # exp is optional, default to 7 days in backend if not provided
    validate_str(val, max_len, field)
    try:
        datetime.fromisoformat(val)
    except ValueError:
        raise SecError(f"{field} must be in ISO date format (YYYY-MM-DD)")
    return val

# Primary validation function
def validate_item(data):
    if not isinstance(data, dict):
        raise SecError(f"Invalid JSON")

    trusted = {}

    if "name" in data:
        trusted["name"] = validate_str(data.get("name"),
                                          MAX_NAME_LEN,
                                          "name")
    if "desc" in data:
        trusted["desc"] = validate_str(data.get("desc"),
                                          MAX_DESC_LEN,
                                          "desc")

    # No need to validate exp, it is validated in the frontend and will be defaulted to today + 7 days if not provided                                     
    if "exp" in data:
        trusted["exp"] = validate_date(data.get("exp"),
                                       MAX_DATE_LEN,
                                       "exp")
        
    if "amount" in data:
        trusted["amount"] = validate_amount(data.get("amount"),
                                            "amount")
                                            
    return trusted

# Validating amount is not null, a float, and positive, and not above 
def validate_amount(val, field="amount"):
    if val is None:
        raise SecError(f"{field} is required")

    try:
        amount = float(val)
    except (TypeError, ValueError):
        raise SecError(f"{field} must be a number")

    if amount < 0:
        raise SecError(f"{field} cannot be negative")

    if amount > MAX_AMOUNT:
        raise SecError(f"{field} too large, maximum = {MAX_AMOUNT}")

    return amount