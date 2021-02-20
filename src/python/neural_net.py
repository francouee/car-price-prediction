from typing import List, Tuple, Union, Any
import tensorflow as tf
import tensorflow_addons as tfa
from tensorflow.keras import layers
from tensorflow.keras.layers.experimental import preprocessing

import pandas as pd
from sklearn.model_selection import train_test_split
from tqdm.keras import TqdmCallback

import sys
import logging
from pathlib import Path

import matplotlib.pyplot as plt

logging.basicConfig(stream=sys.stdout, level=logging.INFO)
logger = logging.getLogger(__file__)
data_folder = Path("../../dist/assets")


def plot_loss(history, epochs: list):
    _ = plt.figure()
    plt.title('Loss')
    plt.plot(epochs, history.history['loss'], color='blue', label='Train')
    plt.plot(epochs, history.history['val_loss'], color='orange', label='Val')
    plt.xlabel('Epoch')
    plt.ylabel('Loss')
    plt.legend()


def get_normalization_layer(name, dataset):
  normalizer = preprocessing.Normalization()
  feature_ds = dataset.map(lambda x, y: x[name])
  # Learn the statistics of the data.
  normalizer.adapt(feature_ds)

  return normalizer

def prepare_data(columns, train_ds):
    all_inputs = []
    encoded_features = []

    for header in columns:
        numeric_col = tf.keras.Input(shape=(1,), name=header)
        normalization_layer = get_normalization_layer(header, train_ds)
        encoded_numeric_col = normalization_layer(numeric_col)
        all_inputs.append(numeric_col)
        encoded_features.append(encoded_numeric_col)

    return all_inputs, encoded_features

def fit():
    train_ds, val_ds, test_ds, feature_columns = read_data()
    all_inputs, encoded_features = prepare_data(
        columns=["mileage", "year", "power", "model_number", "consumption"],
        train_ds=train_ds
    )
    all_features = tf.keras.layers.concatenate(encoded_features)
    x = tf.keras.layers.Dense(12, activation="relu")(all_features)
    x = tf.keras.layers.Dropout(0.05)(x)
    x = tf.keras.layers.Dense(7, activation="relu")(x)
    output = tf.keras.layers.Dense(1)(x)
    model = tf.keras.Model(all_inputs, output)

    model.compile(
        optimizer=tf.optimizers.Adam(learning_rate=0.1),
        loss=tf.keras.losses.MeanSquaredError(),
        metrics=[tfa.metrics.r_square.RSquare(y_shape=(1,)), tf.metrics.MeanAbsolutePercentageError()]
    )

    epochs = 100

    history = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=epochs,
        verbose=0,
        callbacks=[TqdmCallback(verbose=0, position=0)]
    )

    plot_loss(history, epochs=range(epochs))
    plt.show()

    logger.info(model.summary())

    accuracy = model.evaluate(test_ds)
    logger.info(f"Accuracy : {accuracy}")

    y = tf.concat([y for x, y in test_ds], axis=0)
    logger.info(tf.concat([model.predict(test_ds), tf.expand_dims(y, -1)], axis=1))

    model.save('neural_net_classifier', save_format='h5')

    tf.keras.utils.plot_model(model, show_shapes=True, rankdir="LR")


def demo(X, feature_column):
  feature_layer = layers.DenseFeatures(feature_column)
  logger.info(feature_layer(X).numpy())


def get_model_number(description: str):
    try:
        e = description.split(' ')
        if e[2].isdigit():
            return int(e[2])
        elif e[1].isdigit():
            return int(e[1])
        elif e[2][-1].isdigit():
            return int(e[2][-1])
    except IndexError:
        return None

def df_to_dataset(dataframe, shuffle=False, batch_size=32, label=True):
    dataframe = dataframe.copy()
    if label:
        labels = dataframe.pop('price')
        ds = tf.data.Dataset.from_tensor_slices((dict(dataframe), labels))
    else:
        ds = tf.data.Dataset.from_tensor_slices(dict(dataframe))
    if shuffle:
        ds = ds.shuffle(buffer_size=len(dataframe))
    ds = ds.batch(batch_size)
    return ds


def embedding_column(embedding_name, categorial_values, dimension):
    categorial_column = tf.feature_column.categorical_column_with_vocabulary_list(embedding_name, categorial_values)
    embedding = tf.feature_column.embedding_column(categorical_column=categorial_column, dimension=dimension)

    return embedding


