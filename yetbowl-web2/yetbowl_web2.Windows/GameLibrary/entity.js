/*
Copyright (c) Microsoft Corporation

All rights reserved.

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.  You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0   

THIS CODE IS PROVIDED *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE, MERCHANTABLITY OR NON-INFRINGEMENT.  

See the Apache Version 2.0 License for specific language governing permissions and limitations under the License. 

*/
//-------------------------------------------------- //
/*
Entity.js - 
Creates an object which other entities can pull components from
*/
//---------------------------------------------------//

(function (window) {
    "use strict";
    var Entity = {
        init: function () {
            //used to setup an entity(many used for future implementation)
            this.image = null; //image used to draw
            this.isLoaded = false;   //is Entity loaded
            this.state = null;       //current state of the object

            this.scale = 1;          //scale to draw at
            this.pos = { x: 0, y: 0, angle: 0 }, //position of the object
            this.last = { x: 0, y: 0, angle: 0 }, //last position of object
            this.interpolate_diff = { x: 0, y: 0, angle: 0 }; //difference between last and current position
            this.collision_radius = 0; //radius to use for collisions

            this.frames = [];      //array of frames for animation and drawing
            this.currentframe = 0; //current animation frame
            this.flipped = false;  //should the image be drawn flipped

            this.isDead = false;
        },

        update_pre: function () {
            //interpolation setup
            this.last.x = this.pos.x;
            this.last.y = this.pos.y;
            this.last.angle = this.pos.angle;

        },

        update: function () {
        },

        update_post: function () {
            //interpolation 
            this.interpolate_diff.x = this.pos.x - this.last.x;
            this.interpolate_diff.y = this.pos.y - this.last.y;
            this.interpolate_diff.angle = this.pos.angle - this.last.angle;

        },

        draw: function () {
            this.frames[this.currentframe].draw(game.Entity.interpolate.apply(this, ['x']), game.Entity.interpolate.apply(this, ['y']), this.image, game.Entity.interpolate.apply(this, ['angle']), this.flipped, this.scale);
        },

        loadimg: function (path) {
            var image = new Image();
            image.src = path;
            return image;
        },

        interpolate: function (axis) {
            if (axis === 'x' || axis === 'X') {
                return this.last.x + (this.interpolate_diff.x * game.system.interpolationvalue);
            }
            else if (axis === 'y' || axis === 'Y') {
                return this.last.y + (this.interpolate_diff.y * game.system.interpolationvalue);
            }
            else {
                return this.last.angle + (this.interpolate_diff.angle * game.system.interpolationvalue);

            }
        },

        normalizevector: function (x, y) {
            "use strict";
            if (x === 0 && y === 0) //check for degenerate case
            { return { x: 0, y: 0 }; }

            //calculate length
            var length = Math.sqrt((x * x) + (y * y));
            //divide components by length
            return { x: x / length, y: y / length };
        },

        vectorlength: function (vector) {
            "use strict";
            return Math.sqrt((vector.x * vector.x) + (vector.y * vector.y));
        },
    };

    game.Entity = Entity;
})(window);

