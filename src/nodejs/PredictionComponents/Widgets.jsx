import React from 'react';
import axios from 'axios';

import TextField from '@material-ui/core/TextField';
import Card from '@material-ui/core/Card';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';
import Icon from '@material-ui/core/Icon';

const names = ['mileage', 'year', 'power', 'model', 'consumption']
const desc = ['Mileage (km)', 'Year', 'Power (hp)', 'Model number', 'Consumption (L/km)']
const defaultValues = [100000, 2019, 150, 4, 6]

const useStyles = makeStyles({
    root: {
      padding: '10px',
      margin: '10px 10px 0px 10px'
    },
  });

const useStyleField = makeStyles((theme) => ({
    root: {
      '& .MuiTextField-root': {
        margin: theme.spacing(1),
      },
    },
  }));

function initDict (values, defaultValue){
  const defaultDict = {}
  values.forEach((v, i) => {
    defaultDict[v] = {...defaultValue}
    defaultDict[v]['value'] = defaultValues[i]
  }) //... used to copy the object
  return defaultDict
}

function useCheckField (initial=initDict(names, {error: false, helper:'', value:NaN})) {
    const [error, setState] = React.useState(initial)
    
    const check = function (e) {
      const name = e.target.name
      const value = e.target.value
      const new_error = {...error}

      new_error[name]['error'] = isNaN(value)
      new_error[name]['value'] = error[name]['error'] ? NaN : parseFloat(value)
      new_error[name]['helper'] = error[name]['error'] ? 'Enter a number.' : ''
      setState(() => new_error)
    }
    return [error, check]
  }

function checkData(errorState, numField=5) {
  var validStates = 0
  Object.keys(errorState).forEach(function(key) {
    !isNaN(errorState[key]['value']) ? validStates++ : validStates
  });

  return validStates == numField
}

function getShap (errorState, props) {
  if (checkData(errorState)){
    var input = [];
    Object.keys(errorState).forEach(function(key){
      input.push(errorState[key]['value'])
    });

    props.setState({predictionValues: input})

    axios({
      method: 'post',
      url: 'http://127.0.0.1:8081/get_shap_values',
      data: {
        "input":input
      },
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Content-Type': 'application/json',
      }
    }).then((response) => props.setState({shapValues: JSON.parse(response.request.response)['shap_values']}));
  }else{
    alert("Fill in all required fields to get SHAP values")
  }
}
  
export default function ValidationTextFields(props) {
    const classes = useStyles();
    const classesField = useStyleField();

    const [error, check] = useCheckField()

    const textFields = names.map(function(name, i) {
      return (
        <TextField
          name={name}
          error={error[name]["error"]}
          label={desc[i]}
          defaultValue={defaultValues[i]}
          onChange={check}
          helperText={error[name]["helper"]}
          key={name}
      />
      )
    })

    return (
        <Card variant="outlined" className={classes.root}>
            <form noValidate autoComplete="off" className={classesField.root}>
                {textFields}
                <Button
                variant="contained"
                color="primary"
                endIcon={<Icon>send</Icon>}
                onClick={() => getShap(error, props)}
              >Predict</Button>
            </form>
        </Card>
    );
}
