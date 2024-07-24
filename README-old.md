# Chat-with-Notes

A simple web application built with Flask that allows users to upload text files, display their content, and interact with an AI chatbot to discuss the content.

## Prerequisites

- Python 3.x
- pip (Python package installer)
- Git
- Ollama Llama 3 model running locally

## Installation

1. **Clone the Repository**

   ```sh
   git clone https://github.com/fivestarspicy/chat-with-notes.git
   cd chat-with-notes
   ```

2. **Create and Activate Virtual Environment**

   ```sh
   python3 -m venv chat-with-notes-env
   source chat-with-notes-env/bin/activate
   ```

3. **Install Dependencies**

   ```sh
   pip install -r requirements.txt
   ```

4. **Set Up and Run Ollama Llama 3 Model**

   Make sure you have the Ollama Llama 3 model running locally. Follow the instructions on Ollama's website to set it up.

   Start the Ollama Llama 3 model:

   ```sh
   ollama start
   ```

## Running the Application

1. **Start the Flask Application**

   ```sh
   python3 app.py
   ```

2. **Access the Application**

   Open your web browser and navigate to `http://127.0.0.1:5000/` or `http://<your-local-ip>:5000/` to access the application from another device on the same network.

## Usage

1. **Upload a Text File**
   * Use the file input to select and upload a text file.
   * The content of the uploaded file will be displayed in a separate section.

2. **Chat with the AI**
   * Enter your message in the input box and click "Send".
   * The AI will respond based on the content of the uploaded file and the ongoing conversation.

## Project Structure

```
chat-with-notes/
├── app.py
├── requirements.txt
├── static/
│   └── style.css
├── templates/
│   └── index.html
└── uploads/
```

## Contributing

Contributions are welcome! Please submit a pull request or open an issue to discuss any changes or improvements.

## License

This project is licensed under the MIT License.
