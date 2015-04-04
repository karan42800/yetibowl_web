/*
Copyright (c) Microsoft Corporation

All rights reserved.

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.  You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0   

THIS CODE IS PROVIDED *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE, MERCHANTABLITY OR NON-INFRINGEMENT.  

See the Apache Version 2.0 License for specific language governing permissions and limitations under the License. 
*/

//-------------------------------------------------- //
/*
Snowball.js - 
Creates a snowball Entity.  This is the main game entity which performs physics operations and collison checks
with other objects.
*/
//---------------------------------------------------//

(function (window) {
    "use strict";
    var Snowball = function () {
        //constructor
        this.init = function () {
            game.Entity.init.apply(this, null); //sets up a basic entity

            this.type = 'snowball';
            this.image = null;

            this.vel =  { x: 0, y: 0, angle: 0 }; //Vars have No effect, just here to setup data(see reset function)
            this.accel = { x: 0, y: 0, angle: 0 };

            this.maxvel = { x: 100, y: 100, angle: 0 };

            this.gravity_diff = { x: 0, y: 0 };
            this.gravity_amp = 0.5;
            this.mtn_gravity = { x: 0, y: 0.5 };

            this.collision_radius = 55;
            this.frames = [];
            this.framesize = { x: 137, y: 139 };
            this.framesizeHD = { x: 256, y: 261 };

            this.image = game.Entity.loadimg('media/snowball.png');

            this.reset();

            //create a frame to use for drawing
            this.frames[0] = new game.Frame(0, 0, this.framesize.x, this.framesize.y); //SrcX, SrcY, Width, Height

            this.isLoaded = true;
        };

        this.update = function () {
            game.Entity.update_pre.apply(this, null);

            //Simple State Machine
            switch (this.state) {
                case 'ready': //state where yeti is ready to launch the snowball
                   if (game.system.inputmanager.checkinput('SPACEBAR') === true
                        || game.system.inputmanager.checkinput('SNOWBALL_BUTTON') === true) {
                        this.state = 'falling';
                        game.system.yeti.changestate('toss');
                    }
                    break;
                case 'falling':
                    //apply physics
                    this.accel.x *= 0.5;
                    this.accel.y *= 0.5;

                    this.accel.x += game.system.map.vel.x;
                    this.accel.y += game.system.map.vel.y;

                    this.vel.x += game.system.map.gravity.x * this.gravity_amp;
                    this.vel.y += game.system.map.gravity.y * this.gravity_amp;

                    this.vel.x += this.accel.x;
                    this.vel.y += this.accel.y;

                    this.pos.x += this.vel.x;
                    this.pos.y += this.vel.y;

                    this.pos.angle += (this.vel.x * 0.001) * 360;

                    if (this.pos.y > 1500 || this.pos.y < -100
                        || this.pos.x < -300 || this.pos.x > 1086) {
                        //if snowball off the screen reset
                        game.system.yeti.changestate('hold');
                        this.reset();
                    }
                    break;
                default:
                    break;
            }

            game.Entity.update_post.apply(this, null);
        };

        this.draw = function () {
            if (this.isLoaded === true && this.image.complete === true) {
                game.Entity.draw.apply(this, null); //draw using entity base
            }
        };

        this.reset = function () {
            //if snowball off the bottom reset and called at init
            this.pos.x = 160;
            this.pos.y = 45;
            this.pos.angle = 0;
            this.last.x = this.pos.x;
            this.last.y = this.pos.y;
            this.last.angle = this.pos.angle;

            this.accel.x = 0;
            this.accel.y = 0;

            this.vel.x = 0;
            this.vel.y = 0;
            this.vel.angle = 100;

            this.gravity_diff.x = 0;
            this.gravity_diff.y = 0;
            this.state = 'ready';

        };

        this.kill = function () {
            this.isDead = true;
        };

        this.collision = function (vectorFrom) {
            var vectorTo = game.Entity.normalizevector(vectorFrom.x * -1, vectorFrom.y * -1);
            this.vel.x += vectorTo.x * 4;
            this.vel.y += vectorTo.y * 4;

            game.system.soundmanager.play("IMPACT_B");
        };

        this.init(); //run the constructor init

    };

    game.Snowball = Snowball; //Assign Object to Game Namespace
})(window);

