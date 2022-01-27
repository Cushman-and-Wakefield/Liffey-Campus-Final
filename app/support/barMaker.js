 /* Copyright 2017 Esri

   Licensed under the Apache License, Version 2.0 (the "License");

   you may not use this file except in compliance with the License.

   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software

   distributed under the License is distributed on an "AS IS" BASIS,

   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.

   See the License for the specific language governing permissions and

   limitations under the License.
   ​
   */

define([
    "esri/tasks/support/Query",

    "dojo/dom-construct",
    "dojo/_base/window",
    "dojo/on",
    "dojo/dom",

    "c-through/support/applyRenderer",
    "c-through/support/queryTools"

], function (
    Query,
    domCtr, win, on, dom,
    applyRenderer, queryTools
) {
        return {
           //For Area chart
            createChartData: function (selection, settings, bins) {

                this.selection = selection;

                var chartData = [];
                var kernel = [];
                var totalrange = [];

                if (bins > selection.length) {
                    bins = selection.length - 1;
                }

                for (var j = 0; j < selection.length; j++) {
                    totalrange.push(selection[j].attributes[settings.areaname]);
                }

                function maxIterate(arr) {
                    var max = arr[0];
                    for (var i = 0; i < arr.length; i++) {
                        if (arr[i] > max) {
                            max = arr[i];
                        }
                    }
                    return max;
                }

                function minIterate(arr, max) {
                    var min = max;
                    for (var i = 0; i < arr.length; i++) {
                        if (arr[i] < min) {
                            min = arr[i];
                        }
                    }
                    return min;
                }

                var max = maxIterate(totalrange);
                var min = minIterate(totalrange, max);

                if (Math.round(min) === 1) {
                    min = 0;
                }

                var kernelwidth = (max - min) / bins;

                if (kernelwidth > 1000) {
                    kernelwidth = 500 * Math.round(kernelwidth / 500);
                }
                else if (kernelwidth < 1000 && kernelwidth > 500) {
                    kernelwidth = 250 * Math.round(kernelwidth / 250);
                }
                else if (kernelwidth < 500 && kernelwidth > 200) {
                    kernelwidth = 100 * Math.round(kernelwidth / 100);
                }
                else if (kernelwidth < 200 && kernelwidth > 100) {
                    kernelwidth = 50 * Math.round(kernelwidth / 50);
                }
                else if (kernelwidth < 100 && kernelwidth > 50) {
                    kernelwidth = 10 * Math.round(kernelwidth / 10);
                }
                else if (kernelwidth < 50 && kernelwidth > 10) {
                    kernelwidth = 5 * Math.round(kernelwidth / 5);
                }
                else {
                    kernelwidth = Math.round(kernelwidth);
                }

                min = kernelwidth * Math.round(min / kernelwidth);

                var bins_new = (max - min) / kernelwidth;

                // set up bins with ranges
                for (var n = 0; n < bins_new; n++) {
                    kernel.push({
                        min: min,
                        max: min + kernelwidth
                    });
                    min += kernelwidth;
                }

                var color = [];

                if (bins_new > 9) {
                    color = ["#E4002B", "#A6192B", "#9BD3DD", "#D9ECEB", "#0093B2", "#56AAC6", "#9EC8DB", "#003865", "#526180", "#001933"];

                }
                else {
                    color = ["#E4002B", "#A6192B", "#9BD3DD", "#D9ECEB", "#0093B2", "#001933"];
                }



                for (var i = 0; i < kernel.length; i++) {
                    chartData.push({
                        kernel: Math.round(kernel[i].min) + "m2 - " + Math.round(kernel[i].max) + "m2",
                        count: 0,
                        subdata: [
                            { min: kernel[i].min, max: kernel[i].max }
                        ],
                        "color": color[i]
                    });
                }

                for (var k = 0; k < totalrange.length; k++) {
                    for (var m = 0; m < kernel.length; m++) {
                        if (totalrange[k] > kernel[m].min && totalrange[k] <= kernel[m].max) {
                            chartData[m].count += 1;
                        }
                    }
                }

                return chartData;
            },


            createChart: function (selection, data, settings, state, view, callback) {

                var chart = AmCharts.makeChart("chartDiv", {
                    "type": "serial",
                    "theme": "light",
                    "sequencedAnimation": false,
                    "dataProvider": data,
                    "fontSize": 12,
                    "fontFamily": "Avenir LT W01 65 Medium",
                    "valueAxes": [{
                        "gridColor": "#FFFFFF",
                        "gridAlpha": 0.2,
                        "dashLength": 0
                    }],
                    "gridAboveGraphs": true,
                    "startDuration": 1,
                    "graphs": [{
                        "balloonText": "[[category]]: <b>[[value]]</b>",
                        "fillAlphas": 0.8,
                        "lineAlpha": 0,
                        "fillColorsField": "color",
                        "type": "column",
                        "valueField": "count"
                    }],
                    "chartCursor": {
                        "categoryBalloonEnabled": false,
                        "cursorAlpha": 0,
                        "zoomable": false
                    },
                    "categoryField": "kernel",
                    "categoryAxis": {
                        "gridPosition": "start",
                        "labelRotation": 45,
                        "gridAlpha": 0,
                        "tickPosition": "start",
                        "tickLength": 20
                    },
                    "export": {
                        "enabled": true
                    }

                });

                callback("loaded");

                chart.addListener("clickGraphItem", function (event) {

                    var max = event.item.dataContext.subdata[0].max;
                    var min = event.item.dataContext.subdata[0].min;
                    var color = event.item.dataContext.color;

                    settings.layer1.renderer = applyRenderer.createRendererVVbar(min, max, color, settings.areaname);
                    
                    view.environment.lighting.directShadowsEnabled = false;
                    view.environment.lighting.ambientOcclusionEnabled = false;
                });

                on(dom.byId("reload"), "click", function (event) {

                    settings.layer1.renderer = applyRenderer.createRendererVV(selection, settings.areaname);
                    
                    view.environment.lighting.directShadowsEnabled = true;
                    view.environment.lighting.ambientOcclusionEnabled = true;
                });

            },
         //For Lease Expiry Date
            createChartData_exp: function (selection, settings, bins) {
                
                this.selection = selection;

                var chartData = [];
                var year = [];
                var totalrange = [];
             
                 for (var j = 0; j < selection.length; j++) {
                    totalrange.push(selection[j].attributes[settings.leaseexpiryname]);
                }

                /*totalrange = ['2022', '2022', '2029', '2022', '2025', '2025', '2030'] 
                var unique_years = ['2021', '2022', '2025', '2029', '2030', '2035']
                var bins_new = 6*/
             
                var years =[];
                var unique_years = [];
                function generateArrayOfYears() {
                    for (var k = 0; k < totalrange.length; k++) {
                      var year_temp = new Date(totalrange[k]).getFullYear();
                       years.push(year_temp.toString());
                     }
                     return years;
                }
                totalrange = generateArrayOfYears();

                function onlyUnique(value, index, self) {
                     return self.indexOf(value) === index;
                }

                unique_years = totalrange.filter(onlyUnique);
             
                unique_years = unique_years.filter(function(value, index, arr){ 
                       return value != '1970';
                   });
             
                unique_years.sort(function (a, b) { return a - b; });
             
                var bins_new = unique_years.length;
             
                var color = [];

                if (bins_new > 9) {
                    color = ["#E4002B", "#A6192B", "#9BD3DD", "#D9ECEB", "#0093B2", "#56AAC6", "#9EC8DB", "#003865", "#526180", "#001933"];

                }
                else {
                    color = ["#E4002B", "#A6192B", "#9BD3DD", "#D9ECEB", "#0093B2", "#001933"];
                }
             

                for (var i = 0; i < unique_years.length; i++) {
                    chartData.push({
                        year: unique_years[i],
                        count: 0,
                        "color": color[i]
                    });
                }

                for (var k = 0; k < totalrange.length; k++) {
                    for (var m = 0; m < unique_years.length; m++) {
                        if (totalrange[k] == unique_years[m]) {
                            chartData[m].count += 1;
                        }
                    }
                }

                return chartData;
            },


            createChart_exp: function (selection, data, settings, state, view, callback) {

                var chart = AmCharts.makeChart("chartDiv", {
                    "type": "serial",
                    "theme": "light",
                    "sequencedAnimation": false,
                    "dataProvider": data,
                    "fontSize": 12,
                    "fontFamily": "Avenir LT W01 65 Medium",
                    "valueAxes": [{
                        "gridColor": "#FFFFFF",
                        "gridAlpha": 0.2,
                        "dashLength": 0
                    }],
                    "gridAboveGraphs": true,
                    "startDuration": 1,
                    "graphs": [{
                        //"balloonText": "[[category]]: <b>[[value]]</b>",
                        "fillAlphas": 0.8,
                        "lineAlpha": 0,
                        "fillColorsField": "color",
                        "type": "column",
                        "valueField": "count"
                    }],
                    "chartCursor": {
                        "categoryBalloonEnabled": false,
                        "cursorAlpha": 0,
                        "zoomable": false
                    },
                    "categoryField": "year",
                    "categoryAxis": {
                        "gridPosition": "start",
                        "labelRotation": 45,
                        "gridAlpha": 0,
                        "tickPosition": "start",
                        "tickLength": 20
                    },
                    "export": {
                        "enabled": true
                    }

                });

                callback("loaded");

                chart.addListener("clickGraphItem", function (event) {

                    var year = event.item.dataContext.year;
                    //var year_max = event.item.dataContext.year;
                    //year = parseInt(year);
                    //year_max = parseInt(year_max);
                    var color = event.item.dataContext.color;

                    settings.layer1.renderer = applyRenderer.createRenderer(year, color, settings.leaseexpiryname);
                    console.info(year);
                    console.info(settings.leaseexpiryname);
                    
                    view.environment.lighting.directShadowsEnabled = false;
                    view.environment.lighting.ambientOcclusionEnabled = false;
                });

                
            },

            rgbToHex: function (color) {

                var colorhex = [];

                for (var i = 0; i < color.length; i++) {
                    var r = color[i][0];
                    var g = color[i][1];
                    var b = color[i][2];

                    var hex = "#" + this.componentToHex(r) + this.componentToHex(g) + this.componentToHex(b);

                    colorhex.push(hex);
                }

                return colorhex;
            },

            componentToHex: function (c) {
                var hex = c.toString(16);
                return hex.length == 1 ? "0" + hex : hex;
            }
        };
    });
