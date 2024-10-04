from flask import Flask, request, jsonify
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv
import os
from flask_cors import CORS


load_dotenv()

smtp_host = os.getenv("SMTP_HOST")
smtp_port = os.getenv("SMTP_PORT")
smtp_username = os.getenv("SMTP_USER")
smtp_password = os.getenv("SMTP_PASSWORD")

app = Flask(__name__)
CORS(app)


def load_template(file_path, context):
    with open(file_path, 'r', encoding='utf-8') as file:
        template = file.read()
    return template.format(**context)

def handle_json():
    data = request.get_json()  
    return jsonify(data) 

@app.route('/send-email-new-account', methods=['POST'])
def send_email_new_account():
    data = request.get_json()
    to_email = data.get("to_email")
    user_name = data.get("user_name")

    context = {"user_name": user_name, "link": "https://example.com"}
    html_content = load_template('templates/new_account.html', context)
    try:
        msg = MIMEMultipart()
        msg['From'] = smtp_username
        msg['To'] = to_email
        msg['Subject'] = "Bem-vindo ao nosso sistema CyberCS, {}".format(user_name)
        msg.attach(MIMEText(html_content, 'html'))

        with smtplib.SMTP(smtp_host, smtp_port) as server:
            server.starttls()  
            server.login(smtp_username, smtp_password) 
            server.sendmail(smtp_username, to_email, msg.as_string())
        
        return {"status": "success", "message": "Email enviado com sucesso!"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.route('/send-email-new-threat', methods=['POST'])
def send_email_new_threat_():
    data = request.get_json()
    to_email = data.get("to_email")
    user_name = data.get("user_name")
    search_name = data.get("search_name")
    threats = data.get("threats")

    context = {"user_name": user_name, "search_name": search_name}
    html_content = load_template('templates/new_threat.html', context)
    try:
        msg = MIMEMultipart()
        msg['From'] = smtp_username
        msg['To'] = to_email
        msg['Subject'] = "Nova ameaça para a pesquisa \"{}\" encontrada".format(search_name)
        msg.attach(MIMEText(html_content, 'html'))

        with smtplib.SMTP(smtp_host, smtp_port) as server:
            server.starttls()  
            server.login(smtp_username, smtp_password) 
            server.sendmail(smtp_username, to_email, msg.as_string())
        
        return {"status": "success", "message": "Email enviado com sucesso!"}
    except Exception as e:
        return {"status": "error", "message": str(e)}
    

@app.route('/send-email-new-search', methods=['POST'])
def send_email_new_search():
    print("cheguei aqui")
    data = request.get_json()
    to_email = data.get("to_email")
    user_name = data.get("user_name")
    search_name = data.get("search_name")
    content = data.get("content")

    context = {"user_name": user_name, "search_name": search_name, "content": content}
    html_content = load_template('templates/new_search.html', context)
    try:
        msg = MIMEMultipart()
        msg['From'] = smtp_username
        msg['To'] = to_email
        msg['Subject'] = "Nova pesquisa \"{}\" criada no CyberCS".format(search_name)
        msg.attach(MIMEText(html_content, 'html'))

        with smtplib.SMTP(smtp_host, smtp_port) as server:
            server.starttls()  
            server.login(smtp_username, smtp_password) 
            server.sendmail(smtp_username, to_email, msg.as_string())
        print("cheguei aqui 2")
        return {"status": "success", "message": "Email enviado com sucesso!"}
    except Exception as e:
        print("cheguei aqui 3")
        return {"status": "error", "message": str(e)}

if __name__ == '__main__':
    app.run(debug=True)
