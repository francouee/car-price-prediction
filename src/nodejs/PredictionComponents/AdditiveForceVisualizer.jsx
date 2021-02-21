import React from 'react';

import Card from '@material-ui/core/Card';
import { makeStyles } from '@material-ui/core/styles';
import {AdditiveForceVisualizer} from 'shapjs';

const useStyles = makeStyles({
    root: {
      padding: '10px',
      margin: '10px 10px 0px 10px'
    },
  });


export default function AdditiveForcePlot(props) {
    const classes = useStyles();
    const featureDict = {}
    Object.keys(props.predictionValues).map(function(key, i){
      featureDict[i.toString()] = {value: props.predictionValues[key], effect: props.shapValues[key]}
    })

    return (
        <Card className={classes.root}>
            <AdditiveForceVisualizer
                baseValue={36072}
                link="identity"
                featureNames={{
                "0": "Mileage",
                "1": "Year",
                "2": "Power",
                "3": "Model number",
                "4": "Consumption"
                }}
                outNames={["Price"]}
                features={featureDict}
            />
        </Card>
        )
    }