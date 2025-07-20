import fitz  # PyMuPDF

async def extract_text_from_pdf(file):
    content = ""
    pdf = fitz.open(stream=await file.read(), filetype="pdf")
    for page in pdf:
        content += page.get_text()
    return content