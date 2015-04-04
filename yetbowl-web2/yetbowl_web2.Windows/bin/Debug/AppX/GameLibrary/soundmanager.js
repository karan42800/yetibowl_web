/*
Copyright (c) Microsoft Corporation

All rights reserved.

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.  You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0   

THIS CODE IS PROVIDED *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE, MERCHANTABLITY OR NON-INFRINGEMENT.  

See the Apache Version 2.0 License for specific language governing permissions and limitations under the License. 
*/

//-------------------------------------------------- //
/*
Soundmanager.js - 
Controls the sound memory and the playing of sound files api.  Also has a global volume setting for muting.
On initialize creates a cache of sound objects that new sounds use for memory.  These sounds are preloaded through
an api in groups that can then be unloaded by the group ID.
*/
//---------------------------------------------------//

(function (window) {
    "use strict";
    var SoundManager = function (isMute) {
        this.readyinfo = { current: 0, expected: 0 };

        this.multichannellength = 2; // zero based, so three tracks
        this.audiomemorycachelimit = 45;

        this.playingList = []; //currently playing tracks

        this.audioAvailable = []; //Memory Available
        this.audioCache = []; //Memory in Use

        this.audioDictionary = {};
        this.audioGroups = {};

        this.globalvolume = 0.2;
        this.mute = false;

        this.init = function (isMute) {
            var that = this;
            var readycallback = function () {
                that.readytoplay(this.NAME);
            };
            var endedcallback = function () {
                that.soundendedplay(this.NAME);
            };
            var errorcallback = function (e) {
                that.sounderror(this.NAME, e);
            };
            for (var i = 0; i < this.audiomemorycachelimit; i++) {
                this.audioAvailable.push(i);
                this.audioCache[i] = new Audio("media/Sounds/atompop.mp3"); //just a generic file to get placed
                this.audioCache[i].preload = "none";
                this.audioCache[i].addEventListener('canplaythrough', readycallback, false);
                this.audioCache[i].addEventListener('ended', endedcallback, false);
                this.audioCache[i].addEventListener('error', errorcallback, false);
                this.audioCache[i].addEventListener('onerror', errorcallback, false);
                this.audioCache[i].PLAYING = false;
                this.audioCache[i].MULTICHANNEL = false;
                this.audioCache[i].ORIGINALVOLUME = 1.0;
            }

            if (isMute) {
                this.mute_all(false);
            }

        };


        //Called during level load to cache the sounds
        this.preloadsounds = function (group_name, sound_array) {
            this.audioGroups[group_name] = [];

            for (var i = 0; i < sound_array.length; i++) {
                this.audioGroups[group_name][i] = this.load(sound_array[i].name, sound_array[i].path, sound_array[i].loop, sound_array[i].multichannel);
            }
        };


        //String Key is name used in Dictionary for calling sounds, Path is media path 'media/Sounds/x.*'
        this.load = function (string_key, path, loop, multichannel, volume) {

            if (this.audioAvailable.length > 0) {
                if (!this.audioDictionary[string_key]) {
                    var currentAudio = this.audioCache[this.audioAvailable.pop()]; //Pop top one off the available list
                    currentAudio.src = path; //Change src and load the new data
                    currentAudio.load();

                    currentAudio.NAME = string_key;

                    if (loop) {
                        currentAudio.loop = true;
                    }
                    else { currentAudio.loop = false; }

                    if (volume) {
                        currentAudio.ORIGINALVOLUME = volume * this.globalvolume; //stores for mute/unmute purposes
                    } else {
                        currentAudio.ORIGINALVOLUME = 1 * this.globalvolume;
                    }
                    if (this.mute) {
                        currentAudio.volume = 0;
                    }
                    else {
                        currentAudio.volume = currentAudio.ORIGINALVOLUME;
                    }

                    this.audioDictionary[string_key] = currentAudio; //Add to dictionary for reference

                    this.readyinfo.expected++; //keep track of audio files being loaded
                    //console.log("LOADING: " + string_key);
                    if (multichannel) {
                        currentAudio.MULTICHANNEL = true;
                        for (var i = 0; i < this.multichannellength; i++) {
                            this.load(string_key + i, path, loop, false, volume);
                        }
                    }
                    else {
                        currentAudio.MULTICHANNEL = false;
                    }
                    return string_key;
                }
                else {
                    return string_key;
                    console.log("STRING KEY ALREADY EXISTS: " + string_key);
                }
            }
            else {
                console.log("AUDIO CACHE FULL: " + string_key);
            }
        };

        this.unload_group = function (group_name) {
            var group = this.audioGroups[group_name];
            if (group) {
                for (var i = 0; i < group.length; i++) {
                    this.unload(group[i]);
                }

                delete this.audioGroups[group_name];

                return true;
            }
            return false;
        };

        this.unload = function (string_key) {

            var audiosample = this.audioDictionary[string_key];
            if (audiosample) {
                var index = this.audioCache.indexOf(audiosample);
                if (index >= 0) {
                    this.audioAvailable.push(index); //push index to signal that the audio data is available for use
                }
                if (audiosample.MULTICHANNEL) {
                    for (var i = 0; i < this.multichannellength; i++) {
                        this.unload(string_key + i);
                    }
                }
                delete this.audioDictionary[string_key]; //remove string_key from dictionary
            }
        };

        this.play = function (string_key) {
            if (this.audioDictionary[string_key]) {
                var audiosample = this.audioDictionary[string_key];

                if (audiosample.PLAYING) {
                    if (!audiosample.MULTICHANNEL) {
                        audiosample.currentTime = 0;
                    }
                    else {
                        var maxDuration = 0;
                        var maxplayedSample;
                        for (var i = 0; i < this.multichannellength; i++) {
                            audiosample = this.audioDictionary[string_key + i];
                            if (audiosample.PLAYING === false) {
                                audiosample.play();
                                audiosample.PLAYING = true;
                                return; //unused audio sample found, break out of loop
                            }
                            else {
                                if (maxDuration <= audiosample.currentTime) {
                                    maxDuration = audiosample.currentTime;
                                    maxplayedSample = audiosample; //set sample to sample with highest time
                                }
                            }
                        }

                        maxplayedSample.currentTime = 0; //if here no unused samples found, reset sample with highest duration
                    }
                }
                else {
                    audiosample.PLAYING = true;
                    audiosample.play();
                }
            }
            else {
                console.log("SOUND NOT FOUND: " + string_key);
            }
        };

        this.readytoplay = function (string_key) {
            this.readyinfo.current++;
            this.readyinfo.expected--;
            this.readyinfo.expected = Math.max(0, this.readyinfo.expected);
        };

        this.soundendedplay = function (string_key) {
            this.audioDictionary[string_key].PLAYING = false;
        };

        this.sounderror = function (string_key, event) {

            console.log("AUDIO EVENT ERROR CODE: " + event.currentTarget.error.code);

            this.readyinfo.current++;
            this.readyinfo.expected--;
            this.readyinfo.expected = Math.max(0, this.readyinfo.expected);

        };

        this.stopall = function () {
            for (var i = 0; i < this.audioCache.length; i++) {
                this.audioCache[i].pause();
                if (this.audioCache[i].currentTime != 0) {
                    this.audioCache[i].currentTime = 0;
                }
                this.audioCache[i].PLAYING = false;
            }
        };

        this.stop = function (string_key) {
            if (this.audioDictionary[string_key]) {
                var audiosample = this.audioDictionary[string_key];
                audiosample.PLAYING = false;
                audiosample.currentTime = 0;
                audiosample.pause();
            }
            else {
                console.log("STOPPING UNLOADED SOUND: " + string_key);
            }
        };

        this.mute_all = function (toggle) {
            if (!toggle) {
                for (var i = 0; i < this.audioCache.length; i++) {
                    this.audioCache[i].volume = 0;
                }
                this.mute = true;
                return true;
            }
            else {
                for (var i = 0; i < this.audioCache.length; i++) {
                    this.audioCache[i].volume = this.audioCache[i].ORIGINALVOLUME;
                }
                this.mute = false;
            }
            return false;
        };

        this.mute_toggle = function () {
            //return true if muted
            return this.mute_all(this.mute);
        };


        this.init(isMute);

    };
    game.SoundManager = SoundManager; //Assign Object to Game Namespace

})(window);
