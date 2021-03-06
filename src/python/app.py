from flask import Flask, request, abort, jsonify
from src.python.explain import explain
from flask_cors import cross_origin

app = Flask(__name__)

names = ["mileage", "year", "power", "model_number", "consumption"]


@app.route('/get_shap_values', methods=['POST'])
@cross_origin()
def get_shap():
    if not request.json or 'input' not in request.json:
        abort(400)

    x = request.json['input']
    shap_values = explain(x)

    return jsonify({'shap_values': list(shap_values)})


if __name__ == '__main__':
    app.run(host='127.0.0.1', port=8081, debug=True)