/*
Copyright (c) Microsoft Corporation

All rights reserved.

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.  You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0   

THIS CODE IS PROVIDED *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE, MERCHANTABLITY OR NON-INFRINGEMENT.  

See the Apache Version 2.0 License for specific language governing permissions and limitations under the License. 
*/

//-------------------------------------------------- //
/*
game.js - 
Main Game Logic.  This is where the main game loop exists, as well as setting up the game namespace and the 
and initialization code.
*/
//---------------------------------------------------//

(function () {
    "use strict";
    window.onload = function () {
        //Initialize the page here.
        startgame();  //starts the game
        window.game.isPaused = false;
    };

})();

(function (window) {
    "use strict";

    //game Namespace
    window.game = {
        system: null,
        isPaused: false
    };

    //Setup Request Animation Frame usage
    var prefixes = ['ms', 'moz', 'webkit'];
    for (var i = 0; i < prefixes.length && !window.requestAnimationFrame; i++) {
        window.requestAnimationFrame = window[prefixes[i] + 'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[prefixes[i] + 'CancelAnimationFrame'];
    }
})(window);

var System = function (updateFPS, canvasID) {
    this.canvascontext = null;
    this.canvaselement = null;

    this.gametick = 0;
    this.frameID = 0;
    this.dt = 0; //time since last update
    this.now = 0;
    this.last = 0;
    this.interpolationvalue = 0; //value for entities to interpolate drawing with

    //used for canceling timers/requests
    this.frameID = 0;
    this.intervalID = 0;

    this.inputmanager = null;
    this.background = null;
    this.map = null;
    this.entities = [];
    this.snowball = null;
    this.hikerkills = 0;
    this.hikervictories = 0;

    this.state = 'none';

    //Main Game Loop
    this.init = function (updateFPS, canvasID) {
        //grab canvas element and context for later
        this.canvaselement = document.getElementById(canvasID);
        this.canvascontext = this.canvaselement.getContext('2d');

        this.gametick = 1000 / updateFPS; //finds game tick in Milliseconds from FPS given
        this.gametick = parseFloat(this.gametick.toFixed(5)); //to fix float errors

        //create input manager
        this.inputmanager = new game.Input();

        //create sound manager
        var mute_option = (window.isMuted ? window.isMuted : false);
        this.soundmanager = new game.SoundManager(mute_option);

        //create UI
        this.UI = new game.UI();

        //create the map which is the level data(gravity, mountain characteristics)
        this.map = new game.Map();

        //init hiker manager, which spawns the hikers periodically
        this.hikermanager = new game.HikerManager();

        //create entities (Order matters)
        this.yeti = this.spawnentity('Yeti'); //keep a pointer for easier lookup later
        this.spawnentity('Mountain');
        this.snowball = this.spawnentity('Snowball');

        //start game loop
        var that = this;
        this.intervalID = setInterval(function () { that.run() }, 1); //start the game loop

        this.soundmanager.preloadsounds("GLOBAL",
        [
            { name: "ATOM_POP", path: "media/Sounds/atompop.mp3", multichannel: true, volume: 0.2 },
            { name: "IMPACT_B", path: "media/Sounds/impact_b.mp3", multichannel: true, volume: 1 }
        ]);

        this.state = "maingame"; //put state into main game
    },

    this.run = function () {
        //MAIN RUN LOOP
        //Run Step to decouple draw and update
        this.now = Date.now(); //Date.now returns milliseconds
        this.dt = this.dt + Math.min(this.now - this.last, this.gametick * 5); //cap change in time at 5 frames

        while (this.dt > this.gametick) {
            this.update();
            this.dt -= this.gametick;
        }

        var that = this;

        //DRAWING SECTON
        window.cancelAnimationFrame(this.frameID); //cancel request if hasnt been drawn yet

        if (game.isPaused === false) {
            this.frameID = requestAnimationFrame(function () {
                //calculates the interpolation value for the frame
                that.interpolationvalue = Math.min((that.dt + (Date.now() - that.now)) / that.gametick, 1);
                that.lastinterpval = that.interpolationvalue;

                that.draw();
            }, this.canvas);
        }
        else {
            //if game is paused dont update interpolation value
            that.interpolationvalue = that.lastinterpval;
            that.draw();
        }

        this.last = Date.now();
    };


    //These are your main update and draw functions which call all child entities and managers
    this.update = function () {
        //simple state machine
        switch (this.state) {
            case 'maingame':
                this.map.update(); //update level map from input

                var deadentities = [];
                var entity = null;
                for (var i = 0; i < this.entities.length; i++) {
                    entity = this.entities[i];
                    if (entity.isDead === false) {
                        entity.update();
                    }
                    else {
                        deadentities[deadentities.length] = i;
                    }
                }

                this.hikermanager.update();
                this.UI.update();

                //clean up dead entities
                for (var i = 0; i < deadentities.length; i++) {
                    this.entities.splice(deadentities[i] - i, 1); //removes items from array
                }
                deadentities = null;

                this.inputmanager.update();
                break;
            case 'gameover':
                this.map.update(); //update level map from input

                var deadentities = [];
                var entity = null;
                for (var i = 0; i < this.entities.length; i++) {
                    entity = this.entities[i];
                    if (entity.isDead === false) {
                        entity.update();
                    }
                    else {
                        deadentities[deadentities.length] = i;
                    }
                }
                break;
            default:
                break;
        }
    };

    this.draw = function () {
        //simple state machine
        switch (this.state) {
            case 'maingame':
                this.canvascontext.clearRect(0, 0, 768, 1366);

                for (var i = 0; i < this.entities.length; i++) {
                    if (this.entities[i].isDead === false) {
                        this.entities[i].draw();
                    }
                }

                this.UI.draw();
                break;
            case 'gameover':
                this.canvascontext.clearRect(0, 0, 768, 1366);
                this.map.draw();  //shifts the canvas if needed

                for (var i = 0; i < this.entities.length; i++) {
                    if (this.entities[i].isDead === false) {
                        this.entities[i].draw();
                    }
                }

                this.UI.draw();
                break;
            default:
                break;
        }
    };

    this.unload = function () {
        //anything that needs to be cleared when game screen is left should be here.
        clearInterval(this.intervalID);
        document.getElementById('gameover_ui').className = 'hidden';
    };

    this.spawnentity = function (type, settings) {
        //initialize child entities
        if (settings !== null && typeof (settings) !== undefined) {
            this.entities[this.entities.length] = new game[type](settings);
        }
        else {
            this.entities[this.entities.length] = new game[type]();
        }

        return this.entities[this.entities.length - 1]; //return object if caller wants to store it
    };

    this.hikersuccess = function () {
        //game is notified by hiker entities that one has reached the summit
        this.hikervictories++;

        if (this.hikervictories > 2) {
            //game over - setup game over state
            this.state = 'gameover';

            //set all current hikers to the game over state
            for (var i = 0; i < this.entities.length; i++) {
                if (this.entities[i].type === 'hiker') {
                    if (this.entities[i].state !== 'win') {
                        this.entities[i].state = 'gameover';
                    }
                    continue;
                }
                if (this.entities[i].type === 'snowball') {
                    this.entities[i].kill();
                }
            }

            this.yeti.changestate('rage'); //change yeti to angry state

            //show gameover DOM UI
            document.getElementById('gameover_ui').className = '';
        }
    };

    this.dominput =  {
        //input commands called from the dom
            restart: function () {
                game.system.unload(); //clean up any game information
                game.system = new System(30, 'game_canvas');
            },
            exit: function () {
                
            },
            snowball: function (isDown) {
                if (isDown === true) {
                    game.system.inputmanager.buttonstates.SNOWBALL_BUTTON = true;
                }
                else {
                    game.system.inputmanager.buttonstates.SNOWBALL_BUTTON = false;
                }
            },
            left_btn: function (isDown) {
                if (isDown === true) {
                    game.system.inputmanager.buttonstates.LEFT_BUTTON = true;
                }
                else {
                    game.system.inputmanager.buttonstates.LEFT_BUTTON = false;
                }
            },
            right_btn: function (isDown) {
                if (isDown === true) {
                    game.system.inputmanager.buttonstates.RIGHT_BUTTON = true;
                }
                else {
                    game.system.inputmanager.buttonstates.RIGHT_BUTTON = false;
                }
            }

    };

    this.init(updateFPS, canvasID); //call the init function

};

var startgame = function () {

    //called when page loads to initialize game
    game.system = new System(30, 'game_canvas');

    //resize canvas
    resize();
    window.addEventListener("resize", resize);
}