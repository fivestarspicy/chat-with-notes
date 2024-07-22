from flask import Flask, request, render_template, jsonify
import requests

app = Flask(__name__)

def read_file(file_path):
    with open(file_path, 'r') as file:
        content = file.read()
    return content

def generate_response(prompt, conversation_history):
    full_prompt = conversation_history + "\n" + prompt
    url = 'http://localhost:11434/v1/completions'
    headers = {'Content-Type': 'application/json'}
    data = {
        'prompt': full_prompt,
        'model': 'llama3',
        'max_tokens': 100
    }
    response = requests.post(url, headers=headers, json=data)
    if response.status_code == 200:
        return response.json()['choices'][0]['text']
    else:
        return f"Error: {response.status_code} - {response.text}"

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
        return jsonify({'content': content})

@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    user_input = data['message']
    conversation_history = data['history']
    response = generate_response(user_input, conversation_history)
    return jsonify({'response': response})

if __name__ == "__main__":
    app.run(debug=True)
