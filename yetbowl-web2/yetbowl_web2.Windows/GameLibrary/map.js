/*
Copyright (c) Microsoft Corporation

All rights reserved.

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.  You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0   

THIS CODE IS PROVIDED *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE, MERCHANTABLITY OR NON-INFRINGEMENT.  

See the Apache Version 2.0 License for specific language governing permissions and limitations under the License. 
*/

//-------------------------------------------------- //
/*
Map.js - 
Handles the logic for determining the current tilt of the play field, and the velocity.
This information is consumed by the snowball object
*/
//---------------------------------------------------//

(function (window) {
    "use strict";
    var Map = function(){

        this.init = function () {
            this.gravity = {x: 0, y: 1};
        
            this.tilt = { now: 0, last: 0 };
            this.tilt_sensitivity = 0.01;
            this.radiantilt = 0;

            this.tilt_max = 0.4, //0.5 is 90 degrees

            this.vel = { x: 0, y: 0, sensitivity: 0.5 };
            this.friction = 0.6;

            this.pidivide180 = (180 / Math.PI);
        };

        this.update = function () {
            this.tilt.last = this.tilt.now;

            this.vel.x *= this.friction;
            this.vel.y *= this.friction;

            if (Math.abs(this.vel.x) < 0.0001) {
                this.vel.x = 0;
            }

            if (game.system.inputmanager.keys_down.RIGHTARROW ||
                game.system.inputmanager.checkinput('RIGHT_BUTTON')) {
                this.tilt.now += this.tilt_sensitivity;
                if (this.tilt.now > this.tilt_max) {
                    this.tilt.now = this.tilt_max;
                }
                else {
                    //if not at far edge, add velocity
                    this.vel.x += this.vel.sensitivity;
                }
            }
            if (game.system.inputmanager.keys_down.LEFTARROW ||
                game.system.inputmanager.checkinput('LEFT_BUTTON')) {
                this.tilt.now -= this.tilt_sensitivity;
                if (this.tilt.now < this.tilt_max * -1) {
                    this.tilt.now = this.tilt_max * -1;
                }
                else {
                    //if not at far edge, add velocity
                    this.vel.x -= this.vel.sensitivity;
                }
            }

            this.gravity.x = this.tilt.now * Math.PI;
            this.gravity.y = Math.cos((this.tilt.now * Math.PI));

            this.gravity = this.normalizevector(this.gravity.x, this.gravity.y);
        };

        this.draw = function () {
        };


        this.normalizevector = function (x, y) {
            "use strict";
            if (x === 0 && y === 0) //check for degenerate case
            { return { x: 0, y: 0 }; }

            //calculate length
            var length = Math.sqrt((x * x) + (y * y));
            //divide components by length
            return { x: x / length, y: y / length };
        };

        this.vectorlength = function (vector) {
            "use strict";
            return Math.sqrt((vector.x * vector.x) + (vector.y * vector.y));
        };

        this.init();
    };
   
    //add class to game namespace
    game.Map = Map;
})(window);

