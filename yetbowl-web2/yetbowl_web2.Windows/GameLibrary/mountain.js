/*
Copyright (c) Microsoft Corporation

All rights reserved.

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.  You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0   

THIS CODE IS PROVIDED *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE, MERCHANTABLITY OR NON-INFRINGEMENT.  

See the Apache Version 2.0 License for specific language governing permissions and limitations under the License. 
*/

//-------------------------------------------------- //
/*
Mountain.js - 
Handles initializes and the drawing of the Mountain background
*/
//---------------------------------------------------//

(function (window) {
    "use strict";
    var Mountain = function () {
        //constructor
        this.init = function () {
            game.Entity.init.apply(this, null);
            this.type = 'mountain';
            this.framesize = { x: 768, y: 1366 };
            this.image = null;

            this.pos = { x: 0, y: 0 };

            this.image = new Image();
            this.image.src = 'media/gamemountain_lores.png';
        };
        
        this.init();

        this.update = function () {

        };

        this.draw = function () {
            if (this.image.complete === true) {
                game.system.canvascontext.drawImage(
                    this.image, //image
                    0, 0, //source X,Y
                    this.framesize.x, this.framesize.y, //source Size
                    this.pos.x, this.pos.y, //target position
                    this.framesize.x, this.framesize.y //target size
                );
            }
        };
    };
    game.Mountain = Mountain; //Assign Object to Game Namespace
})(window);

