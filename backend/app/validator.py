import sqlparse

def is_safe_sql(sql: str) -> bool:
    parsed = sqlparse.parse(sql)
    if not parsed:
        return False
    for statement in parsed:
        if statement.get_type() != 'SELECT':
            return False
    return True