import re
import os
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from dotenv import load_dotenv

load_dotenv()

classifier_llm = ChatGroq(
    api_key=os.getenv("GROQ_API_KEY"),
    model="llama-3.3-70b-versatile",
    temperature=0
)

INJECTION_PATTERNS = [
    r"ignore (all |previous |above )?instructions",
    r"forget (all |previous |above )?instructions",
    r"you are now",
    r"act as",
    r"pretend (you are|to be)",
    r"disregard",
    r"override",
    r"system prompt",
    r"jailbreak",
    r"do anything now",
    r"dan mode",
]

def is_db_question(question: str) -> bool:
    prompt = ChatPromptTemplate.from_messages([
        ("system", """You are a strict input classifier for a Text-to-SQL system.
Your job is to determine if the user's input is a genuine database query question.
A genuine database question asks about data, records, counts, filters, aggregations, or relationships in a database.
Reply with only YES or NO. Nothing else."""),
        ("human", "{question}")
    ])
    chain = prompt | classifier_llm
    response = chain.invoke({"question": question})
    return response.content.strip().upper() == "YES"

def check_input(question: str) -> tuple[bool, str]:
    lowered = question.lower().strip()

    # Hard regex check for injection — fast, no LLM call needed
    for pattern in INJECTION_PATTERNS:
        if re.search(pattern, lowered):
            return False, "Prompt injection detected. Please ask a genuine database question."

    if len(question.strip()) < 5:
        return False, "Question is too short."

    if len(question.strip()) > 500:
        return False, "Question is too long. Keep it under 500 characters."

    # LLM classifier for relevance
    if not is_db_question(question):
        return False, "Please ask a question about your database."

    return True, ""