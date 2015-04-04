/*
Copyright (c) Microsoft Corporation

All rights reserved.

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.  You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0   

THIS CODE IS PROVIDED *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE, MERCHANTABLITY OR NON-INFRINGEMENT.  

See the Apache Version 2.0 License for specific language governing permissions and limitations under the License. 
*/

//-------------------------------------------------- //
/*
Frame.js - 
Helper class for objects to create frames from a spritesheet.  Encapsalates the canvas drawing of images into one class.
*/
//---------------------------------------------------//

(function (window) {
    "use strict";
    var Frame = function(sourcex, sourcey, width, height){

        this.init = function (sourcex, sourcey, width, height) {
            this.source = { x: 0, y: 0 };
            this.size = { width: 0, height: 0 };
            this.halfsize = { width: 0, height: 0 };
            this.pivot = { x: 0, y: 0 };

            this.source.x = sourcex;
            this.source.y = sourcey;
            this.size.width = width;
            this.size.height = height;
            this.halfsize.width = Math.round(width / 2);
            this.halfsize.height = Math.round(height / 2);
        };

        this.setpivot = function (x, y) {
            this.pivot.x = Math.round(x); //convert to integer
            this.pivot.y = Math.round(y); //convert to integer
        };

        this.draw = function (targetX, targetY, img, angle, flipped, scale) {
            'use strict';
            if (!scale) {
                scale = 1;
            }
            //angle is in degrees
            targetX = targetX | 0; //convert to integer
            targetY = targetY | 0;

            game.system.canvascontext.setTransform(1, 0, 0, 1, 0, 0); //reset transform to normal

            if (flipped === true) {
                game.system.canvascontext.translate(this.size.width, 0);
                game.system.canvascontext.scale(-1, 1);
                targetX *= -1;
            }

            if (angle === 0) {
                //drawImage(image, srcX, srcY, srcWidth, srch, dx, dy, dw, dh)
                game.system.canvascontext.drawImage(
                    img, //image
                    this.source.x, this.source.y, //source X,Y
                    this.size.width, this.size.height, //source Size
                    targetX, targetY, //target position
                    this.size.width * scale, this.size.height * scale //target size
                );
            } else {
                game.system.canvascontext.save();
                game.system.canvascontext.translate((targetX + this.pivot.x + (this.halfsize.width * scale)),
                                            (targetY + this.pivot.y + (this.halfsize.height * scale)));

                //convert to radians then rotate
                game.system.canvascontext.rotate(angle * (0.0175427));

                game.system.canvascontext.drawImage(
                    img, this.source.x, this.source.y, this.size.width, this.size.height,
                    -(this.halfsize.width * scale) - this.pivot.x,
                    -(this.halfsize.height * scale) - this.pivot.y,
                    this.size.width * scale, this.size.height * scale
                );

                game.system.canvascontext.restore();
            }
            
            if (flipped === true) { //undo flipped transforms
                game.system.canvascontext.scale(-1, 1);
                game.system.canvascontext.translate(img.width * -1 * scale, 0);
            }
        };

        this.changesize = function (width, height) {
            if (width) {
                this.size.width = Math.max(width, 0);
                this.halfsize.width = width / 2;
            }

            if (height) {
                this.size.height = Math.max(height, 0);
                this.halfsize.height = height / 2;
            }
        };

        this.init(sourcex, sourcey, width, height);
    };

    game.Frame = Frame; //Assign Object to Game Namespace

})(window);