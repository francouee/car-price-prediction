
import { ScatterPlot } from './ExplorationComponents/ScatterPlot'
import ExplorationWidgets from './ExplorationComponents/Widgets'
import ValidationTextFields from './PredictionComponents/Widgets'
import AdditiveForcePlot from './PredictionComponents/AdditiveForceVisualizer'
import './app.css';

import React from 'react';
import * as tf from '@tensorflow/tfjs';
import * as d3 from 'd3';

import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import { makeStyles } from "@material-ui/core/styles";
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import SimpleTabs from './Panels'


const useStyles = makeStyles(theme => ({
    formControl: {
      margin: theme.spacing(1),
      minWidth: 120
    },
    selectEmpty: {
      marginTop: theme.spacing(2)
    }
  }));
  

function VariableSelector (props) {

    const classes = useStyles();
    const items = props.options.map((d) => {
        return <MenuItem value={d} key={d}>{d}</MenuItem>
    })
    return (
    <FormControl className={classes.formControl}> 
        <InputLabel id={props.id + "-select-label"}>X variable</InputLabel>
            <Select
                id={props.id} 
                labelId={props.id + "-select-label"}
                value={props.current_variable} 
                className="custom-select" 
                onChange={(d) => setstate(d.target.value)}
            >
                items
            </Select>
    </FormControl>
    );
}

//const model = await tf.loadGraphModel('/assets/model.json');

function get_model_number(description) {
    try{
        var e = description.split(' ')
        if (!isNaN(e[2])){
            return parseInt(e[2], 10)
        }else if (!isNaN(e[1])){
            return parseInt(e[1], 10)
        }else if (!isNaN(e[2][-1])){
            return parseInt(e[2][-1], 10)
        }
    }catch{
        return NaN
    }    
}    

var promiseData = d3.csv("/assets/data.csv").then(function(raw_data) {
    var data = raw_data.map(function(d) {
    return {
        price: parseInt(d["price"]),
        mileage: parseFloat(d["mileage"]) , 
        year: parseFloat(d["year"]) , 
        power: parseFloat(d["power"]), 
        model_number: get_model_number(d["model"]),
        consumption: parseFloat(d["consumption"]),
        energy: d['energy'],
        gearbox: d['gearbox'],
        };
    })
    data = data.filter((d) => d.model_number < 8);
    return data
});

function makePrediction (data, model) {
    var dataTensor = {}
    // Convert data to tensor
    Object.keys(data).map(function(key, index) {
        var dtype
        key === 'year' | key === 'mileage' | key === 'power' ? dtype='int32' : dtype='float32';
        if (key === 'energy' | key === 'gearbox'){
            dtype='string';
        };
        if (key !== 'price'){
            dataTensor[key] = tf.tensor2d([data[key]], [1, 1], dtype)
        }
        });
    // make prediction
    // https://github.com/tensorflow/tfjs/issues/2254
    let pred = model.execute(dataTensor)
    // console.log(pred)
    const values = pred.dataSync();
    const arr = Array.from(values);
    // console.log(values);
    return arr[0]
}

// var getAllPrediction = promiseData.then(function(data) {
//         var predictions = data.map((d) => makePrediction(d, model))
//         return predictions
//     })


class App extends React.Component {
    constructor(props) {
        super(props);

        // Set initial state
        this.state = {
            data: [],
            xVar: "mileage",
            yVar: "price",
            canvas: true,
            alpha: 0.3,
            radius: 5,
            width: (window.innerWidth > 960) ? window.innerWidth /1.4 : window.innerWidth /1.1,
            height: (window.innerWidth > 960) ? window.innerHeight/1.5 : window.innerHeight/2
        };
        this.options = [this.state.xVar, this.state.yVar]
        this.updateDimensions = this.updateDimensions.bind(this)
        
    }

    updateDimensions() {
        if(window.innerWidth > 960){
            this.setState({ 
                width: document.getElementById("chart-wrapper").offsetWidth /1.4, 
                height: Math.min(document.getElementById("chart-wrapper").offsetWidth/1.4/1.61, window.innerHeight/1.5)
            });
        }else{
            this.setState({ 
                width: document.getElementById("chart-wrapper").offsetWidth /1.1, 
                height: Math.min(document.getElementById("chart-wrapper").offsetWidth/1.1/1.61, window.innerHeight/1.5)
            });
        }
      };

    componentDidMount() {
        //getAllPrediction.then((d) => console.log(d))
        // Load data when the component mounts
        promiseData.then((data) => {
            // Get list of possible x and y variables
            let options = data.length === 0 ? [] : Object.keys(data[0]);
            this.options = options.filter((d) => d != "energy" && d != "gearbox");
            this.setState({ data: data });
        });
        window.addEventListener('resize', this.updateDimensions);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.updateDimensions);
    }

    render() {
        const children = [
            <div key={0}>
                <ExplorationWidgets
                    setState={this.setState.bind(this)}
                    alpha={this.state.alpha}
                    radius={this.state.radius}
                    canvas={this.state.canvas}
                    xVar={this.state.xVar}
                    yVar={this.state.yVar}
                    options={this.options}
                />                
                <ScatterPlot
                    xVar={this.state.xVar}
                    yVar={this.state.yVar}
                    data={this.state.data}
                    canvas={this.state.canvas}
                    alpha={this.state.alpha}
                    radius={this.state.radius}
                    width={this.state.width}
                    height={this.state.height}
                    />
                </div>,
            <div key={1}>
                <ValidationTextFields 
                />
                <AdditiveForcePlot
                />
            </div>
        ]

        return (
            <SimpleTabs>{children}</SimpleTabs>
        )
    }
}

export default App;
