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

/*
 * Title: Visualization Tool
 * Author: Lisa Staehli
 * Date: 04/24/17
 * Description: changes renderer of the active layer
 * according to selection and filter. Shows statistics
 * and adjusts charts according to selection and filter.
 */

define([
    "esri/core/Accessor",
    "esri/tasks/support/Query",

    "dojo/dom-construct",
    "dojo/_base/window",
    "dojo/dom",
    "dojo/dom-style",
    "dojo/on",

    "c-through/support/applyRenderer",

    "c-through/support/chartMaker",
    "c-through/support/barMaker",
    "c-through/support/statsMaker",

    "c-through/support/queryTools"

], function (
    Accessor, Query,
    domCtr, win, dom, domStyle, on,
    applyRenderer,
    chartMaker, barMaker, statsMaker,
    queryTools
) {
        return Accessor.createSubclass({
            declaredClass: "c-through.VizTool",

            constructor: function (params) {

                this.container = params.container;
                this.menu = params.menu;
                this.scene = params.scene;
                this.highlight = params.highlightstate;
                this.viz = params.vizstate;
                this.filter = params.filterstate;
                this.settings = params.settings;
                this.view = params.view;

                this.createUI(this.container);
                this.updateUI(this.viz);
                this.clickHandler();

                this.init();

            },

            init: function () {

                this.initialChart(this.settings, function (data, chartdata) {

                    this.initData = data;
                    this.initCharts = chartdata;

                    this.setSelection(this.select);

                    this.menu.setInitData(data);

                }.bind(this));

            },

            createUI: function (container) {
                this.title = domCtr.create("div", { className: "titleViz", id: "titleViz", innerHTML: "Visualise by" }, container);
                this.label1 = domCtr.create("div", { className: "labelViz", id: "viz-white", innerHTML: "None" }, container);
                this.label2 = domCtr.create("div", { className: "labelViz", id: "viz-usage", innerHTML: "Usage" }, container);
                this.label4 = domCtr.create("div", { className: "labelViz", id: "viz-tenancy", innerHTML: "Tenancy" }, container);
                this.label5 = domCtr.create("div", { className: "labelViz", id: "viz-leaseexpiry", innerHTML: "Lease Expiry" }, container);
                this.label6 = domCtr.create("div", { className: "labelViz", id: "viz-reviewdate", innerHTML: "Next Review" }, container);
                this.label3 = domCtr.create("div", { className: "labelViz", id: "viz-area", innerHTML: "Area" }, container);

                this.statsDiv = domCtr.create("div", { id: "statsDiv", className: "statsDiv" }, container);
                this.chartDiv = domCtr.create("div", { id: "chartDiv", className: "chartDiv" }, container);


                domCtr.create("div", { id: "titleStats", innerHTML: "Statistics" }, "statsDiv");
                domCtr.create("div", { id: "numberofwholebuildings", innerHTML: "<small>Number of Buildings     <br></small>" }, "statsDiv");
                //domCtr.create("div", { className: "statsViz", id: "numberofunits", innerHTML: "<small>Number of Units     <br></small>" }, "statsDiv");
                domCtr.create("div", { className: "statsViz_left", id: "usage", innerHTML: "<small>Most Common Usage       <br></small>" }, "statsDiv");
                domCtr.create("div", { className: "statsViz_right", id: "tenancy", innerHTML: "<small>Largest Tenant       <br></small>" }, "statsDiv");
                domCtr.create("div", { className: "statsViz_left", id: "totalarea", innerHTML: "<small>Total Area     <br></small>" }, "statsDiv");
                //domCtr.create("div", { id: "averagearea", innerHTML: "<small>Average Area      <br></small>" }, "statsDiv");
                //domCtr.create("div", { className: "statsViz_right", id: "maxarea", innerHTML: "<small>Max Area      <br></small>" }, "statsDiv");
                domCtr.create("div", { className: "statsViz_right", id: "maxfloor", innerHTML: "<small>Max Floor Number    <br></small>" }, "statsDiv");
                //domCtr.create("div", { className: "statsViz_right", id: "averagefloor", innerHTML: "<small>Average Floor Number     <br></small>" }, "statsDiv");
                domCtr.create("div", { className: "statsViz_left", id: "nextexpiry", innerHTML: "<small>Next Lease Expiry     <br></small>" }, "statsDiv");
                domCtr.create("div", { className: "statsViz_right", id: "nextreview", innerHTML: "<small>Next Review     <br></small>" }, "statsDiv");
                
            },

            updateUI: function (state) {
                var viz = state.name;

                if (viz === "white") {
                    domStyle.set(dom.byId("viz-white"), { "opacity": 1});
                    domStyle.set(dom.byId("viz-usage"), { "opacity": 0.3});
                    domStyle.set(dom.byId("viz-tenancy"), { "opacity": 0.3});
                    domStyle.set(dom.byId("viz-leaseexpiry"), { "opacity": 0.3});
                    domStyle.set(dom.byId("viz-reviewdate"), { "opacity": 0.3});
                    domStyle.set(dom.byId("viz-area"), { "opacity": 0.3});
                    domCtr.destroy(dom.byId("reload"));
                }

                if (viz === "usage") {
                    domStyle.set(dom.byId("viz-usage"), { "opacity": 1});
                    domStyle.set(dom.byId("viz-white"), { "opacity": 0.3});
                    domStyle.set(dom.byId("viz-tenancy"), { "opacity": 0.3});
                    domStyle.set(dom.byId("viz-leaseexpiry"), { "opacity": 0.3});
                    domStyle.set(dom.byId("viz-reviewdate"), { "opacity": 0.3});
                    domStyle.set(dom.byId("viz-area"), { "opacity": 0.3});
                    domCtr.destroy(dom.byId("reload"));
                }
               
                if (viz === "tenancy") {
                    domStyle.set(dom.byId("viz-tenancy"), { "opacity": 1});
                    domStyle.set(dom.byId("viz-leaseexpiry"), { "opacity": 0.3});
                    domStyle.set(dom.byId("viz-reviewdate"), { "opacity": 0.3});
                    domStyle.set(dom.byId("viz-usage"), { "opacity": 0.3});
                    domStyle.set(dom.byId("viz-white"), { "opacity": 0.3});
                    domStyle.set(dom.byId("viz-area"), { "opacity": 0.3});
                    domCtr.destroy(dom.byId("reload"));
                }
             
                if (viz === "leaseexpiry") {
                    domStyle.set(dom.byId("viz-leaseexpiry"), { "opacity": 1});
                    domStyle.set(dom.byId("viz-tenancy"), { "opacity": 0.3});
                    domStyle.set(dom.byId("viz-reviewdate"), { "opacity": 0.3});
                    domStyle.set(dom.byId("viz-usage"), { "opacity": 0.3});
                    domStyle.set(dom.byId("viz-white"), { "opacity": 0.3});
                    domStyle.set(dom.byId("viz-area"), { "opacity": 0.3});
                    domCtr.destroy(dom.byId("reload"));
                    
                }
             
                if (viz === "reviewdate") {
                    domStyle.set(dom.byId("viz-reviewdate"), { "opacity": 1});
                    domStyle.set(dom.byId("viz-leaseexpiry"), { "opacity": 0.3});
                    domStyle.set(dom.byId("viz-tenancy"), { "opacity": 0.3});
                    domStyle.set(dom.byId("viz-usage"), { "opacity": 0.3});
                    domStyle.set(dom.byId("viz-white"), { "opacity": 0.3});
                    domStyle.set(dom.byId("viz-area"), { "opacity": 0.3});
                    domCtr.destroy(dom.byId("reload"));
                    
                }

                if (viz === "area") {
                    domStyle.set(dom.byId("viz-area"), { "opacity": 1});
                    domStyle.set(dom.byId("viz-white"), { "opacity": 0.3});
                    domStyle.set(dom.byId("viz-tenancy"), { "opacity": 0.3});
                    domStyle.set(dom.byId("viz-leaseexpiry"), { "opacity": 0.3});
                    domStyle.set(dom.byId("viz-reviewdate"), { "opacity": 0.3});
                    domStyle.set(dom.byId("viz-usage"), { "opacity": 0.3});
                    this.reload = domCtr.create("div", { id: "reload" }, this.container);
                    domCtr.create("img", { className: "reload", src: "img/reload.png", style: "width:25px;height:25px" }, this.reload);
                }
            },

            updateVizState: function (state) {
                this.updateUI(state);
                this.menu.setVizState(state);
            },

            setVizState: function (state, filter, highlight, expression) {
                this.highlight = highlight;
                this.filter = filter;
                this.viz = state;
                this.expression = expression;
                this.filterName = filter.name;

                this.setSelection(this.highlight.name, this.highlight.features, this.expression);
            },

            clickHandler: function () {

                on(this.label1, "click", function (evt) {
                    this.updateVizState({ name: "white" });
                }.bind(this));

                on(this.label2, "click", function (evt) {
                    this.updateVizState({ name: "usage" });
                }.bind(this));
             
               on(this.label4, "click", function (evt) {
                    this.updateVizState({ name: "tenancy" });
                }.bind(this));
             
               on(this.label5, "click", function (evt) {
                    this.updateVizState({ name: "leaseexpiry" });
                }.bind(this));
                
                on(this.label6, "click", function (evt) {
                    this.updateVizState({ name: "reviewdate" });
                }.bind(this));

                on(this.label3, "click", function (evt) {
                    this.updateVizState({ name: "area" });
                }.bind(this));

            },

            initialChart: function (settings, callback) {

                settings.layer1.load().then(function () {

                    var query = settings.layer1.createQuery();

                    query.returnGeometry = false;
                    query.outFields = [settings.OIDname, settings.usagename, settings.tenancyname, settings.areaname, settings.leaseexpiryname, settings.reviewdatename, settings.reviewtypename, settings.buildingname, settings.floorname, settings.statusname, settings.exactexpirydatename, settings.exactreviewdatename, settings.buildingIDname];
                    
                    settings.layer1.queryFeatures(query).then(function (result) {
                        var currentResult = result.features;

                        var initData = currentResult;
                        // for white renderer
                        var initStats = statsMaker.createChartData(currentResult, settings, this.view);
                        // for usage renderer
                        var initUsage = chartMaker.createChartData(currentResult, settings);
                        // for tenancy renderer
                        var initTenancy = chartMaker.createChartData_ten(currentResult, settings);
                        // for area renderer
                        var initArea = barMaker.createChartData(currentResult, settings, 8);
                        // for lease expiry renderer
                        var initLeaseexpiry = barMaker.createChartData_exp(currentResult, settings, 10);
                        // for review date renderer
                        var initReviewdate = barMaker.createChartData_rev(currentResult, settings, 10);

                        var initCharts = {
                            stats: initStats,
                            usage: initUsage,
                            tenancy: initTenancy,
                            leaseexpiry: initLeaseexpiry,
                            reviewdate: initReviewdate,
                            area: initArea
                        };

                        callback(initData, initCharts);

                    }.bind(this));

                }.bind(this)).catch(function (err) {
                    console.error(err);
                });
            },

            setSelection: function (sel, highlight, selection) {
                var vizName = this.viz.name;

                this.setVizCity(vizName, highlight, selection);

            },

            setVizCity: function (vizName, highlight, selection) {
                var settings = this.settings;

                settings.layer1.opacity = 0.8;
                settings.layer2.opacity = 0.8;

                if (selection !== undefined && selection !== "") {

                    settings.layer1.definitionExpression = selection;

                    settings.layer2.visible = false;

                    if (highlight == undefined) {
                        settings.layer2.visible = false;
                    } else {
                        settings.layer2.visible = true;
                        settings.layer2.renderer = null;
                        settings.layer2.definitionExpression = settings.buildingIDname + " NOT IN (" + highlight + ")";
                    }
                } else {
                    settings.layer1.definitionExpression = undefined;
                    settings.layer1.renderer = null;
                }

                // visualization

                if (selection !== undefined && selection !== "") {
                    this.changeVisualiationSelection(vizName, this.menu, this.settings, this.view);
                } else {
                    this.changeVisualisationCity(vizName, this.initData, this.initCharts);
                }

            },

            changeVisualisationCity: function (vizName, initData, initCharts) {
                var settings = this.settings;

                if (vizName === "white") {
                    settings.layer1.renderer = applyRenderer.createSimpleRenderer();

                    domStyle.set(dom.byId("chartDiv"), { "opacity": 0 });
                    domStyle.set(dom.byId("statsDiv"), { "opacity": 1 });

                    statsMaker.createChart(initCharts.stats, function (state) {
                        this.menu.setLoadingState("loaded");
                    }.bind(this));
                }
                if (vizName === "usage") {
                    settings.layer1.renderer = applyRenderer.createRenderer(settings.values, settings.color, settings.usagename);

                    domStyle.set(dom.byId("chartDiv"), { "opacity": 1 });
                    domStyle.set(dom.byId("statsDiv"), { "opacity": 0 });
                   
                   
                   function checkMediaQuery() {
                    var chartstyle = []
                   // If the inner width of the window is greater then 768px
                   if (window.innerWidth > 1280) {
                     // Then log this message to the console
                     chartstyle = "createChart"
                   }
                   else {
                      chartstyle = "createChart_small"
                   }
                   return (chartsyle);
                 }

                 // Add a listener for when the window resizes
                 var chart = window.addEventListener('click', checkMediaQuery);
                 
                 chartMaker.chart(this.view, initCharts.usage, settings, "city", function (state) {
                         this.menu.setLoadingState("loaded");
                    }.bind(this));

                    /*chartMaker.createChart(this.view, initCharts.usage, settings, "city", function (state) {
                         this.menu.setLoadingState("loaded");
                    }.bind(this));*/
                      
                }
                if (vizName === "tenancy") {
                    settings.layer1.renderer = applyRenderer.createRenderer(settings.values_ten, settings.color, settings.tenancyname);
                    domStyle.set(dom.byId("chartDiv"), { "opacity": 1 });
                    domStyle.set(dom.byId("statsDiv"), { "opacity": 0 });

                    chartMaker.createChart_ten(this.view, initCharts.tenancy, settings, "city", function (state) {
                        this.menu.setLoadingState("loaded");
                    }.bind(this));
                }
                if (vizName === "area") {
                    settings.layer1.renderer = applyRenderer.createRendererVV(initData, settings.areaname);
                    domStyle.set(dom.byId("chartDiv"), { "opacity": 1 });
                    domStyle.set(dom.byId("statsDiv"), { "opacity": 0 });

                    barMaker.createChart(initData, initCharts.area, settings, "city", this.view, function (state) {
                        this.menu.setLoadingState("loaded");
                    }.bind(this));
                }
             
                if (vizName === "leaseexpiry") {
                    settings.layer1.renderer = applyRenderer.createRendererVV_exp(initData, settings.leaseexpiryname);
                    domStyle.set(dom.byId("chartDiv"), { "opacity": 1 });
                    domStyle.set(dom.byId("statsDiv"), { "opacity": 0 });

                    barMaker.createChart_exp(initData, initCharts.leaseexpiry, settings, "city", this.view, function (state) {
                        this.menu.setLoadingState("loaded");
                    }.bind(this));
                }
                
                if (vizName === "reviewdate") {
                    settings.layer1.renderer = applyRenderer.createRendererVV_exp(initData, settings.reviewdatename);
                    domStyle.set(dom.byId("chartDiv"), { "opacity": 1 });
                    domStyle.set(dom.byId("statsDiv"), { "opacity": 0 });

                    barMaker.createChart_rev(initData, initCharts.reviewdate, settings, "city", this.view, function (state) {
                        this.menu.setLoadingState("loaded");
                    }.bind(this));
                }
            },

            changeVisualiationSelection: function (vizName, menu, settings, view) {

                if (this.loadingState !== "busy") {
                    this.menu.setLoadingState("busy");
                }

                var query = settings.layer1.createQuery();

                query.returnGeometry = false;
                query.outFields = [settings.OIDname, settings.usagename, settings.tenancyname, settings.areaname, settings.leaseexpiryname, settings.reviewdatename, settings.reviewtypename, settings.buildingname, settings.floorname, settings.statusname, settings.exactexpirydatename, settings.exactreviewdatename, settings.buildingIDname];

                settings.layer1.queryFeatures(query).then(function (result) {

                    var selection = result.features;

                    if (vizName === "white") {
                        settings.layer1.renderer = applyRenderer.createSimpleRenderer();

                        domStyle.set(dom.byId("chartDiv"), { "opacity": 0 });
                        domStyle.set(dom.byId("statsDiv"), { "opacity": 1 });

                        var statsDataBuilding = statsMaker.createChartData(selection, settings);
                        statsMaker.createChart(statsDataBuilding, function (state) {
                            menu.setLoadingState(state);
                        });
                    }
                    if (vizName === "usage") {
                        settings.layer1.renderer = applyRenderer.createRenderer(settings.values, settings.color, settings.usagename);

                        domStyle.set(dom.byId("chartDiv"), { "opacity": 1 });
                        domStyle.set(dom.byId("statsDiv"), { "opacity": 0 });

                        var chartData = chartMaker.createChartData(selection, settings);
                        var chartsyle = []
                        function checkMediaQuery() {
                           // If the inner width of the window is greater then 768px
                           if (window.innerWidth > 768) {
                             // Then log this message to the console
                             chartsyle = "createChart";
                           }
                           else {
                             chartsyle = "createChart_small";
                           }
                           return chartsyle;
                         }

                         // Add a listener for when the window resizes
                         var chart = window.addEventListener('click', checkMediaQuery);
                         console.info(chart);
                     
                         chartMaker.chart(view, chartData, settings, "building", function (state) {
                            menu.setLoadingState(state);
                            });
                     
                        /*chartMaker.createChart(view, chartData, settings, "building", function (state) {
                            menu.setLoadingState(state);
                            });*/

                        var data = statsMaker.createChartData(selection, settings);
                        statsMaker.createChart(data, function (state) {
                            menu.setLoadingState(state);
                        });
                    }
                 
                    if (vizName === "tenancy") {
                        settings.layer1.renderer = applyRenderer.createRenderer(settings.values_ten, settings.color, settings.tenancyname);

                        domStyle.set(dom.byId("chartDiv"), { "opacity": 1 });
                        domStyle.set(dom.byId("statsDiv"), { "opacity": 0 });

                        var chartData = chartMaker.createChartData_ten(selection, settings);
                        chartMaker.createChart_ten(view, chartData, settings, "building", function (state) {
                            menu.setLoadingState(state);
                        });

                        var data = statsMaker.createChartData(selection, settings);
                        statsMaker.createChart(data, function (state) {
                            menu.setLoadingState(state);
                        });
                    }
                    if (vizName === "area") {
                        settings.layer1.renderer = applyRenderer.createRendererVV(selection, settings.areaname);
                        domStyle.set(dom.byId("chartDiv"), { "opacity": 1 });
                        domStyle.set(dom.byId("statsDiv"), { "opacity": 0 });

                        var barData = barMaker.createChartData(selection, settings, 10);
                        barMaker.createChart(selection, barData, settings, "building", view, function (state) {
                            menu.setLoadingState(state);
                        });

                        var data2 = statsMaker.createChartData(selection, settings);
                        statsMaker.createChart(data2, function (state) {
                            menu.setLoadingState(state);
                        });
                    }
                 
                     if (vizName === "leaseexpiry") {
                        settings.layer1.renderer = applyRenderer.createRendererVV_exp(selection, settings.leaseexpiryname);

                        domStyle.set(dom.byId("chartDiv"), { "opacity": 1 });
                        domStyle.set(dom.byId("statsDiv"), { "opacity": 0 });

                        var barData = barMaker.createChartData_exp(selection, settings, 6);
                        barMaker.createChart_exp(selection, barData, settings, "building", view, function (state) {
                            menu.setLoadingState(state);
                        });

                        var data2 = statsMaker.createChartData(selection, settings);
                        statsMaker.createChart(data2, function (state) {
                            menu.setLoadingState(state);
                        });
                    }
                 
                    if (vizName === "reviewdate") {
                        settings.layer1.renderer = applyRenderer.createRendererVV_exp(selection, settings.reviewdatename);

                        domStyle.set(dom.byId("chartDiv"), { "opacity": 1 });
                        domStyle.set(dom.byId("statsDiv"), { "opacity": 0 });

                        var barData = barMaker.createChartData_rev(selection, settings, 6);
                        barMaker.createChart_rev(selection, barData, settings, "building", view, function (state) {
                            menu.setLoadingState(state);
                        });

                        var data2 = statsMaker.createChartData(selection, settings);
                        statsMaker.createChart(data2, function (state) {
                            menu.setLoadingState(state);
                        });
                    }

                });
            }

        });
    }
);
