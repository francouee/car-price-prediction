import tensorflow as tf
import shap
import pandas as pd
import numpy as np

import sys
import logging
from pathlib import Path

from src.python.neural_net import get_model_number

logging.basicConfig(stream=sys.stdout, level=logging.INFO)
logger = logging.getLogger(__file__)
model_folder = Path("./")
data_folder = Path("../../dist/assets")


def f(values, names, model):
    """
    model prediction function wrapper
    :param values:
    :param names:
    :param model:
    :return:
    """
    if isinstance(values, np.ndarray):
        values = values.T
    x = {name: value for name, value in zip(names, values)}
    return model(x)


def get_background_data():
    data = pd.read_csv(data_folder / 'data.csv').dropna()
    data['model_number'] = data['model'].apply(get_model_number).dropna().astype('int')

    names = ["mileage", "year", "power", "model_number", "consumption"]
    data = data[names]
    background_data = data.sample(100, random_state=0).values

    return background_data

def explain(x):
    """
    explain the model locally with the SHAP kernel explainer
    :param x:
    :return:
    """

    background_data = get_background_data()
    names = ["mileage", "year", "power", "model_number", "consumption"]
    x = np.array(x)
    model = tf.keras.models.load_model(
        str(model_folder / 'neural_net_classifier'),
    )

    explainer = shap.KernelExplainer(lambda x_: f(x_, names=names, model=model), background_data)
    shap_values = explainer.shap_values(x, nsamples=500)[0]

    return shap_values

def main():
    x = [100000, 2019, 150, 3, 6.3]
    explain(x)

if __name__ == '__main__':
    main()