document.addEventListener('DOMContentLoaded', () => {
    const uploadForm = document.getElementById('uploadForm');
    const fileInput = document.getElementById('fileInput');
    const uploadButton = document.getElementById('uploadButton');
    const fileContent = document.getElementById('fileContent');
    const chatForm = document.getElementById('chatForm');
    const userInput = document.getElementById('userInput');
    const chatHistory = document.getElementById('chatHistory');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const exportChatButton = document.getElementById('exportChat');
    const clearChatButton = document.getElementById('clearChat');
    const clearAllButton = document.getElementById('clearAll');
    const dropZone = document.getElementById('dropZone');

    const allowedFileTypes = ['.txt', '.md', '.py', '.js', '.html', '.css', '.json'];

    // Load chat history from local storage
    loadChatHistory();

    fileInput.addEventListener('change', handleFileSelect);

    // Drag and drop functionality
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length) {
            handleFileSelect({ target: { files: files } });
        }
    });

    function handleFileSelect(e) {
        const file = e.target.files[0];
        if (file) {
            const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
            if (allowedFileTypes.includes(fileExtension)) {
                uploadButton.textContent = 'Upload ' + file.name;
                uploadButton.disabled = false;
                fileInput.files = e.target.files;  // Update the file input
            } else {
                uploadButton.textContent = 'Invalid file type';
                uploadButton.disabled = true;
                alert('Please select a valid file type: ' + allowedFileTypes.join(', '));
            }
        } else {
            uploadButton.textContent = 'Upload';
            uploadButton.disabled = false;
        }
    }

    uploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(uploadForm);

        try {
            loadingSpinner.style.display = 'block';
            const response = await fetch('/upload', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();
            if (data.error) {
                alert(`Error: ${data.error}`);
                fileContent.textContent = '';
            } else {
                fileContent.textContent = data.content;
                chatHistory.innerHTML = ''; // Clear chat history when new file is uploaded
                saveChatHistory(); // Save empty chat history
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while uploading the file.');
            fileContent.textContent = '';
        } finally {
            loadingSpinner.style.display = 'none';
        }
    });

    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const message = userInput.value.trim();
        if (!message) return;

        appendMessage('You', message);
        userInput.value = '';

        try {
            loadingSpinner.style.display = 'block';
            const response = await fetch('/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message
                }),
            });
            const data = await response.json();
            appendMessage('AI', data.response);
            updateChatHistory(data.full_history);
        } catch (error) {
            console.error('Error:', error);
            appendMessage('System', 'An error occurred while processing your message.');
        } finally {
            loadingSpinner.style.display = 'none';
        }
    });

    function appendMessage(sender, message) {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${sender.toLowerCase()}-message`;
        messageElement.innerHTML = `<strong>${sender}:</strong> ${message}`;
        chatHistory.appendChild(messageElement);
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }

    function updateChatHistory(fullHistory) {
        chatHistory.innerHTML = ''; // Clear existing chat history
        const messages = fullHistory.split('\n');
        messages.forEach(message => {
            if (message.startsWith('Human: ')) {
                appendMessage('You', message.substring(7));
            } else if (message.startsWith('AI: ')) {
                appendMessage('AI', message.substring(4));
            }
        });
        saveChatHistory();
    }

    function saveChatHistory() {
        localStorage.setItem('chatHistory', chatHistory.innerHTML);
    }

    function loadChatHistory() {
        const savedHistory = localStorage.getItem('chatHistory');
        if (savedHistory) {
            chatHistory.innerHTML = savedHistory;
        }
    }

    exportChatButton.addEventListener('click', () => {
        const chatContent = chatHistory.innerText;
        const blob = new Blob([chatContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'chat_export.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

    clearChatButton.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear the chat history? This action cannot be undone.')) {
            chatHistory.innerHTML = '';
            saveChatHistory();
        }
    });

    clearAllButton.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
            chatHistory.innerHTML = '';
            fileContent.innerHTML = '';
            localStorage.clear();
        }
    });
});