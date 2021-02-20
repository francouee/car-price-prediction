import React from 'react';
import Select from '@material-ui/core/Select';
import Grid from '@material-ui/core/Grid';
import InputLabel from '@material-ui/core/InputLabel';
import Slider from '@material-ui/core/Slider';
import Typography from '@material-ui/core/Typography';
import MenuItem from '@material-ui/core/MenuItem';
import Card from '@material-ui/core/Card';
import { makeStyles } from '@material-ui/core/styles';



const useStyles = makeStyles({
    root: {
      padding: '10px',
      margin: '10px 10px 0px 10px'
    },
  });


export default function CustomWidgets(props) {
    const classes = useStyles();

    return (
        <Card className={classes.root} variant="outlined">
            <Grid
                container
                direction="row"
                justify="center"
                alignItems="center"
                spacing={2}
                >
                    <Grid item xs={6} md={2}>
                        <Typography id="discrete-slider-alpha" gutterBottom>
                            alpha
                        </Typography>
                        <Slider 
                            value={props.alpha} 
                            onChange={(e, value) => props.setState({ alpha: value})} 
                            onChangeCommitted={(e, value)  => props.setState({ alpha: value})} 
                            aria-labelledby="discrete-slider-alpha" 
                            max={0.7} 
                            valueLabelDisplay="auto"
                            marks={true}
                            step={0.02}
                        />
                    </Grid>
                    <Grid item xs={6} md={2}>
                        <Typography id="discrete-slider-radius" gutterBottom>
                            radius
                        </Typography>
                        <Slider 
                            value={props.radius} 
                            onChange={(e, value) => props.setState({ radius: value})} 
                            onChangeCommitted={(e, value)  => props.setState({ radius: value})} 
                            aria-labelledby="discrete-slider-radius" 
                            max={10} 
                            min={0.5}
                            valueLabelDisplay="auto"
                            marks={true}
                            step={0.5}
                        />
                    </Grid>
                    <Grid item xs={6} md={2}>
                        <InputLabel id="drawing-method-select">drawing method</InputLabel>
                            <Select
                                id="drawing-method" 
                                labelId="drawing-method-select"
                                value={props.canvas} 
                                className="custom-select" 
                                onChange={(d) => props.setState({ canvas: d.target.value })}
                            >
                                {['svg', 'canvas'].map((d) => {
                                    return <MenuItem value={d === 'canvas' ? true : false} key={d}>{d}</MenuItem>
                                })}
                            </Select>
                    </Grid>
                    <Grid item xs={6} md={2}>
                        <InputLabel id="xVar-select-label">x variable</InputLabel>
                            <Select
                                id="xVar" 
                                labelId="xVar-select-label"
                                value={props.xVar} 
                                className="custom-select" 
                                onChange={(d) => props.setState({ xVar: d.target.value })}
                            >
                                {props.options.map((d) => {
                                    return <MenuItem value={d} key={d}>{d}</MenuItem>
                                })}
                            </Select>
                    </Grid>
                    <Grid item xs={6} md={2}>
                    <InputLabel id="yVar-select-label">y variable</InputLabel>
                        <Select
                            id="yVar" 
                            labelId="yVar-select-label"
                            value={props.yVar} 
                            className="custom-select" 
                            onChange={(d) => props.setState({ yVar: d.target.value })}
                        >
                            {props.options.map((d) => {
                                return <MenuItem value={d} key={d}>{d}</MenuItem>
                            })}
                        </Select>
                    </Grid>
                </Grid>
            </Card>
        )
    }
