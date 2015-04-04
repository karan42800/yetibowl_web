/*
Copyright (c) Microsoft Corporation

All rights reserved.

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.  You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0   

THIS CODE IS PROVIDED *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE, MERCHANTABLITY OR NON-INFRINGEMENT.  

See the Apache Version 2.0 License for specific language governing permissions and limitations under the License. 

*/
//-------------------------------------------------- //
/*
Yeti.js - 
Creates the yeti entity.  Handles the animation of the yeti.

*/
//---------------------------------------------------//

(function (window) {
    "use strict";
    var Yeti = function() {

        this.init = function () {
            game.Entity.init.apply(this, null); //sets up a basic entity

            this.type = 'yeti';
            this.animation = { currentanim: null, frame: 0, timer: 0 };
            this.tosstimer = 8;

            this.pos = { x: 35, y: 20, angle: 330 };

            for (var i = 0; i < 7; i++) {
                this.frames[i] = new game.Frame(0, i * 288, 426, 288);
            }

            //setup animations
            this.animation_data = { passive: null, toss: null, rage: null };
            this.animation_data.passive = {//animation when yeti is idle
                sequence: [0, 1, 2, 3, 4, 5, 4, 3, 2, 1],
                timing: 1,
                spritesheet: game.Entity.loadimg('media/gameyetipassive_lores.png')
            };
            this.animation_data.hold = { //holding
                sequence: [0],
                timing: 1,
                spritesheet: game.Entity.loadimg('media/gameyetithrow_lores.png')
            };

            this.animation_data.toss = { //throwing the ball
                sequence: [1, 2, 3, 3, 3, 4, 5, 6],
                timing: 1,
                spritesheet: game.Entity.loadimg('media/gameyetithrow_lores.png')
            };

            this.animation_data.rage = { //animation when hiker reaches top of mountain
                sequence: [0, 1, 2, 3, 2, 1],
                timing: 1,
                spritesheet: game.Entity.loadimg('media/gameyetirage_lores.png')
            };

            this.changestate('hold'); //yeti starts with a snowball
            this.isLoaded = true;
        };

        this.update = function () {
            game.Entity.update_pre.apply(this, null); 
           
            //All States use this logic
            this.animation.timer++;
            if (this.animation.timer >= this.animation.currentanim.timing) {
                this.animation.timer = 0;
                this.animation.frame++;
                if (this.animation.frame > this.animation.currentanim.sequence.length - 1) {
                    this.animation.frame = 0;
                }
                this.currentframe = this.animation.currentanim.sequence[this.animation.frame];
            }
            this.image = this.animation.currentanim.spritesheet;

            //State Machine
            switch (this.state) {
                case 'passive':
                    this.STATE_passive();
                    break;
                case 'hold':
                    break;
                case 'toss':
                    this.STATE_toss();
                    break;
                case 'rage':
                    this.STATE_rage();
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

        //===== STATE LOGIC ===== //
        this.STATE_passive = function () {
            if (game.system.snowball.state === 'ready') {
                this.changestate('hold');
            }
        };

        this.STATE_toss = function () {
            this.tosstimer--;
            if (this.tosstimer < 0) {
                this.tosstimer = 8;
                this.changestate('passive');

            }
        };

        this.STATE_rage = function () {
            //state when game is over
        };

        this.changestate = function (name) {
            //called from other game objects to have yeti react to ingame events
            this.state = name;
            this.animation.currentanim = this.animation_data[name];
            this.animation.frame = 0;
            this.animation.timer = 0;
        };

        this.init();
    };
   
    game.Yeti = Yeti; //Assign Object to Game Namespace
})(window);

