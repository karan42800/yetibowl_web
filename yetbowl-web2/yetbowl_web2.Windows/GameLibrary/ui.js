/*
Copyright (c) Microsoft Corporation

All rights reserved.

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.  You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0   

THIS CODE IS PROVIDED *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE, MERCHANTABLITY OR NON-INFRINGEMENT.  

See the Apache Version 2.0 License for specific language governing permissions and limitations under the License. 
*/

//-------------------------------------------------- //
/*
UI.js - 
Handles initializes, update, and drawing of the UI Layer
*/
//---------------------------------------------------//
(function (window) {
    "use strict";
    var UI = function () {
        this.isLoaded = false;
        this.frames = [];
        this.scale = [1, 1]; //array for each image to be loaded
        this.framesize = [{ x: 211, y: 112, srcX: 0, srcY: 0 }, //Flags
            { x: 211, y: 112, srcX: 0, srcY: 112 }, //Hiker Counter
            { x: 160, y: 160, srcX: 211, srcY: 0 }, //Left Arrow
            { x: 160, y: 160, srcX: 371, srcY: 0 }, //Right Arrow
            { x: 267, y: 160, srcX: 531, srcY: 0 }, //Snowball Button
            { x: 60, y: 55, srcX: 796, srcY: 0 }, // 1st X mark
            { x: 756, y: 400, srcX: 0, srcY: 0 }]; //Game Over Screen

        this.framesizeHD = [{ x: 392, y: 211, srcX: 0, srcY: 0 }, //Flags
            { x: 392, y: 211, srcX: 0, srcY: 211 }, //Hiker Counter
            { x: 300, y: 300, srcX: 396, srcY: 0 }, //Left Arrow
            { x: 300, y: 300, srcX: 696, srcY: 0 }, //Right Arrow
            { x: 500, y: 300, srcX: 996, srcY: 0 }, //Snowball Button
            { x: 100, y: 100, srcX: 1491, srcY: 0 }, // 1st X mark
            { x: 1416, y: 749, srcX: 0, srcY: 0 }];

        this.uipos = [{ x: 10, y: 10 }, //Flags
            { x: 550, y: 10 }, //Hiker Counter
            { x: 10, y: 1200 }, //Left Arrow
            { x: 595, y: 1200 }, //Right Arrow
            { x: 258, y: 1200 }, //Snowball Button
            { x: 40, y: 40 }, // 1st X mark
            { x: 5, y: 290 }]; //Game Over Screen

        this.init = function () {

            this.gameui_img = this.loadimg('media/gameui_lores.png');
            this.gameover_img = this.loadimg('media/gameover_lores.png');

            for (var i = 0; i < 7; i++) {
                this.frames[i] = new game.Frame(this.framesize[i].srcX, this.framesize[i].srcY, this.framesize[i].x, this.framesize[i].y); //setup frames
            }
            this.numberdiv = document.getElementById('hikerkills');
        };

        this.update = function () {
            this.numberdiv.innerHTML = game.system.hikerkills.toString();

            //update loaded state for imgs
            if (this.gameui_img.complete === true && this.gameover_img.complete === true) {
                this.isLoaded = true;
            }
            else {
                this.isLoaded = false;
            }
        };

        this.draw = function () {
            if (this.isLoaded === true) {
                for (var i = 0; i < 5; i++) {
                    this.frames[i].draw(this.uipos[i].x, this.uipos[i].y, this.gameui_img, 0, false, this.scale[0]);
                }

                if (game.system.hikervictories >= 1) {
                    this.frames[5].draw(40, 40, this.gameui_img, 0, false, this.scale[0]);
                }
                if (game.system.hikervictories >= 2) {
                    this.frames[5].draw(85, 40, this.gameui_img, 0, false, this.scale[0]);
                }
                if (game.system.hikervictories >= 3) {
                    this.frames[5].draw(135, 40, this.gameui_img, 0, false, this.scale[0]);
                }

                if (game.system.state === 'gameover') {
                    this.frames[6].draw(this.uipos[6].x, this.uipos[6].y, this.gameover_img, 0, false, this.scale[1]);
                }
            }
        };

        this.loadimg = function (path) {
            //create IMG element and load image
            var img = new Image();
            img.src = path;
            return img;
        };

        this.init();
    };

    game.UI = UI; //Assign Object to Game Namespace

})(window);