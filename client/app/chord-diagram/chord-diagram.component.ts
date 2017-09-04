// client/app/app.component.ts

import { Component, OnInit, OnChanges, ViewEncapsulation, Input } from '@angular/core';
import * as d3 from 'd3';
import * as chroma from 'chroma-js';
import customChordSort from './custom.chord.sort';

@Component({
  selector: 'chord-diagram',
  templateUrl: './app/chord-diagram/chord-diagram.component.html',
  styleUrls: [
    './app/chord-diagram/chord-diagram.component.css'
  ],
  encapsulation: ViewEncapsulation.None
})

export class ChordComponent implements OnInit, OnChanges {

  @Input() private id: string;
  @Input() private data: Array<any>;
  @Input() private sort: string = "1";
  private chart: any;
  private width: number;
  private height: number;

  constructor() {}
  
  ngOnInit() {
    this.createChart();
    if (this.data) {
      this.updateChart();
    }
  }
  
  ngOnChanges() {
    if (this.chart) {
      this.updateChart();
    }
  }

  createChart() {
    ////////////////////////////////////////////////////////////
    //////////////////////// Set-Up ////////////////////////////
    ////////////////////////////////////////////////////////////

    const chartID = this.id;
    const groupSort = parseInt(this.sort);
    const Names = this.data.slice(0, 1)[0];
    const matrix = this.data.slice(1);
    const chart = d3.select("#" + chartID).select("div");
    
    var margin = { left: 20, top: 20, right: 20, bottom: 20 },
      width = chart.node().getBoundingClientRect().width - margin.left - margin.right,
      height = chart.node().getBoundingClientRect().width - margin.top - margin.bottom,
      innerRadius = width * .42,
      outerRadius = innerRadius * 1.07,
      opacityDefault = .8,
      transDur = 500;

    ////////////////////////////////////////////////////////////
    /////////// Create scale and layout functions //////////////
    ////////////////////////////////////////////////////////////

    var chord = customChordSort()
      .padAngle(0.025)
      .sortGroups(groupSort ? d3.descending : null)
      .sortSubgroups(d3.descending)
      .sortChords(d3.descending); //which chord should be shown on top when chords cross. Now the biggest chord is at the bottom

    var arc = d3.arc()
      .innerRadius(innerRadius * 1.01)
      .outerRadius(outerRadius);

    var ribbon = d3.ribbon()
      .radius(innerRadius);
    
    var color = chroma.cubehelix()
      .start(270)
      .rotations(-5/9)
      .hue([.35, 1.1])
      .gamma(1)
      .lightness([0.35, 0.8])
      .scale()
      .correctLightness()
      .domain([0, 2 * Math.PI]);

    ////////////////////////////////////////////////////////////
    ////////////////////// Create SVG //////////////////////////
    ////////////////////////////////////////////////////////////

    var svg = chart.append("svg")
      .attr("preserveAspectRatio", "xMinYMin meet")
      .attr("viewBox", "0 0 " + (width + margin.left + margin.right) + " " + (height + margin.top + margin.bottom));

    var g = svg.append("g")
      .attr("transform", "translate(" + (width / 2 + margin.left) + "," + (height / 2 + margin.top) + ")")
      .datum(chord(matrix));
      
    var tooltip = chart.append("div")
      .attr("id", "tooltip");

    ////////////////////////////////////////////////////////////
    ////////////////// Draw outer Arcs /////////////////////////
    ////////////////////////////////////////////////////////////

    var outerArcs = g.append("g")
      .attr("class", "groups")
      .selectAll("g")
      .data(function(chords) { return chords.groups; })
      .enter().append("g").attr("id", function(d) { return chartID + "-Group" + d.index; });

    outerArcs.append("path")
      .style("fill", function(d) { return color((d.endAngle + d.startAngle) / 2); })
      .style("stroke", function(d) { return d3.rgb(color((d.endAngle + d.startAngle) / 2)).darker(); })
      .style("opacity", opacityDefault)
      .on("mouseover", mouseoverGroup)
      .on("mouseout", mouseoutChord)
      .on("mousemove", updateTooltipPosition)
      .attr("d", arc)
      .each(function(d, i) {
        //Search pattern for everything between the start and the first capital L
        var firstArcSection = /(^.+?)L/;

        //Grab everything up to the first Line statement
        var newArc = firstArcSection.exec(d3.select(this).attr("d"))[1];
        //Replace all the comma's so that IE can handle it
        newArc = newArc.replace(/,/g, " ");

        //If the end angle lies beyond a quarter of a circle (90 degrees or pi/2) 
        //flip the end and start position
        if ((d.endAngle + d.startAngle) / 2 > 90 * Math.PI / 180 & (d.endAngle + d.startAngle) / 2 < 270 * Math.PI / 180) {
          var startLoc = /M(.*?)A/, //Everything between the first capital M and first capital A
            middleLoc = /A(.*?)0 0 1/, //Everything between the first capital A and 0 0 1
            endLoc = /0 0 1 (.*?)$/; //Everything between the first 0 0 1 and the end of the string (denoted by $)
          //Flip the direction of the arc by switching the start en end point (and sweep flag)
          //of those elements that are below the horizontal line
          var newStart = endLoc.exec(newArc)[1];
          var newEnd = startLoc.exec(newArc)[1];
          var middleSec = middleLoc.exec(newArc)[1];

          //Build up the new arc notation, set the sweep-flag to 0
          newArc = "M" + newStart + "A" + middleSec + "0 0 0 " + newEnd;
        } //if;

        //Create a new invisible arc that the text can flow along
        svg.append("path")
          .attr("class", "hiddenArcs")
          .attr("id", chartID + "-arc" + i)
          .attr("d", newArc)
          .style("fill", "none");
      });

    ////////////////////////////////////////////////////////////
    ////////////////// Append Names ////////////////////////////
    ////////////////////////////////////////////////////////////

    //Append the label names on the outside
    outerArcs.append("text")
      .attr("class", "titles")
      .attr("dy", function(d, i) { return ((d.endAngle + d.startAngle) / 2 > 90 * Math.PI / 180 & (d.endAngle + d.startAngle) / 2 < 270 * Math.PI / 180 ? innerRadius * .1 : -(innerRadius * .035)); })
      .append("textPath")
      .attr("startOffset", "50%")
      .style("text-anchor", "middle")
      .style("font-size", function(d) {return innerRadius*.1;})
      .attr("xlink:href", function(d, i) { return "#" + chartID + "-arc" + i; })
      .text(function(d, i) { return Names[i]; });

    ////////////////////////////////////////////////////////////
    ////////////////// Draw inner chords ///////////////////////
    ////////////////////////////////////////////////////////////

    g.append("g")
      .attr("class", "ribbons")
      .selectAll("path")
      .data(function(chords) { return chords; })
      .enter().append("path")
      .attr("d", ribbon)
      .attr("class", "chord")
      .style("fill", function(d) { return chart.select("#" + chartID + "-Group" + d.target.index + " path").node().style.fill; })
      .style("stroke", function(d) { return chart.select("#" + chartID + "-Group" + d.target.index + " path").node().style.stroke; })
      .style("opacity", opacityDefault)
      .on("mouseover", mouseoverChord)
      .on("mouseout", mouseoutChord)
      .on("mousemove", updateTooltipPosition);

    ////////////////////////////////////////////////////////////
    ////////////////// Extra Functions /////////////////////////
    ////////////////////////////////////////////////////////////

    //Returns an event handler for fading a given chord group.
    function mouseoverGroup(d, i) {
      svg.selectAll("path.chord")
        .filter(function(d) { return d.source.index !== i && d.target.index !== i; })
        .transition().duration(transDur)
        .style("opacity", .1);

      tooltip
        .html(Names[this.__data__.index] + " has liked " + this.__data__.outValue + " messages (" + d3.format(".1%")(this.__data__.outValue / this.__data__.total) + "),<br/>and has received " + this.__data__.value + " likes (" + d3.format(".1%")(this.__data__.value / this.__data__.total) + ").<br/>( " + d3.format(".2r")(this.__data__.outValue / this.__data__.value) + "/1 ratio )")
        .style("top", function() { return (d3.mouse(chart.node())[1] - tooltip.node().getBoundingClientRect().height - 20) + "px" })
        .style("left", function() { return Math.max(5, Math.min(chart.node().getBoundingClientRect().width - tooltip.node().getBoundingClientRect().width, (d3.mouse(chart.node())[0] - tooltip.node().getBoundingClientRect().width / 2))) + "px"; })
        .style("visibility", "visible")
        .transition()
        .style("opacity", 0)
        .transition().delay(1000).duration(1000)
        .style("opacity", .8)
        .transition().delay(4000).duration(5000)
        .style("opacity", 0);
    } //fade

    function updateTooltipPosition() {
      tooltip
        .style("top", function() { return (d3.mouse(chart.node())[1] - tooltip.node().getBoundingClientRect().height - 20) + "px" })
        .style("left", function() { return Math.max(5, Math.min(chart.node().getBoundingClientRect().width - tooltip.node().getBoundingClientRect().width, (d3.mouse(chart.node())[0] - tooltip.node().getBoundingClientRect().width / 2))) + "px"; })
        .style("visibility", "visible")
        // .transition()
        // .style("opacity", 0)
        .transition().delay(1000).duration(1000)
        .style("opacity", .8)
        .transition().delay(4000).duration(5000)
        .style("opacity", 0);
    }

    //Highlight hovered over chord
    function mouseoverChord(d, i) {
      //Decrease opacity to all
      svg.selectAll("path.chord")
        .transition().duration(transDur)
        .style("opacity", 0.1);
      //Show hovered over chord with full opacity
      d3.select(this)
        .transition().duration(transDur)
        .style("opacity", 1);

      tooltip
        .html(Names[this.__data__.target.index] + " has liked " + this.__data__.source.value + " of " + Names[this.__data__.source.index] + "'s messages,<br/>" + Names[this.__data__.source.index] + " has liked " + this.__data__.target.value + " of " + Names[this.__data__.target.index] + "'s messages.<br/>( " + d3.format(".2r")(this.__data__.source.value / this.__data__.target.value) + "/1 ratio )")
        .style("top", function() { return (d3.mouse(chart.node())[1] - tooltip.node().getBoundingClientRect().height - 20) + "px" })
        .style("left", function() { return Math.max(5, Math.min(chart.node().getBoundingClientRect().width - tooltip.node().getBoundingClientRect().width, (d3.mouse(chart.node())[0] - tooltip.node().getBoundingClientRect().width / 2))) + "px"; })
        .style("visibility", "visible")
        .transition()
        .style("opacity", 0)
        .transition().delay(1000).duration(1000)
        .style("opacity", .8)
        .transition().delay(4000).duration(5000)
        .style("opacity", 0);

    } //mouseoverChord

    //Bring all chords back to default opacity
    function mouseoutChord(d) {
      tooltip
        .transition()
        .style("opacity", 0)
        .style("visibility", "hidden")
      svg.selectAll("path.chord")
        .transition().duration(transDur)
        .style("opacity", opacityDefault);
    } //function mouseoutChord
  }
  
  updateChart() {
    
  }
}
