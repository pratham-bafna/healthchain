# serve_html.py
from flask import Flask, send_from_directory
import os

app = Flask(__name__)

# Set the directory to serve files from
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

@app.route('/')
def serve_index():
    # Serve the index.html file
    return send_from_directory(BASE_DIR, 'index.html')

@app.route('/<path:filename>')
def serve_file(filename):
    # Serve other files in the directory
    return send_from_directory(BASE_DIR, filename)

if __name__ == '__main__':
    print(f"Serving files from: {BASE_DIR}")
    print(f"Available files: {os.listdir(BASE_DIR)}")
    app.run(host='0.0.0.0', port=8000, debug=True)