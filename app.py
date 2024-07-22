from flask import Flask, request, render_template, jsonify, session
import requests
import os

app = Flask(__name__)
app.secret_key = os.urandom(24)  # For session management

def read_file(file_path):
    try:
        with open(file_path, 'r') as file:
            content = file.read()
        return content
    except Exception as e:
        return f"Error reading file: {e}"

def generate_response(prompt, conversation_history, file_content):
    full_prompt = f"File content:\n{file_content}\n\nConversation history:\n{conversation_history}\n\nHuman: {prompt}\nAI:"
    url = 'http://localhost:11434/v1/completions'
    headers = {'Content-Type': 'application/json'}
    data = {
        'prompt': full_prompt,
        'model': 'llama3',
        'max_tokens': 5000  # Adjust as needed
    }
    try:
        response = requests.post(url, headers=headers, json=data)
        if response.status_code == 200:
            return response.json()['choices'][0]['text']
        else:
            return f"Error: {response.status_code} - {response.text}"
    except Exception as e:
        return f"Error: {e}"

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'})
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'})
    if file:
        file_path = f"./uploads/{file.filename}"
        file.save(file_path)
        content = read_file(file_path)
        session['file_content'] = content  # Store file content in session
        return jsonify({'content': content})

@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    user_input = data['message']
    conversation_history = data['history']
    file_content = session.get('file_content', '')  # Retrieve file content from session
    response = generate_response(user_input, conversation_history, file_content)
    return jsonify({'response': response})

if __name__ == "__main__":
    app.run(debug=True)