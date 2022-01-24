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
 * Title: App Configuration Script
 * Author: Lisa Staehli
 * Date: 04/24/17
 * Description: Used to configure and link a webscene
 * with corresponding attributes for visualization
 * and statistics. A webscene with a scene service 
 * that contains the following required attributes on 
 * unit level for each feature needs to be set-up first: 
 * - building id (int)
 * - floor level (int)
 * - usage (string)
 * - area (float)
 */

define([
    "esri/core/Accessor",
    "esri/config",

    "esri/WebScene",
    "esri/views/SceneView",
    "esri/layers/SceneLayer",
    "esri/Basemap",

    "esri/widgets/BasemapToggle",
    "esri/widgets/Home",

    "dojo/dom",
    "dojo/on",
    "dojo/dom-construct",
    "dojo/_base/window",
    "dojo/dom-style",

    "esri/widgets/Search",

    "c-through/ToolsMenu",
    "c-through/welcome",
    "c-through/support/queryTools"

], function (
    Accessor, esriConfig,
    WebScene, SceneView, SceneLayer, Basemap,
    BasemapToggle, Home,
    dom, on, domCtr, win, domStyle,
    Search,
    ToolsMenu, Welcome, queryTools) {

        // application settings
        var settings_demo = {
            name: "Liffey Campus",
            url: "https://cwireland.maps.arcgis.com",           // portal URL for config
            webscene: "b05184fc92e4450cbeb99dfc35463e7b",   // portal item ID of the webscene
            usagename: "Use_",                             // usage attribute (string)
            tenancyname: "Tenant",
            floorname: "Floor_1",                           // floor attribute (int)
            OIDname: "OBJECTID",                            // objectid
            buildingIDname: "BuildID",                   // building attribute (int)
            areaname: "sq_m",                           // area attribute (float)
            color: [                                        // color ramp for unique value renderer
                    [228, 0, 43, 1],                     
                    [166, 25, 46, 1],
                    [255, 153, 153, 1],
                    [155, 211, 221, 1],
                    [217, 236, 235, 1],
                    [0, 147, 178, 1],
                    [86, 170, 198, 1],
                    [158, 200, 219, 1],
                    [105, 107, 107, 1],
                    [150, 152, 152, 1],
                    [195, 196, 196, 1],
                    [208, 206, 207, 1],
                    [0, 56, 101, 1],
                    [82, 97, 128, 1],
                    [181, 189, 0, 1],
                    [201, 206, 113, 1],
                    [222, 225, 170, 1],
                    [238, 240, 211, 1]
                ]
        };

        return Accessor.createSubclass({
            declaredClass: "c-through.App",

            constructor: function () {

            },

            init: function (settings) {

                // destroy welcome page when app is started
                domCtr.destroy("welcome");

                // create header with title according to choice on welcome page
                var header = domCtr.create("div", { id: "header" }, win.body());
                domCtr.create("div", { id: "headerTitle" }, header);

                // get settings from choice on welcome page
                this.settings = this.getSettingsFromUser(settings);

                // set portal url
                esriConfig.portalUrl = this.settings.url;

                // fix CORS issues by adding portal url to cors enabled servers list
                esriConfig.request.corsEnabledServers.push("https://cwireland.maps.arcgis.com");

                // load scene with portal ID
                this.scene = new WebScene({
                    portalItem: {
                        id: this.settings.webscene
                    },
                    basemap: "topo"
                });

                // create a view
                this.view = new SceneView({
                    container: "viewDiv",
                    map: this.scene,
                    qualityProfile: "high"
                });

                // environment settings for better visuals (shadows)
                this.view.environment.lighting.ambientOcclusionEnabled = true;
                this.view.environment.lighting.directShadowsEnabled = true;

                // create search widget
                var searchWidget = new Search({
                    view: this.view
                });
                this.view.ui.add(searchWidget, {
                    position: "top-right",
                    index: 2
                });

                // create home button that leads back to welcome page
                var home = domCtr.create("div", { className: "button", id: "homeButton", innerHTML: "Back" }, header);

                on(home, "click", function () {
                    var URI = window.location.href;
                    var newURI = URI.substring(0, URI.lastIndexOf("?"));
                    window.location.href = newURI;
                }.bind(this));

                // create home widget for scene view
                var homeWidget = new Home({
                    view: this.view
                });
                this.view.ui.add(homeWidget, "top-left");

                // wait until view is loaded
                this.view.when(function () {
                    // layer1 = active layer (receives renderers, used for statistics, selected)
                    // layer2 = background layer (shows remaining buildings, not selected)

                    // retrieve active layer from webscene
                    this.settings.layer1 = this.scene.layers.getItemAt(0);

                    // create background layer (identical copy of activ layer) for highlighting and add it to the scene
                    this.settings.layer2 = new SceneLayer({
                        url: this.settings.layer1.url,
                        popupEnabled: false
                    });
                    this.scene.add(this.settings.layer2);

                    this.settings.layer1.visible = true;
                    this.settings.layer2.visible = false;

                    // retrieve distinct values of usage attribute from feature service to create UI (filter dropdowns)
                    queryTools.distinctValues(this.settings.layer1, this.settings.usagename, this.settings.OIDname, function (distinctValues) {

                        distinctValues.sort();
                        this.settings.values = distinctValues;
                     
                     // retrieve distinct values of tenancy attribute from feature service to create UI (filter dropdowns)
                    queryTools.distinctValues_ten(this.settings.layer1, this.settings.tenancyname, this.settings.OIDname, function (distinctValues_ten) {

                        distinctValues_ten.sort();
                        this.settings.values = distinctValues_ten;

                        // initiliaze tools menu with state
                        this.menu = new ToolsMenu({
                            config: this.settings,
                            map: this.scene,
                            view: this.view,
                            state: {
                                highlight: {
                                    name: "city",
                                    features: undefined
                                },
                                viz: {
                                    name: "white"
                                },
                                filter: {
                                    name: "none",
                                    usageFeatures: undefined,
                                    areaFeatures: undefined,
                                    floorFeatures: undefined,
                                    tenancyFeatures: undefined,
                                    vacancyFeatures: undefined
                                },
                                combinedFilteredFeatures: undefined
                            }
                        });
                    }.bind(this));

                }.bind(this)).catch(function (err) {
                    console.error(err);
                });

            },

            getSettingsFromUser: function (settings) {
                if (settings === "demo"){
                    dom.byId("headerTitle").innerHTML = "Liffey Campus";
                    return settings_demo;
                }
            }
        });
    });