def one_hot_column(embedding_name, categorial_values):
    categorial_column = tf.feature_column.categorical_column_with_vocabulary_list(embedding_name, categorial_values)
    one_hot = tf.feature_column.indicator_column(categorial_column)

    return one_hot


def build_feature_column(df):
    feature_columns = []

    # numeric cols
    for header in ["mileage", "year", "power", "model_number", "consumption"]:
        feature_columns.append(tf.feature_column.numeric_column(header))

    # embedding cols
    # for header in []:
    #     categorial_values = df[header].unique()
    #     n_cat = len(categorial_values)
    #     dimension = int(n_cat ** 0.25)
    #     print(header, n_cat, dimension)
    #     feature_columns.append(embedding_column(header, categorial_values, dimension=dimension))

    # one_hot cols
    # for header in ["energy", "gearbox"]:
    #     categorial_values = df[header].unique()
    #     feature_columns.append(one_hot_column(header, categorial_values))
    
    return feature_columns


def read_data():
    X = pd.read_csv(data_folder / "data.csv")
    X['model_number'] = X['model'].apply(get_model_number).dropna().astype('int')
    X = X[["price", "mileage", "year", "power", "model_number", "consumption"]]
    X = X.dropna()

    train, test = train_test_split(X, test_size=0.10, random_state=0)
    train, val = train_test_split(train, test_size=0.15, random_state=0)
    logger.info(f"{len(train)} : train examples")
    logger.info(f"{len(val)} : validation examples")
    logger.info(f"{len(test)} : test examples")

    batch_size = 128

    train_ds = df_to_dataset(train, batch_size=batch_size)
    val_ds = df_to_dataset(val, shuffle=False, batch_size=batch_size)
    test_ds = df_to_dataset(test, shuffle=False, batch_size=batch_size)



    feature_columns = build_feature_column(X)

    return train_ds, val_ds, test_ds, feature_columns


def build_and_train_tf_estimator():
    train_ds, val_ds, test_ds, feature_columns = read_data()
    model = tf.estimator.DNNRegressor(hidden_units=[20, 10], feature_columns=feature_columns)
    model.train(input_fn=lambda: read_data()[0], steps=10000)

    accuracy = model.evaluate(input_fn=lambda: read_data()[2])
    logger.info(f"Accuracy : {accuracy}")

    y = tf.concat([y for x, y in test_ds], axis=0)

    predictions = []
    for pred in model.predict(input_fn=lambda: read_data()[2]):
        predictions.append(pred['predictions'])
    logger.info(tf.concat([tf.stack(predictions), tf.expand_dims(tf.cast(y, dtype=tf.float32), -1)], axis=1))


def build_and_train_keras_sequential():
    train_ds, val_ds, test_ds, feature_columns = read_data()

    feature_layer = tf.keras.layers.DenseFeatures(feature_columns)

    model = tf.keras.Sequential([
        feature_layer,
        layers.Dense(24, activation='relu'),
        layers.Dropout(.1),
        layers.Dense(10, activation='relu'),
        layers.Dropout(.1),
        layers.Dense(1)
    ])

    model.compile(
        optimizer='adam',
        loss=tf.keras.losses.MeanSquaredError(),
        metrics=[tfa.metrics.r_square.RSquare(y_shape=(1,)), tf.metrics.MeanAbsolutePercentageError()]
    )

    epochs = 100

    history = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=epochs,
        verbose=0,
        callbacks=[TqdmCallback(verbose=0, position=0)]
    )

    plot_loss(history, epochs=range(epochs))
    plt.show()

    logger.info(model.summary())

    accuracy = model.evaluate(test_ds)
    logger.info(f"Accuracy : {accuracy}")

    y = tf.concat([y for x, y in test_ds], axis=0)
    logger.info(tf.concat([model.predict(test_ds), tf.expand_dims(y, -1)], axis=1))

    model.save('neural_net_classifier', save_format='tf')
    # tfjs.converters.save_keras_model(model, 'neural_net_classifier_js')
    # tfjs.converters.convert_tf_saved_model('neural_net_classifier', 'neural_net_classifier_js')


if __name__ == '__main__':
    fit()