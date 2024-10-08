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
smtp_email = os.getenv("SMTP_USER")
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
    user_id = data.get("user_id")

    context = {"user_name": user_name, "link": "http://localhost:4200/confirm-account/{}".format(user_id)}
    html_content = load_template('templates/new_account.html', context)
    msg = MIMEMultipart()
    msg['From'] = smtp_email
    msg['To'] = to_email
    msg['Subject'] = "Bem-vindo ao nosso sistema CyberCS, {}".format(user_name)
    msg.attach(MIMEText(html_content, 'html'))
    try:
        server = smtplib.SMTP(smtp_email, smtp_port)
        server.starttls()
        server.login(smtp_email, smtp_email) 

        server.send_message(msg)
        return {"status": "success", "message": "Email enviado com sucesso!"}
    except Exception as e:
        return {"status": "error", "message": str(e)}
    finally:
        server.quit() 
        

@app.route('/send-email-new-threat', methods=['POST'])
def send_email_new_threat_():
    data = request.get_json()
    to_email = data.get("to_email")
    user_name = data.get("user_name")
    search_name = data.get("search_name")
    threats = data.get("threats")

    context = {"user_name": user_name, "search_name": search_name}
    html_content = load_template('templates/new_threat.html', context)
    msg = MIMEMultipart()
    msg['From'] = smtp_email
    msg['To'] = to_email
    msg['Subject'] = "Nova ameaça para a pesquisa \"{}\" encontrada".format(search_name)
    msg.attach(MIMEText(html_content, 'html'))
    try:
        server = smtplib.SMTP(smtp_email, smtp_port)
        server.starttls()
        server.login(smtp_email, smtp_email) 

        server.send_message(msg)
        return {"status": "success", "message": "Email enviado com sucesso!"}
    except Exception as e:
        return {"status": "error", "message": str(e)}
    finally:
        server.quit()
    

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
    
    msg = MIMEMultipart()
    msg['From'] = smtp_email
    msg['To'] = to_email
    msg['Subject'] = "Nova pesquisa \"{}\" criada no CyberCS".format(search_name)
    msg.attach(MIMEText(html_content, 'html'))
    try:
        server = smtplib.SMTP(smtp_email, smtp_port)
        server.starttls()
        server.login(smtp_email, smtp_email) 

        server.send_message(msg)
        return {"status": "success", "message": "Email enviado com sucesso!"}
    except Exception as e:
        return {"status": "error", "message": str(e)}
    finally:
        server.quit() 

if __name__ == '__main__':
    app.run(debug=True)
