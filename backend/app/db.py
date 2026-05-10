import psycopg2

def get_connection(connection_string: str):
    return psycopg2.connect(connection_string)

def get_schema(connection_string: str) -> str:
    conn = get_connection(connection_string)
    cursor = conn.cursor()
    cursor.execute("""
        SELECT table_name, column_name, data_type
        FROM information_schema.columns
        WHERE table_schema = 'public'
        ORDER BY table_name, ordinal_position;
    """)
    rows = cursor.fetchall()
    cursor.close()
    conn.close()

    schema = {}
    for table, column, dtype in rows:
        if table not in schema:
            schema[table] = []
        schema[table].append(f"{column} ({dtype})")

    result = ""
    for table, columns in schema.items():
        result += f"Table: {table}\n"
        result += "  Columns: " + ", ".join(columns) + "\n\n"
    return result

def run_query(sql: str, connection_string: str) -> list[dict]:
    conn = get_connection(connection_string)
    cursor = conn.cursor()
    cursor.execute(sql)
    columns = [desc[0] for desc in cursor.description]
    rows = cursor.fetchall()
    cursor.close()
    conn.close()
    return [dict(zip(columns, row)) for row in rows]