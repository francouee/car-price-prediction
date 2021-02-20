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

    return (
        <Card className={classes.root}>
            <AdditiveForceVisualizer
                baseValue={20000}
                link="identity"
                featureNames={{
                "0": "Mileage",
                "1": "Year",
                "2": "Power",
                "3": "Model number",
                "4": "Consumption"
                }}
                outNames={["Price"]}
                features={{
                "0": { value: 100000, effect: -3000 },
                "1": { value: 2019, effect: 2000 },
                "2": { value: 150, effect: 200 },
                "3": { value: 4, effect: 2000 },
                "4": { value: 6.2, effect: 100 }
                }}
            />
        </Card>
        )
    }