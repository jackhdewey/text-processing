/*
 * Example plugin template
 */

jsPsych.plugins["jo-play-sample-rhythm"] = (function() {

  var plugin = {};

  plugin.info = {
    name: "jo-play-sample-rhythm",
    parameters: {
      rhythm: {
        type: jsPsych.plugins.parameterType.OBJECT,
        pretty_name: 'Grid dimensions',
        default: [1, 1, 1, 0],
        description: 'x by x squares.'
      },
      demo: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Grid dimensions',
        default: false,
        description: 'x by x squares.'
      },
    }
  }

  plugin.trial = function(display_element, trial) {

    if (trial.demo){
        display_element.innerHTML = "Great! Now you'll hear the regular sequence of tones one more time for another 30 seconds.  This time, we’ll ask you to try to hear a specific rhythm (you can press the RETURN key after reading these instructions to hear it).  The way we will tell you what to try to hear is by playing a regular sequence of tones, with the drumbeats again superimposed onto the sequence.</p><p>Now, for some people, it might take time to hear this rhythm.  Or you might hear the rhythm one moment, and then not in the next.  Each time you experience any of the tones as grouped into the specific rhythm, regardless of where or how you hear it, please hold the <b>J KEY</b> down for the duration you hear the rhythm.  However, many people also find that while trying to imagine a specific rhythm, they may also begin to hear all sorts of other patterns besides this specific rhythm.  This is okay!  When you hear a different rhythmic pattern besides the one we've asked you to hear, please hold the <b>F KEY</b> down for the duration you hear this other pattern.</p><p>Press the RETURN key to play the specific rhythm, and then place your left and right index fingers on the F and J keys respectively.  When you feel like you remember the rhythm, press the R key to begin.<div id='countdown'></div>";
    } else {
        display_element.innerHTML = "Press the RETURN key to play the specific rhythm.<div id='countdown'></div>";
    }


    var pace = 350;
    var s = 0;
    var timer = 0;
    var timeleft = 3;
    var standard_volume = 4;
    var new_volume = standard_volume + trial.change_amount;
    var change_rhythm = trial.change_rhythm;
    var start_time = performance.now();

    synth_beat.toDestination();
    synth_note.toDestination();
    document.addEventListener("keydown", play_rhythm, true);

    var note_loop;
    var rhythm = trial.rhythm;
    var r = 0;
    var num_played = 0;
    function play_rhythm(evt){
        if (evt.keyCode == 13){
            document.removeEventListener("keydown", play_rhythm, true);
            document.getElementById("countdown").innerHTML = "Playing...";
            note_loop = setInterval(function(){
                if (rhythm[r]==1){
                    console.log(rhythm[r])
                    synth_beat.triggerAttackRelease('C1', '8n');
                }
                r++
                num_played++
                if (r==4){
                    r = 0
                }
                if (!trial.demo){
                    if (num_played==15){
                        document.removeEventListener("keydown", ready_key, true);
                        clearInterval(note_loop);
                        end_trial();
                    }
                }
                synth_note.triggerAttackRelease('D4', '8n');
            }, pace);
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
          rt: performance.now() - start_time,
          num_played: num_played
        };

        // end trial
        jsPsych.finishTrial(trial_data);
    }

  };

  return plugin;
})();
