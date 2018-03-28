from flask import Flask

app = Flask(__name__, static_folder='output')


@app.route('/<path:path>')
def serve_file(path):
    return app.send_static_file(path)


@app.route('/')
def serve_index():
    return app.send_static_file('index.html')


if __name__ == '__main__':
    app.run(port=3000)
