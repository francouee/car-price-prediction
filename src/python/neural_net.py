import tensorflow as tf

import pandas as pd

from pathlib import Path
data_folder = Path("../../data/")
src_folder = Path("../../src/")


def df_to_dataset(dataframe, shuffle=False, batch_size=32):
    dataframe = dataframe.copy()
    labels = dataframe.pop('target')
    ds = tf.data.Dataset.from_tensor_slices((dict(dataframe), labels))
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
    for header in ['duration', 'nb_sites', 'delay_delivery_min', 'delay_delivery_max', 'shipping_cost_relay', 
                   'shipping_cost_home', 'if_sold_in_lots', 'cos_year', 'sin_year', 'cos_month', 'sin_month',
                   'cos_day', 'sin_day', 'cos_hour', 'sin_hour', 'cos_weekday', 'sin_weekday', 'cos_season', 
                   'sin_season', 'promotion', 'promotion_percentage', 'log_price', 'log_initial_stock', 
                   'log_max_sales_operation', 'log_max_sales_product']:
        feature_columns.append(tf.feature_column.numeric_column(header))

    # embedding cols
    for header in ['brand', 'sub_sector', 'universe', 'supplier', 'color', 'size', 'gender']:
        categorial_values = df[header].unique()
        n_cat = len(categorial_values)
        dimension = int(np.round(n_cat ** 0.25))
        print(header, n_cat, dimension)
        feature_columns.append(embedding_column(header, categorial_values, dimension=dimension))

    # one_hot cols
    for header in ['sector', 'business_type', 'type_reception']:
        categorial_values = df[header].unique()
        feature_columns.append(one_hot_column(header, categorial_values))
    
    return feature_columns


def read_data(X_path, y_path, build_feature_layer = False, classifier=True):
    X = pd.read_pickle(data_folder / X_path)
    y= pd.read_pickle(data_folder / y_path)

    X.loc[X.item == 'None', 'item'] = '0'
    
    batch_size = 128

    if classifier==True:
        df = pd.concat([X, y], axis=1).rename(columns = {"stock_finished" : "target"})
    else:
        df = pd.concat([X, y], axis=1).rename(columns = {"quantity_sold" : "target"})
        
    df.if_sold_in_lots = df.if_sold_in_lots.apply(lambda x: int(x == 'True'))

    unused = ['estimated_%_sold_operation', 'log_estimated_sales_operation', 'log_estimated_quantity_sold_operation',
              'log_retail_price', 'delivery_range']

    for col in unused:
        df = df.drop(col, axis=1)
        
    df = df.dropna()
    ds = df_to_dataset(df, batch_size=batch_size)
    
    if build_feature_layer:

        feature_columns = build_feature_column(df)
        feature_layer = tf.keras.layers.DenseFeatures(feature_columns)
        
        return ds, feature_layer
    
    return ds


#classifier = True; neural_net_name = 'neural_net_classification'
classifier = False; neural_net_name = 'neural_net_regression_20_epoch'


def main():
    train_ds, feature_layer = read_data("pickle-files/pickle-jerem/Xtrain_fe.pkl", "pickle-files/pickle-jerem/ytrain.pkl", 
                                        build_feature_layer=True, classifier=classifier)
    valid_ds = read_data("pickle-files/pickle-jerem/Xval_fe.pkl", "pickle-files/pickle-jerem/yval.pkl",
                        build_feature_layer=False, classifier=classifier)

    model = tf.keras.Sequential([
      feature_layer,
      layers.Dense(128, activation='relu'),
      layers.Dense(128, activation='relu'),
      layers.Dense(1)
    ])
    
    if classifier==True:
        model.compile(optimizer='adam',
                      loss=tf.keras.losses.BinaryCrossentropy(from_logits=True),
                      metrics=['accuracy'])
    else:
        model.compile(optimizer='adam',
                      loss=tf.keras.losses.MeanSquaredError(),
                      metrics=['accuracy'])

    model.fit(train_ds,
              validation_data = valid_ds,
              epochs=20)
    
    model.save(neural_net_name)

if __name__ == '__main__':
    main()