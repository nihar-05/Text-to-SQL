from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
import os
from dotenv import load_dotenv

load_dotenv()

llm = ChatGroq(
    api_key=os.getenv("GROQ_API_KEY"),
    model="llama-3.3-70b-versatile",
    temperature=0
)

def generate_sql(question: str, schema: str) -> str:
    prompt = ChatPromptTemplate.from_messages([
        ("system", """You are an expert SQL generator. 
Given a database schema and a user question, generate a valid PostgreSQL SELECT query.
Return ONLY the SQL query, nothing else. No explanation, no markdown, no backticks.
Only SELECT statements are allowed.
If the question is too vague or ambiguous to generate a meaningful SQL query, return exactly: SELECT 'AMBIGUOUS_QUERY' AS error"""),
        ("human", "Schema:\n{schema}\n\nQuestion: {question}")
    ])
    chain = prompt | llm
    response = chain.invoke({"schema": schema, "question": question})
    return response.content.strip()

async def format_answer_stream(question: str, results: list[dict]):
    prompt = ChatPromptTemplate.from_messages([
        ("system", """You are a helpful data assistant.
You will be given a question and the exact database query results that answer it.
Summarize the results in a clear, concise natural language response.
Always use the provided data — never say you need more information.
Never mention SQL, tables, or database internals in your response.
If the results seem ambiguous or don't directly answer the question, explain what the data actually shows instead of guessing."""),
        ("human", "Question: {question}\n\nQuery Results: {results}\n\nProvide a clear answer based strictly on the above results.")
    ])
    chain = prompt | llm
    async for chunk in chain.astream({"question": question, "results": str(results)}):
        yield chunk.content