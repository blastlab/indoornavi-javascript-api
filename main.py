from flask import Flask
from python_app_files.nocache import nocache

app = Flask(__name__, static_folder='output')


@nocache
@app.route('/<path:path>')
def serve_file(path):
    return app.send_static_file(path)


@nocache
@app.route('/')
def serve_index():
    return app.send_static_file('index.html')


if __name__ == '__main__':
    app.run(port=3000)
