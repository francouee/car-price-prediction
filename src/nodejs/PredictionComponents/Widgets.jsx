import React from 'react';

import TextField from '@material-ui/core/TextField';
import Card from '@material-ui/core/Card';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';
import Icon from '@material-ui/core/Icon';

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

function useCheckField (e, initial={error: false, helper:''}) {
    const [error, setState] = React.useState(initial)
    const check = function (e) {
      setState(() => { return {
          error: isNaN(e.target.value),
          helper: isNaN(e.target.value) ? 'Enter a number.' : ''
        }
        })
    }

    return [error, check]
  }
  
export default function ValidationTextFields() {
    const classes = useStyles();
    const classesField = useStyleField();

    const [error, check] = useCheckField(false)

    return (
        <Card variant="outlined" className={classes.root}>
            <form noValidate autoComplete="off" className={classesField.root}>
                <TextField
                error={error.error}
                label="Mileage (Km)"
                defaultValue="20000"
                onChange={check}
                helperText={error.helper}
                />
                <TextField
                error
                label="Year"
                defaultValue="2019"
                helperText="Incorrect entry."
                />
                <TextField
                error
                label="Power (hp)"
                defaultValue="200"
                helperText="Incorrect entry."
                />
                <TextField
                error
                label="Model number"
                defaultValue="3"
                helperText="Incorrect entry."
                />
                <TextField
                error
                label="Consumption"
                defaultValue="6.3"
                helperText="Incorrect entry."
                />
                <Button
                variant="contained"
                color="primary"
                className={classes.button}
                endIcon={<Icon>send</Icon>}
                ></Button>
            </form>
            
        </Card>
    );
}
