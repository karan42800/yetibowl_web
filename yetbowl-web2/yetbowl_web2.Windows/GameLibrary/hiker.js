/*
Copyright (c) Microsoft Corporation

All rights reserved.

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.  You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0   

THIS CODE IS PROVIDED *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE, MERCHANTABLITY OR NON-INFRINGEMENT.  

See the Apache Version 2.0 License for specific language governing permissions and limitations under the License. 
*/

//-------------------------------------------------- //
/*
Hiker.js - 
Creates an Hiker entity.  This object is mainly controlled by a path system using target points.
Uses a simple statemachine to control behaivor
*/
//---------------------------------------------------//

(function (window) {
    "use strict";
    var Hiker = function(){

        this.init = function (hikerdata) {
            game.Entity.init.apply(this, null); //sets up a basic entity

            this.framesize = { x: 129, y: 187 };
            this.framesizeHD = { x: 242, y: 351 };

            this.type = 'hiker';

            this.target_index = 0;
            this.target_points = [ //normal path a hiker follows up the mountain
                { x: 500, y: 1350 },
                { x: 559, y: 1050 },
                { x: 55, y: 850 },
                { x: 55, y: 830 },
                { x: 550, y: 585 },
                { x: 552, y: 565 },
                { x: 170, y: 410 },
                { x: 450, y: 280 },
                { x: 450, y: 245 },
                { x: 260, y: 160 },
                { x: 360, y: 120 },
                { x: 360, y: -50 }
            ];
            this.win_path = [ //movement for hiker when he reaches the summit
                 { x: 360, y: -50 },
                 { x: 330, y: -60 },
                 { x: 370, y: -70 }
            ];

            this.vel = { x: 10, y: 5, angle: 0 };
            this.collision_radius = 45;

            this.sinvalue = 0; //gives the hikers a little bounciness on movement
            this.sintick = 0;

            this.state = 'loading';
            this.hikerpointer = null;

            var hikersprite = Math.round(Math.random() * 4); //pull a random sprite for this demo
            this.frames[0] = new game.Frame(this.framesize.x * hikersprite, 0, this.framesize.x, this.framesize.y);
            this.image = game.Entity.loadimg('media/hikers_lores.png');

            //grab first target from set of points
            this.currentTarget = this.target_points[0];
            this.pos.x = this.currentTarget.x;
            this.pos.y = this.currentTarget.y;
            this.last.x = this.currentTarget.x;
            this.last.y = this.currentTarget.y;

            this.sintick = Math.max(0.6, Math.random() + 0.4); //Randomly choses bounciness of a hiker

        };


        this.update = function () {
            game.Entity.update_pre.apply(this, null);

            switch (this.state) {
                case 'loading':
                    this.STATE_loading();
                    break;
                case 'normal':
                    this.STATE_normal();
                    break;
                case 'struck':
                    this.STATE_struck();
                    break;
                case 'win':
                    this.STATE_win();
                    break;
                case 'gameover':
                    this.STATE_gameover();
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

        this.kill = function () {
            this.isDead = true;
        };

        this.STATE_normal = function () {
            var targetvector = { x: this.currentTarget.x - this.pos.x, y: this.currentTarget.y - this.pos.y };
            if (game.Entity.vectorlength(targetvector) < 20) {
                this.target_index++;
                if (this.target_index < this.target_points.length) {
                    this.currentTarget = this.target_points[this.target_index];
                }
                else {
                    game.system.hikersuccess();
                    this.state = 'win';
                    return;
                }
            };

            var normalizedvector = game.Entity.normalizevector(Math.round(targetvector.x), Math.round(targetvector.y));
            this.pos.x += this.vel.x * normalizedvector.x; //move to target
            this.pos.y += this.vel.y * normalizedvector.y + (Math.sin(this.sinvalue) * 2);

            //test collision(Using Circular Collison Detection)
            var snowball_pos = game.system.snowball.pos;
            var snowball_col = game.system.snowball.collision_radius;

            var vectorTo = { x: this.pos.x - snowball_pos.x, y: this.pos.y - snowball_pos.y };

            if ((game.Entity.vectorlength(vectorTo) - this.collision_radius - snowball_col) < 0) {
                //collision has happened
                this.updatestats();
                this.vel.x = vectorTo.x * 0.3;
                this.vel.y = vectorTo.y * 0.3;

                this.state = 'struck';

                //notify snowball
                game.system.snowball.collision(vectorTo);
            }

            //flip image depending on direction traveling
            if (normalizedvector.x < 0) {
                this.flipped = false;
            }
            else if (normalizedvector.x > 0) {
                this.flipped = true;
            }

            this.sinvalue += this.sintick;

        };

        this.STATE_struck = function () {
            this.vel.x += game.system.map.gravity.x * 0.5;
            this.vel.y += game.system.map.gravity.y * 0.5;

            this.pos.x += this.vel.x;
            this.pos.y += this.vel.y;

            if (this.vel.x < 0) {
                this.pos.angle += 10;
            }
            else {
                this.pos.angle -= 10;
            }

            if (this.pos.y > 2500 || this.pos.y < -400
                        || this.pos.x < -800 || this.pos.x > 1050) {
                //hiker offscreen
                this.kill();
            }
        };

        this.STATE_win = function () {
            var targetvector = { x: this.currentTarget.x - this.pos.x, y: this.currentTarget.y - this.pos.y };
            if (game.Entity.vectorlength(targetvector) < 10) {
                this.target_index++;
                if (this.target_index >= this.win_path.length) {
                    this.target_index = 0;
                }
                this.currentTarget = this.win_path[this.target_index];
            };

            var normalizedvector = game.Entity.normalizevector(Math.round(targetvector.x), Math.round(targetvector.y));
            this.pos.x += this.vel.x * normalizedvector.x; //move to target
            this.pos.y += this.vel.y * normalizedvector.y + (Math.sin(this.sinvalue) * 2);
        };

        this.STATE_loading = function () {
            if (this.image.complete === true) {
                //if images arent loaded wait
                this.isLoaded = true;
                this.state = 'normal';
                return;
            }
        };

        this.STATE_gameover = function () {


        };

        this.updatestats = function () {
            //updates all the stats for the game when a hiker is killed
            game.system.hikerkills++; //system count for UI and gameover
        };

        this.init();
    };
   
    game.Hiker = Hiker; //Assign Object to Game Namespace
})(window);

