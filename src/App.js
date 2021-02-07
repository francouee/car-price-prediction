import React from 'react';

function Field ({name, value, onChange, children}) {
    return <div className="form-group"> 
        <label htmlFor={name}>{children}</label>
        <input type="text" value={value} onChange={onChange} id={name} name={name} className="form-control"></input>
    </div>
}

function BoilingVerdict(props) {
    const celsius = props.celsius
    if (celsius >= 100) {
      return <div className="alert alert-success">L'eau bout.</div>;  }
    return <div className="alert alert-info">L'eau ne bout pas.</div>;
}

function toCelsius(fahrenheit) {
    return (fahrenheit - 32) * 5 / 9;
  }
  
  function toFahrenheit(celsius) {
    return (celsius * 9 / 5) + 32;
  }

class App extends React.Component {

    constructor (props) {
        super(props)
        this.state = {
            "celsius": '',
            "fahrenheit": ''
        }
        this.handleChange = this.handleChange.bind(this)
    }

    

    handleChange (e) {
        const name = e.target.name
        const type = e.target.type
        const value = type === 'checkbox' ? e.target.checked : e.target.value
        const otherName = name === 'celsius' ? 'fahrenheit' : 'celsius'
        const otherTemp = name === 'celsius' ? toFahrenheit(value) : toCelsius(value)
        this.setState({
            [name] : value,
            [otherName] : otherTemp.toFixed(1)
        })

    }

    render () {
        return <>
                <div className="d-grid gap-3">
                    <Field name="celsius" value={this.state.celsius} onChange={this.handleChange} >Température °C</Field>
                    <Field name="fahrenheit" value={this.state.fahrenheit} onChange={this.handleChange} >Température °F</Field>
                    <BoilingVerdict celsius={parseFloat(this.state.celsius)} ></BoilingVerdict>
                </div>
            </>
    }

}

export default App;
