from flask import Flask, request, render_template, jsonify, session
import requests
import os
import pypdf

app = Flask(__name__)
app.secret_key = os.urandom(24)  # For session management

def generate_response(prompt, conversation_history, file_content):
    formatted_history = "\n".join(conversation_history)
    
    full_prompt = f"File content:\n{file_content}\n\nConversation history:\n{formatted_history}\n\nHuman: {prompt}\nAI:"
    url = 'http://localhost:11434/v1/completions'
    headers = {'Content-Type': 'application/json'}
    data = {
        'prompt': full_prompt,
        'model': 'llama3.1',
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

def allowed_file(filename):
    ALLOWED_EXTENSIONS = {'txt', 'md', 'py', 'js', 'html', 'css', 'json', 'pdf'}
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

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
    if file and allowed_file(file.filename):
        try:
            if file.filename.lower().endswith('.pdf'):
                pdf_reader = pypdf.PdfReader(file)
                content = ""
                for page in pdf_reader.pages:
                    content += page.extract_text()
            else:
                content = file.read().decode('utf-8')
            
            action = request.form.get('action', 'upload')
            
            if action == 'clear':
                session['conversation_history'] = []
            elif action == 'keep':
                # Keep the existing conversation history
                if 'conversation_history' in session and session['conversation_history']:
                    session['conversation_history'].append("System: New file uploaded. Previous context may or may not apply.")
            else:
                # Default action (upload without existing chat)
                session['conversation_history'] = []
            
            session['file_content'] = content
            return jsonify({
                'content': content,
                'chatHistory': session.get('conversation_history', [])
            })
        except Exception as e:
            return jsonify({'error': f'Error reading file: {str(e)}'})
    else:
        return jsonify({'error': 'File type not allowed'})

@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    user_input = data['message']
    conversation_history = session.get('conversation_history', [])
    file_content = session.get('file_content', '')

    # Add user input to conversation history
    conversation_history.append(f"Human: {user_input}")

    # Generate AI response
    ai_response = generate_response(user_input, conversation_history, file_content)

    # Add AI response to conversation history
    conversation_history.append(f"AI: {ai_response}")

    # Store updated history in session
    session['conversation_history'] = conversation_history

    return jsonify({
        'response': ai_response,
        'full_history': conversation_history
    })

@app.route('/clear_chat', methods=['POST'])
def clear_chat():
    session['conversation_history'] = []
    return jsonify({'status': 'success', 'message': 'Chat history cleared'})

@app.route('/clear_all', methods=['POST'])
def clear_all():
    session.clear()
    return jsonify({'status': 'success', 'message': 'All data cleared'})

if __name__ == "__main__":
    app.run(debug=True)