import React from 'react';
import * as d3 from 'd3';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';

export class ScatterPlot extends React.Component {
    constructor(props) {
        super(props);
        // Graph width and height - accounting for margins
        this.drawWidth = this.props.width - this.props.margin.left - this.props.margin.right;
        this.drawHeight = this.props.height - this.props.margin.top - this.props.margin.bottom;

    }
    componentDidMount() {
        this.update();
    }
    // Whenever the component updates, select the <g> from the DOM, and use D3 to manipulate circles
    componentDidUpdate() {
        this.drawWidth = this.props.width - this.props.margin.left - this.props.margin.right;
        this.drawHeight = this.props.height - this.props.margin.top - this.props.margin.bottom;

        var Tooltip = d3.select(".container")
            .append("div")  
            .attr('class', 'tooltip')

        const radius = this.props.radius

        // Three function that change the tooltip when user hover / move / leave a cell
        this.mouseover = function(d) {
            Tooltip
            .style("opacity", 0.8)
            d3.select(this)
            .style("stroke-width", radius / 5)
            .style("stroke", "black")
            .style("opacity", 1)
        }
        this.mousemove = function(e, d) {
            const [x, y] = d3.pointer(e, 'body');
            
            const text = Object.keys(d).map(function(key, index) {
                var value = isNaN(d[key]) ? d[key] : d[key].toLocaleString();
                return `<b>${key}</b> : ${value}<br>`
              })
            
            Tooltip
            .html(text.join(''))
            .style("left", (x+10) + "px")
            .style("top", (y) + "px")
        }
        this.mouseleave = function(e, d) {
            Tooltip
            .style("opacity", 0)
            d3.select(this)
            .style("stroke", "none")
            .style("opacity", 0.8)
        }
        this.update();
    }
    updateScales() {
        // Calculate limits
        let xMin = d3.min(this.props.data, (d) => +d[this.props.xVar] );
        let xMax = d3.max(this.props.data, (d) => +d[this.props.xVar] );
        let yMin = d3.min(this.props.data, (d) => +d[this.props.yVar] );
        let yMax = d3.max(this.props.data, (d) => +d[this.props.yVar] );

        // Define scales
        this.xScale = d3.scaleLinear().domain([xMin, xMax]).range([0, this.drawWidth])
        this.yScale = d3.scaleLinear().domain([yMax, yMin]).range([0, this.drawHeight])
    }

    updateCanvas() {
        const canvasChart = d3.select(this.chartArea)
            .attr('width', this.drawWidth + 1.5*this.props.margin.left)
            .attr('height', this.drawHeight + 1.5*this.props.margin.top)
            .attr('class', 'canvas-plot');

        const context = canvasChart.node().getContext('2d');

        // canvasChart.on('mousemove', (e) => console.log(context.getImageData(...d3.pointer(e), 1, 1)))

        context.globalAlpha = this.props.alpha;

        const xVar = this.props.xVar
        const yVar = this.props.yVar
        const marginLeft = this.props.margin.left
        const marginTop = this.props.margin.top

        function drawPoint(point, color, x, y, radius, xVar, yVar, marginLeft, marginTop) {
            context.beginPath();
            context.fillStyle = color;
            const px = x(point[xVar]) + marginLeft;
            const py = y(point[yVar]) + marginTop;
            
            context.arc(px, py, radius, 0, 2 * Math.PI, true);
            context.fill();
         }

         this.props.data.forEach(point => {
            drawPoint(point, this.props.color, this.xScale, this.yScale, this.props.radius, xVar, yVar, marginLeft, marginTop);
         });
         
         
    }

    updateSvgPoints() {
        // Select all circles and bind data
        let circles = d3.select(this.chartArea).selectAll('circle').data(this.props.data);
        // Use the .enter() method to get your entering elements, and assign their positions
        circles.enter().append('circle')
            .merge(circles)
            .attr('r', (d) => this.props.radius)
            .attr('fill', (d) => this.props.color)
            .attr('label', (d) => d.label)
            .style('fill-opacity', this.props.alpha)
            .on("mouseover", this.mouseover)
            .on("mousemove", this.mousemove)
            .on("mouseleave", this.mouseleave)
            .transition().duration(500)
            .attr('cx', (d) => this.xScale(d[this.props.xVar]))
            .attr('cy', (d) => this.yScale(d[this.props.yVar]))
            .style('stroke', "black")
            .style('stroke-width', (d) => d.selected == true ? "3px" : "0px")
            


        // Use the .exit() and .remove() methods to remove elements that are no longer in the data
        circles.exit().remove();

    }
    updateAxes() {
        let xAxisFunction = d3.axisBottom()
            .scale(this.xScale)
            .ticks(5, 's');

        let yAxisFunction = d3.axisLeft()
            .scale(this.yScale)
            .ticks(5, 's');

        d3.select(this.xAxis)
            .call(xAxisFunction);

        d3.select(this.yAxis)
            .call(yAxisFunction);
    }
    update() {
        this.updateScales();
        this.updateAxes();
        this.props.canvas ? this.updateCanvas() : this.updateSvgPoints()
    }
    render() {
        return (
            <Card id="plot-wrapper">
                <CardContent id='chart-wrapper'>
                        {this.props.canvas && 
                            <canvas style={{"position":"absolute", "zIndex":1}} ref={(node) => { this.chartArea = node; }}
                            transform={`translate(${this.props.margin.left}, ${this.props.margin.top})`} />
                        }
                        <svg className="chart" width={this.props.width} height={this.props.height}>
                            <text transform={`translate(${this.props.margin.left},15)`}>{this.props.title}</text>
                            {!this.props.canvas && 
                            <g ref={(node) => { this.chartArea = node; }}
                            transform={`translate(${this.props.margin.left}, ${this.props.margin.top})`} />
                            }
                            {/* Axes */}
                            <g ref={(node) => { this.xAxis = node; }}
                                transform={`translate(${this.props.margin.left}, ${this.props.height - this.props.margin.bottom})`}></g>
                            <g ref={(node) => { this.yAxis = node; }}
                                transform={`translate(${this.props.margin.left}, ${this.props.margin.top})`}></g>

                            {/* Axis labels */}
                            <text className="axis-label" transform={`translate(${this.props.margin.left + this.drawWidth / 2}, 
                                ${this.props.height - this.props.margin.bottom + 30})`}>{this.props.xVar}</text>

                            <text className="axis-label" transform={`translate(${this.props.margin.left - 30}, 
                                ${this.drawHeight / 2 + this.props.margin.top}) rotate(-90)`}>{this.props.yVar}</text>
                        </svg>
                    
                </CardContent>
            </Card>

        )
    }
}

ScatterPlot.defaultProps = {
    canvas: true,
    data: [{ x: 10, y: 20 }, { x: 15, y: 35 }],
    width: 300,
    height: 300,
    radius: 5,
    alpha:0.3,
    color: "#256cb3",
    margin: {
        left: 50,
        right: 10,
        top: 10,
        bottom: 50
    },
    xVar: 'x',
    yVar: 'y',
};