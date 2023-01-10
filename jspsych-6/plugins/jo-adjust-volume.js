/*
 * Example plugin template
 */

jsPsych.plugins["jo-adjust-volume"] = (function() {

  var plugin = {};

  plugin.info = {
    name: "jo-adjust-volume",
  }

  plugin.trial = function(display_element, trial) {

    display_element.innerHTML = '<p>You will now listen to a continuous audio sequence of tones and beats. These will keep playing on loop.  <b>While it plays, please use this time to adjust your volume to a comfortable level</b> -- such that you are okay with not changing this anymore throughout the whole experiment.</p><p>Press the <b>ENTER KEY</b> to hear the sequence, and when you have adjusted your volume, press the <b>R KEY</b> to continue.<div id="countdown"></div>';

    var pace = 500;
    var s = 0;
    var timer = 0;
    var timeleft = 3;
    var standard_volume = 4;
    var new_volume = standard_volume + trial.change_amount;
    var change_rhythm = trial.change_rhythm;
    var start_time = performance.now();

    synth_beat.toDestination();
    synth_note.toDestination();
    document.addEventListener("keydown", play_note, true);

    var note_loop;
    function play_note(evt){
        if (evt.keyCode == 13){
            console.log(trial.change, trial.change_amount, trial.change_location);
            document.removeEventListener("keydown", play_note, true);
            document.getElementById("countdown").innerHTML = "Playing...";
            note_loop = setInterval(function(){
                synth_beat.triggerAttackRelease('C1', '8n');
                synth_note.triggerAttackRelease('D4', '8n');
            }, 400);
            document.addEventListener("keydown", ready_key, true);
        }
    }

    function ready_key(evt){
        if (evt.key=='r'){
            document.removeEventListener("keydown", ready_key, true);
            clearInterval(note_loop);
            end_trial();
        }
    }
    function end_trial(){
        synth_beat.disconnect();
        synth_note.disconnect();

        // data saving
        var trial_data = {
          rhythm: trial.rhythm,
          change_location: trial.change_location,
          change_amount: trial.change_amount,
          rt: performance.now() - start_time
        };

        // end trial
        jsPsych.finishTrial(trial_data);
    }

  };

  return plugin;
})();
