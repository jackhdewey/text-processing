/*
 * Example plugin template
 */

jsPsych.plugins["jo-play-beat"] = (function() {

  var plugin = {};

  plugin.info = {
    name: "jo-play-beat",
    parameters: {
      change: {
        type: jsPsych.plugins.parameterType.BOOL, // BOOL, STRING, INT, FLOAT, FUNCTION, KEYCODE, SELECT, HTML_STRING, IMAGE, AUDIO, VIDEO, OBJECT, COMPLEX
        default: true
      },
      change_amount: {
        type: jsPsych.plugins.parameterType.INT, // BOOL, STRING, INT, FLOAT, FUNCTION, KEYCODE, SELECT, HTML_STRING, IMAGE, AUDIO, VIDEO, OBJECT, COMPLEX
        default: 0
      },
      change_location: {
        type: jsPsych.plugins.parameterType.INT, // BOOL, STRING, INT, FLOAT, FUNCTION, KEYCODE, SELECT, HTML_STRING, IMAGE, AUDIO, VIDEO, OBJECT, COMPLEX
        default: 0
      },
      change_rhythm: {
        type: jsPsych.plugins.parameterType.OBJECT, // BOOL, STRING, INT, FLOAT, FUNCTION, KEYCODE, SELECT, HTML_STRING, IMAGE, AUDIO, VIDEO, OBJECT, COMPLEX
        default: []
      },
      condition: {
        type: jsPsych.plugins.parameterType.STRING, // BOOL, STRING, INT, FLOAT, FUNCTION, KEYCODE, SELECT, HTML_STRING, IMAGE, AUDIO, VIDEO, OBJECT, COMPLEX
        default: 'imagine'
      },
    }
  }

  plugin.trial = function(display_element, trial) {

    if (trial.condition=='imagine'){
        display_element.innerHTML = '<p>Press SPACE to imagine the rhythm.</p><div id="countdown"></div>';
    } else if (trial.condition=='practice'){
        display_element.innerHTML = '<p>Press SPACE to hear the beats.</p><div id="countdown"></div>';
    }

    var pace = 500;
    var s = 0;
    var timer = 0;
    var timeleft = 3;
    var standard_volume = 4;
    var new_volume = standard_volume + trial.change_amount;
    var change_rhythm = trial.change_rhythm;

    synth_beat.toDestination();
    document.addEventListener("keydown", play_note, true);

    function play_note(evt){
        if (evt.keyCode == 32){
            console.log(trial.change, trial.change_amount, trial.change_location);
            document.removeEventListener("keydown", play_note, true);
            var downloadTimer = setInterval(function(){
              if(timeleft <= 0){
                clearInterval(downloadTimer);
                document.getElementById("countdown").innerHTML = "Playing...";
                var note_loop = setInterval(function(){
                if (trial.change_location==1){
                    if (s<7){
                        synth_beat.volume.value = standard_volume;
                        synth_beat.triggerAttackRelease('C1', '8n');
//                        } else if (s==6 || s==7){
//                            new_volume += volume_inc;
//                            synth_beat.volume.value = new_volume;
//                            synth_beat.triggerAttackRelease('C1', '8n');
//                            console.log(new_volume);
                    } else if (s>15){
                        synth_beat.volume.value = standard_volume;
                        synth_beat.triggerAttackRelease('C1', '8n');
                    } else {
                        if (change_rhythm[s]==1){
                            synth_beat.volume.value = new_volume;
                            synth_beat.triggerAttackRelease('C1', '8n');
                        } else {
                            synth_beat.volume.value = standard_volume;
                            synth_beat.triggerAttackRelease('C1', '8n');
                        }
                    }
                } else if (trial.change_location==2){
                    if (s<15){
                        synth_beat.volume.value = standard_volume;
                        synth_beat.triggerAttackRelease('C1', '8n');
//                        } else if (s==14 || s==15){
//                            new_volume += volume_inc;
//                            synth_beat.volume.value = new_volume;
//                            synth_beat.triggerAttackRelease('C1', '8n');
                    } else {
                        if (change_rhythm[s]==1){
                            synth_beat.volume.value = new_volume;
                            synth_beat.triggerAttackRelease('C1', '8n');
                        } else {
                            synth_beat.volume.value = standard_volume;
                            synth_beat.triggerAttackRelease('C1', '8n');
                        }
                    }
                } else if (trial.change_location==0){
                    synth_beat.volume.value = standard_volume;
                    synth_beat.triggerAttackRelease('C1', '8n');
                } else if (trial.change_location==4){
                    if (s<3){
                        synth_beat.volume.value = standard_volume;
                        synth_beat.triggerAttackRelease('C1', '8n');
                    } else {
                        if (change_rhythm[s]==1){
                            synth_beat.volume.value = new_volume;
                            synth_beat.triggerAttackRelease('C1', '8n');
                        } else {
                            synth_beat.volume.value = standard_volume;
                            synth_beat.triggerAttackRelease('C1', '8n');
                        }
                    }
                }
                s++;
                if (s==24){
                    clearInterval(note_loop);
                    end_trial();
                };
                }, 400);
              } else {
                document.getElementById("countdown").innerHTML = timeleft;
              }
              timeleft -= 1;
            }, 500);

        }
    }

    function end_trial(){
        synth_beat.disconnect();

        // data saving
        var trial_data = {
          rhythm: trial.rhythm,
          change_location: trial.change_location,
          change_amount: trial.change_amount
        };

        // end trial
        jsPsych.finishTrial(trial_data);
    }

  };

  return plugin;
})();
