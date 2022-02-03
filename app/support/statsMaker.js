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
    "esri/core/declare",
 
    "dojo/dom-construct",
    "dojo/_base/window",
    "dojo/dom",

    "c-through/support/applyRenderer",
    "c-through/support/chartMaker",
    "c-through/support/queryTools",
    "esri/tasks/support/StatisticDefinition",
    "esri/tasks/support/Query"

], function (
    declare,
    domCtr, win, dom,
    applyRenderer,
    chartMaker,
    queryTools,
    StatisticDefinition,
    Query
) {
        return {

            createChartData: function (data, settings, view) {

                var chartData = {
                    numberofUnits: null,
                    numberofWholeBuildings: null,
                    numberofBuildings: null,
                    mostCommonUsage: {
                        usage: null
                    },
                    mostCommonTenancy: {
                       tenancy: null
                    },
                    averageArea: null,
                    totalArea: null,
                    areaMax: null,
                    floorMax: null,
                    averageFloor: null,
                    nextExpiry: null,
                    nextReview: null
                };

                function sum (a, b) {
                    return (isNaN(a) ? 0 : a) + (isNaN(b) ? 0 : b);
                }

                chartData.numberofUnits = data.length;

                // usage data

                var usageData = chartMaker.createChartData(data, settings);

                usageData.sort(function (a, b) { return a.area - b.area; });

                var usageAreaSum = 0;

                for (var i = 0; i < usageData.length; i++) {
                        usageAreaSum += usageData[i].area;
                }
                
                if (usageAreaSum === 0){
                    chartData.mostCommonUsage.usage = "0ther";
                } else{
                    chartData.mostCommonUsage = usageData[usageData.length - 1];
                }
             
                 // tenancy data

                var tenancyData = chartMaker.createChartData_ten(data, settings);

                tenancyData.sort(function (a, b) { return a.area - b.area; });

                var tenancyAreaSum = 0;

                for (var i = 0; i < tenancyData.length; i++) {
                        tenancyAreaSum += tenancyData[i].area;
                }
                
                if (tenancyAreaSum === 0){
                    chartData.mostCommonTenancy.tenancy = "None";
                } else if ((tenancyData[tenancyData.length - 1].tenancy === "Vacant") && (tenancyData.length > 1)) {
                    chartData.mostCommonTenancy = tenancyData[tenancyData.length - 2];
                }
                else {
                    chartData.mostCommonTenancy = tenancyData[tenancyData.length - 1];
                }            

                // area data
                
                var areaData = [];

                for (var j = 0; j < data.length; j++) {
                    if (data[j].attributes[settings.areaname] !== null) {
                        areaData.push(data[j].attributes[settings.areaname]);
                    }
                }

                areaData.sort(function (a, b) { return a - b; });

                chartData.areaMax = Math.round(areaData[areaData.length - 1]);
              
                for (let i = 0; i < areaData.length; i++) {
                      chartData.totalArea += areaData[i];
                }
                
                chartData.totalArea = Math.round(chartData.totalArea);

                var areaSum = areaData.reduce(sum, 0);

                chartData.averageArea = Math.round(areaSum / (areaData.length - 1));

                if (areaData.length === 1){
                    chartData.averageArea = areaData[0];
                }

                // floor data

                var floorData = [];

                for (var j = 0; j < data.length; j++) {
                    var value = data[j].attributes[settings.floorname];
                    if (value !== null && typeof value !== "string") {
                        floorData.push(data[j].attributes[settings.floorname]);
                    }
                    if (typeof value === "string"){
                        floorData.push(Number(data[j].attributes[settings.floorname]));
                    }
                }

                floorData.sort(function (a, b) { return (isNaN(a) ? 0 : a) - (isNaN(b) ? 0 : b);});

                chartData.floorMax = Math.round(floorData[floorData.length - 1]);

                var floorSum = floorData.reduce(sum, 0);

                chartData.averageFloor = Math.round(floorSum / (floorData.length - 1));

                if (floorData.length === 1){
                    chartData.averageFloor = floorData[0];
                }
             
                // lease expiry data

                var leaseexpiryData = [];

                for (var k = 0; k < data.length; k++) {
                    if (data[k].attributes[settings.exactexpirydatename] !== null) {
                        leaseexpiryData.push(new Date(data[k].attributes[settings.exactexpirydatename]));
                    }
                }

                leaseexpiryData = leaseexpiryData.sort();
                leaseexpiryData = leaseexpiryData[0];
             
                if (leaseexpiryData === undefined || leaseexpiryData === null){
                    chartData.nextExpiry = "None";
                } else{
                    var date = leaseexpiryData.getDate();
                    var month = leaseexpiryData.getMonth(); //Be careful! January is 0 not 1
                    var year = leaseexpiryData.getFullYear();

                    var dateString = date + "-" +(month + 1) + "-" + year;
                    chartData.nextExpiry = dateString;
                }
             
                // review data

                var reviewData = [];

                for (var k = 0; k < data.length; k++) {
                    if (data[k].attributes[settings.exactreviewdatename] !== null) {
                        reviewData.push(new Date(data[k].attributes[settings.exactreviewdatename]));
                    }
                }

                reviewData = reviewData.sort();
                reviewData = reviewData[0];
             
                if (reviewData === undefined || reviewData === null){
                    chartData.nextReview = "None";
                } else{
                    var date = reviewData.getDate();
                    var month = reviewData.getMonth(); //Be careful! January is 0 not 1
                    var year = reviewData.getFullYear();

                    var dateString = date + "-" +(month + 1) + "-" + year;
                    chartData.nextReview = dateString;
                }
             
                // building data

                var buildingData = [];

                for (var k = 0; k < data.length; k++) {
                    if (data[k].attributes[settings.buildingIDname] !== null) {
                        buildingData.push(data[k].attributes[settings.buildingIDname]);
                    }
                }

                function onlyUnique (value, index, self) {
                    return self.indexOf(value) === index;
                }

                var buildingDataunique = buildingData.filter(onlyUnique);

                chartData.numberofUnits = buildingDataunique.length;
            
             
                // whole building data

                var enitrebuildingData = [];

                for (var k = 0; k < data.length; k++) {
                    if (data[k].attributes[settings.buildingname] !== null) {
                        enitrebuildingData.push(data[k].attributes[settings.buildingname]);
                    }
                }

                function onlyUnique (value, index, self) {
                    return self.indexOf(value) === index;
                }

                var enitrebuildingDataunique = enitrebuildingData.filter(onlyUnique);

                chartData.numberofWholeBuildings = enitrebuildingDataunique.length;

                return chartData;

            },

            createChart: function(data, callback){

                dom.byId("buildingInfo").innerHTML = "Number of Buildings: " + data.numberofBuildings;
                dom.byId("numberofwholebuildings").innerHTML = "<small>Number of Buildings      <br></small>" + data.numberofWholeBuildings;
                dom.byId("usage").innerHTML = "<small>Most Common Usage<br></small>        " + data.mostCommonUsage.usage;
                dom.byId("tenancy").innerHTML = "<small>Largest Tenant<br></small>        " + data.mostCommonTenancy.tenancy;
                dom.byId("totalarea").innerHTML = "<small>Total Area<br></small>       " + data.totalArea + " m2";
                dom.byId("maxfloor").innerHTML = "<small>Max Floor Number<br></small>      " + data.floorMax;
                dom.byId("nextexpiry").innerHTML = "<small>Next Lease Expiry<br></small>      " + data.nextExpiry;
                dom.byId("nextreview").innerHTML = "<small>Next Review<br></small>      " + data.nextReview;
             
                callback("loaded");

            }
        };
    });
