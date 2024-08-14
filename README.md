



https://github.com/user-attachments/assets/98efedad-1651-4a5c-ac79-a66b6deef98c







# Chat-with-Notes

Chat-with-Notes is a simple web application built with Flask that allows users to upload text files, display their content, and interact with an AI chatbot to discuss the content. The application uses a locally running Ollama Llama 3.1 (8B) model for AI responses, ensuring privacy and data security.

## Features

- Upload and display text files
- Chat with an AI about the uploaded content
- Privacy-focused: all processing happens locally
- Ability to upload new files mid-conversation
- Clear chat history or all data as needed
- Export chat history

## Prerequisites

- Python 3.x
- pip (Python package installer)
- Git
- Ollama with Llama 3.1 (8B) model running locally

## Installation

1. **Clone the Repository**

   ```
   git clone https://github.com/yourusername/chat-with-notes.git
   cd chat-with-notes
   ```

2. **Create and Activate Virtual Environment**

   ```
   python3 -m venv chat-with-notes-env
   source chat-with-notes-env/bin/activate  # On Windows, use `chat-with-notes-env\Scripts\activate`
   ```

3. **Install Dependencies**

   ```
   pip install -r requirements.txt
   ```

4. **Set Up and Run Ollama Llama 3.1 Model**

   Make sure you have the Ollama Llama 3.1 model running locally. Follow the instructions on [Ollama's website](https://ollama.ai/) to set it up.

   Start the Ollama Llama 3.1 model:

   ```
   ollama run llama3.1
   ```

## Running the Application

1. **Start the Flask Application**

   ```
   python app.py
   ```

2. **Access the Application**

   Open your web browser and navigate to `http://127.0.0.1:5000/` or `http://<your-local-ip>:5000/` to access the application from another device on the same network.

## Usage

1. **Upload a Text File**
   - Use the file input to select and upload a text file.
   - Supported file types include .txt, .md, .py, .js, .html, .css, .json, and .pdf
   - The content of the uploaded file will be displayed in a separate section.

2. **Chat with the AI**
   - Enter your message in the input box and click "Send".
   - The AI will respond based on the content of the uploaded file and the ongoing conversation.

3. **Upload a New File Mid-Conversation**
   - You can upload a new file at any time during the conversation.
   - You'll be prompted to choose whether to clear the existing chat or keep it.
   - If you choose to keep the chat, a system message will be added to inform about the new file upload.

4. **Clear Chat or All Data**
   - Use the "Clear Chat" button to remove the conversation history.
   - Use the "Clear All Data" button to remove both the conversation history and uploaded file content.

5. **Export Chat**
   - Click the "Export Chat" button to download the conversation history as a text file.

## Privacy and Data Security

- All processing happens locally on your machine.
- No data is sent to external servers (except for the local Ollama API).
- Uploaded files and conversation history are stored in-memory and are cleared when you close the application or clear the data manually.

## Troubleshooting

- If you encounter issues with the AI responses, ensure that the Ollama Llama 3.1 model is running correctly on your local machine.
- Check the console for any error messages if the application isn't behaving as expected.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

