//-------------------------------------------------- //
/*
Copyright (c) Microsoft Corporation

All rights reserved.

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.  You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0   

THIS CODE IS PROVIDED *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE, MERCHANTABLITY OR NON-INFRINGEMENT.  

See the Apache Version 2.0 License for specific language governing permissions and limitations under the License. 

*/

/*
scaling.js - 
Applies scaling to the canvas to dynamically adjust to screen resolutions.
*/
//---------------------------------------------------//

//cacheing setting globals for use ingame
var GLOBAL_SCALE = 1;
var GLOBAL_APPWIDTH = 1;
var GLOBAL_APPHEIGHT = 1;

function resize(eventArgs) {
    'use strict';
    var base = { width: 768, height: 1366 }; //base resolution scales
    var docelement = document.documentElement;

    var appWidth = docelement.offsetWidth;
    

    GLOBAL_APPWIDTH = appWidth;
    var appHeight = docelement.offsetHeight;
    GLOBAL_APPHEIGHT = appHeight;

    var newHeight = appHeight;
    var newWidth = appWidth;
    var scale = 1;

    var canvas = document.getElementById("game_canvas");

    if (!canvas) {
        return false;
    };


    canvas.style.height = appHeight + "px";

    scale = appHeight / base.height;
    newWidth = base.width * scale;
    canvas.style.width = newWidth + "px";

    //resizes the container object to handle dom elements
    var container = document.getElementById("container");
    container.style.height = newHeight + "px";
    container.style.width = newWidth + "px";

    container.style.posLeft = (appWidth - newWidth) / 2;//posLeft for modern/IE
    container.style.left = ((appWidth - newWidth) / 2) + 'px'; //left for non-modern
    container.style.posTop = 0; //posTop for modern/IE
    container.style.top = 0; //Top for non-modern
    GLOBAL_SCALE = scale;


};