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
    "esri/renderers/SimpleRenderer",
    "esri/symbols/MeshSymbol3D",
    "esri/symbols/FillSymbol3DLayer",
    "esri/renderers/UniqueValueRenderer"

], function (
    SimpleRenderer,
    MeshSymbol3D,
    FillSymbol3DLayer,
    UniqueValueRenderer

) {

        return {

            createSimpleRenderer: function () {
                return new SimpleRenderer({
                    symbol: new MeshSymbol3D({
                        symbolLayers: [
                            new FillSymbol3DLayer({
                                material: { color: "#3399FF" }
                            })
                        ]
                    })
                });

            },

            createRenderer: function (values, color, fieldname) {
                return new UniqueValueRenderer({
                    defaultSymbol: new MeshSymbol3D({
                        symbolLayers: [new FillSymbol3DLayer({
                            material: {
                                color: [135, 135, 135, 0.2]
                            }
                        })]
                    }),
                    defaultLabel: "N.A.",
                    field: fieldname,
                    uniqueValueInfos: this.createValueInfos(values, color)
                });
            },

            createValueInfos: function (values, color) {

                var fields = [];

                for (var i = 0; i < values.length; i++) {
                    fields.push({
                        value: values[i],
                        color: color[i]
                    });
                }

                var valueInfos = [];
                for (var j = 0; j < fields.length; j++) {
                    valueInfos.push(
                        {
                            "value": values[j],
                            "symbol": this.createSymbol(color[j]),
                            "label": values[j]
                        }
                    );
                }
                return valueInfos;
            },

            createSymbol: function (color) {
                return new MeshSymbol3D({
                    symbolLayers: [new FillSymbol3DLayer({
                        material: {
                            color: color
                        }
                    })]
                });
            },

            applyOpacity: function (fieldname, alpha, values) {
                var opacVisVar = {
                    type: "opacity",
                    field: fieldname,
                    stops: this.createStops(alpha, values)
                };

                return opacVisVar;

            },

            createStops: function (alpha, values) {
                var stops = [];

                for (var i = 0; i < values.length; i++) {
                    if (i === 0) {
                        stops.push({
                            value: values[0],
                            opacity: alpha[0]
                        });
                    }
                    stops.push({
                        value: values[i],
                        opacity: alpha[i]
                    });
                }
            },
            //For Area Bar chart
            createRendererVV: function (selection, fieldname) {

                var totalrange = [];

                
                for (var j = 0; j < selection.length; j++) {
                    if (selection[j].attributes[fieldname] !== null) {
                        totalrange.push(selection[j].attributes[fieldname]);
                    }
                }

                var valuemax = Math.ceil(Math.max.apply(Math, totalrange));
                var valuemin = Math.floor(Math.min.apply(Math, totalrange));

                return new UniqueValueRenderer({
                    defaultSymbol: new MeshSymbol3D({
                        symbolLayers: [new FillSymbol3DLayer({
                            material: {
                                color: "white"
                            }
                        })]
                    }),
                    defaultLabel: "N.A.",
                    visualVariables: [{
                        type: "color",
                        field: fieldname,
                        stops: [
                            { value: valuemin, color: "#E4002B" },
                            { value: valuemax, color: "#001933" }
                        ]
                    }]

                });
            },

            createRendererVVbar: function (min, max, color, fieldname) {

                var defaultcolor = [135, 135, 135, 0.2];

                return new UniqueValueRenderer({
                    defaultSymbol: new MeshSymbol3D({
                        symbolLayers: [new FillSymbol3DLayer({
                            material: {
                                color: defaultcolor
                            }
                        })]
                    }),
                    defaultLabel: "N.A.",
                    visualVariables: [{
                        type: "color",
                        field: fieldname,
                        stops: [
                            { value: min-1, color: defaultcolor},
                            { value: min, color: color },
                            { value: max, color: color },
                            { value: max+1, color: defaultcolor}
                        ]
                    }]

                });
            },
         
            //For Lease Expiry Bar Chart
            createRendererVV_exp: function (selection, fieldname) {

                var totalrange = [];
                console.info(selection);

                
                for (var j = 0; j < selection.length; j++) {
                    if (selection[j].attributes[fieldname] !== null) {
                        totalrange.push(selection[j].attributes[fieldname]);
                    }
                }
             
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
                console.info(totalrange);
             
                function onlyUnique(value, index, self) {
                     return self.indexOf(value) === index;
                }

                unique_years = totalrange.filter(onlyUnique);
             
                unique_years = unique_years.filter(function(value, index, arr){ 
                       return value != '1970';
                   });
             
                unique_years.sort(function (a, b) { return a - b; });
                console.info(unique_years);

                var year_max = parseInt(unique_years[totalrange.length-1]);
                var year_min = parseInt(unique_years[1]);
                //var valuemin = Math.floor(Math.min.apply(Math, totalrange));

                return new UniqueValueRenderer({
                    defaultSymbol: new MeshSymbol3D({
                        symbolLayers: [new FillSymbol3DLayer({
                            material: {
                                color: "white"
                            }
                        })]
                    }),
                    defaultLabel: "N.A.",
                    visualVariables: [{
                        type: "color",
                        field: fieldname,
                        stops: [
                            { value: year_min, color: "#E4002B"},
                            { value: year_max, color: "#001933" }
                        ]
                    }]

                });
            },

            createRendererVVbar_exp: function (year, color, fieldname) {

                var defaultcolor = [135, 135, 135, 0.2];
                console.info(fieldname);

                return new UniqueValueRenderer({
                    defaultSymbol: new MeshSymbol3D({
                        symbolLayers: [new FillSymbol3DLayer({
                            material: {
                                color: defaultcolor
                            }
                        })]
                    }),
                    defaultLabel: "N.A.",
                    visualVariables: [{
                        type: "color",
                        field: fieldname,
                        stops: [
                            { value: year-1, color: defaultcolor},
                            { value: year, color: color },
                            { value: year+1, color: defaultcolor}
                        ]
                    }]

                });
            }
        };
    }
);
