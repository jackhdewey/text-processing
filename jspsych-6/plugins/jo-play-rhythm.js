/*
 * Example plugin template
 */

jsPsych.plugins["jo-play-rhythm"] = (function() {

  var plugin = {};

  plugin.info = {
    name: "jo-play-rhythm",
    parameters: {
      rhythm: {
        type: jsPsych.plugins.parameterType.OBJECT, // BOOL, STRING, INT, FLOAT, FUNCTION, KEYCODE, SELECT, HTML_STRING, IMAGE, AUDIO, VIDEO, OBJECT, COMPLEX
        default: [1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0]
      },
    }
  }

  plugin.trial = function(display_element, trial) {

    display_element.innerHTML = '<p>Press SPACE to hear the rhythm.</p><div id="countdown"></div>';
    var timer = 0;
    var pace = 400;
    var pace_inc = 0.4;
    var rhythm = trial.rhythm;
    var loud_beats = [0, 8];
    var s = 0;

    synth.toDestination();
    synth_note.toDestination();
    document.addEventListener("keydown", play_seq, true);

    function play_seq(evt){
        if (evt.keyCode == 32){
            document.removeEventListener("keydown", play_seq, true);
            display_element.innerHTML = '<img id="sound-img" src="images/soundIcon.png" width=50%></img>';

            var note_loop = setInterval(function(){
                if (s==16){
                    clearInterval(note_loop);
                    end_trial();
                };
                if (rhythm[s]==1){
                    play_note(2);
                    setTimeout(function(){}, pace);
                    timer += pace_inc;
                } else {
                    play_note(3);
                    setTimeout(function(){}, pace);
                    timer += pace_inc;
                }
                s++;
            }, pace);

        }
    }

    function play_note(note_id){
        if (note_id==2){
            synth.triggerAttackRelease('C1', '8n');
            synth_note.triggerAttackRelease('D4', '8n');
        } else if (note_id==3){
            synth.triggerAttackRelease('C1', '8n');
        }
    }

    function end_trial(){
        synth.disconnect();
        synth_note.disconnect();

        // data saving
        var trial_data = {
          parameter_name: 'parameter value'
        };

        // end trial
        jsPsych.finishTrial(trial_data);
    }

  };

  return plugin;
})();
