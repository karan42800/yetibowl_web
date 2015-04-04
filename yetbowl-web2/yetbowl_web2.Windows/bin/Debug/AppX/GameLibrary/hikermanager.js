/*
Copyright (c) Microsoft Corporation

All rights reserved.

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.  You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0   

THIS CODE IS PROVIDED *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE, MERCHANTABLITY OR NON-INFRINGEMENT.  

See the Apache Version 2.0 License for specific language governing permissions and limitations under the License. 
*/

//-------------------------------------------------- //
/*
Hikermanager.js - 
Handles the hikers on screen.  This includes spawning hiker entities at a set spawn rate from the internal data.
*/
//---------------------------------------------------//

(function (window) {
    "use strict";
    var HikerManager = function () {

        this.init = function () {
            this.spawnrate = 80; //Update Ticks(30/sec)
            this.spawnlast = 0;
            this.spawned = 0;
        };

        this.update = function () {
            this.spawnrate--;
            if (this.spawnrate <= 0) {
                this.spawned++;
               
                game.system.spawnentity('Hiker');
                this.spawnrate = 80 - this.spawned;
                this.spawnrate = Math.max(this.spawnrate, 40);
            }
        };

        this.init();
    };
   
    game.HikerManager = HikerManager; //Assign Object to Game Namespace

})(window);

