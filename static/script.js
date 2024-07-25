document.addEventListener('DOMContentLoaded', () => {
    const uploadForm = document.getElementById('uploadForm');
    const fileInput = document.getElementById('fileInput');
    const uploadButton = document.getElementById('uploadButton');
    const fileContent = document.getElementById('fileContent');
    const chatForm = document.getElementById('chatForm');
    const userInput = document.getElementById('userInput');
    const chatHistory = document.getElementById('chatHistory');
    const exportChatButton = document.getElementById('exportChat');
    const clearChatButton = document.getElementById('clearChat');
    const clearAllButton = document.getElementById('clearAll');
    const dropZone = document.getElementById('dropZone');
    const spinner = document.getElementById('spinner');

    const allowedFileTypes = ['.txt', '.md', '.py', '.js', '.html', '.css', '.json', '.pdf'];

    // Create loading overlay
    const loadingOverlay = document.createElement('div');
    loadingOverlay.className = 'loading-overlay';
    loadingOverlay.innerHTML = '<div class="loader"></div>';
    document.body.appendChild(loadingOverlay);

    // Function to show/hide loading overlay
    function setLoading(isLoading) {
        loadingOverlay.style.display = isLoading ? 'flex' : 'none';
    }

    // Function to show/hide spinner
    function setSpinner(isLoading) {
        spinner.style.display = isLoading ? 'block' : 'none';
    }

    // Load chat history from local storage
    loadChatHistory();

    // Load file content from local storage
    loadFileContent();

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

        // Check if there's existing chat history
        if (chatHistory.innerHTML.trim() !== '') {
            const userChoice = await showUploadConfirmation();
            if (userChoice === 'cancel') {
                return;
            }
            formData.append('action', userChoice);
        } else {
            formData.append('action', 'upload');
        }

        try {
            setLoading(true);
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
                localStorage.setItem('fileContent', data.content); // Store file content in localStorage
                if (data.chatHistory) {
                    updateChatHistory(data.chatHistory);
                }
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while uploading the file.');
            fileContent.textContent = '';
        } finally {
            setLoading(false);
        }
    });

    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const message = userInput.value.trim();
        if (!message) return;

        appendMessage('You', message);
        userInput.value = '';

        try {
            setSpinner(true);
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
            setSpinner(false);
        }
    });

    function showUploadConfirmation() {
        return new Promise((resolve) => {
            const confirmationDialog = document.createElement('div');
            confirmationDialog.innerHTML = `
                <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center;">
                    <div style="background: white; padding: 20px; border-radius: 5px; text-align: center;">
                        <p>You have an existing chat history. What would you like to do?</p>
                        <button id="clearChatBtn">Clear chat and upload</button>
                        <button id="keepChatBtn">Keep chat and upload</button>
                        <button id="cancelUploadBtn">Cancel upload</button>
                    </div>
                </div>
            `;
            document.body.appendChild(confirmationDialog);

            document.getElementById('clearChatBtn').onclick = () => {
                document.body.removeChild(confirmationDialog);
                resolve('clear');
            };
            document.getElementById('keepChatBtn').onclick = () => {
                document.body.removeChild(confirmationDialog);
                resolve('keep');
            };
            document.getElementById('cancelUploadBtn').onclick = () => {
                document.body.removeChild(confirmationDialog);
                resolve('cancel');
            };
        });
    }

    function appendMessage(sender, message) {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${sender.toLowerCase()}-message`;
        messageElement.innerHTML = `<strong>${sender}:</strong> ${message}`;
        chatHistory.appendChild(messageElement);
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }

    function updateChatHistory(fullHistory) {
        chatHistory.innerHTML = ''; // Clear existing chat history
        fullHistory.forEach(message => {
            if (message.startsWith('Human: ')) {
                appendMessage('You', message.substring(7));
            } else if (message.startsWith('AI: ')) {
                appendMessage('AI', message.substring(4));
            } else if (message.startsWith('System: ')) {
                appendMessage('System', message.substring(8));
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

    function loadFileContent() {
        const savedFileContent = localStorage.getItem('fileContent');
        if (savedFileContent) {
            fileContent.textContent = savedFileContent;
        }
    }

    async function clearChat() {
        try {
            setLoading(true);
            const response = await fetch('/clear_chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({}),
            });
            const data = await response.json();
            if (data.status !== 'success') {
                throw new Error('Failed to clear chat history');
            }
            chatHistory.innerHTML = '';
            localStorage.removeItem('chatHistory');
        } catch (error) {
            console.error('Error clearing chat:', error);
            alert('An error occurred while clearing the chat. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    async function clearAll() {
        try {
            setLoading(true);
            const response = await fetch('/clear_all', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({}),
            });
            const data = await response.json();
            if (data.status !== 'success') {
                throw new Error('Failed to clear all data');
            }
            chatHistory.innerHTML = '';
            fileContent.textContent = '';
            localStorage.clear();
            // Force a hard reload of the page to clear any cached data
            window.location.reload(true);
        } catch (error) {
            console.error('Error clearing all data:', error);
            alert('An error occurred while clearing all data. Please try again.');
        } finally {
            setLoading(false);
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

    clearChatButton.addEventListener('click', async () => {
        if (confirm('Are you sure you want to clear the chat history? This action cannot be undone.')) {
            await clearChat();
        }
    });

    clearAllButton.addEventListener('click', async () => {
        if (confirm('Are you sure you want to clear all data? This will remove the chat history and uploaded file content. This action cannot be undone.')) {
            await clearAll();
        }
    });
});