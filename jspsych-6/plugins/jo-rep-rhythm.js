/*
 * Example plugin template
 */

jsPsych.plugins["rep-rhythm"] = (function() {

  var plugin = {};

  plugin.info = {
    name: "rep-rhythm",
    parameters: {
      boundary: {
        type: jsPsych.plugins.parameterType.INT, // BOOL, STRING, INT, FLOAT, FUNCTION, KEYCODE, SELECT, HTML_STRING, IMAGE, AUDIO, VIDEO, OBJECT, COMPLEX
        default: 4
      },
      final_time: {
        type: jsPsych.plugins.parameterType.INT, // BOOL, STRING, INT, FLOAT, FUNCTION, KEYCODE, SELECT, HTML_STRING, IMAGE, AUDIO, VIDEO, OBJECT, COMPLEX
      },
      note_order: {
        type: jsPsych.plugins.parameterType.OBJECT, // BOOL, STRING, INT, FLOAT, FUNCTION, KEYCODE, SELECT, HTML_STRING, IMAGE, AUDIO, VIDEO, OBJECT, COMPLEX
        default: ["D4", "D3"]
      },
    }
  }

  plugin.trial = function(display_element, trial) {

    var feedback_width = 10;

    display_element.innerHTML = '<div id="rep_prompt"><p>Press the ENTER key to reproduce the rhythm.</p></div><div id="feedback-bar" style="width:10px; height:100px; background:blue"></div>';

    var num_notes = 8;
    var notes = trial.note_order;
    var input_notes = 0;
    var input_times = [];
    var start_time = performance.now();
    var start_play = 0;

//    console.log("STARTING REP", input_notes);
    rep_synth.toDestination();
    document.addEventListener("keydown", play_note, true);

    function play_note(evt){
        if (evt.keyCode == 13){
            if (input_notes < num_notes){
                if (input_notes==0){ start_play = 1;}
                resp_time = performance.now() - start_time;
                if (input_notes < trial.boundary){ note = notes[0]} else { note = notes[1]};
                rep_synth.triggerAttackRelease(note, 0.25);
                input_notes += 1;
                input_times.push(resp_time);
                feedback_width += 45;
                display_element.querySelector("#feedback-bar").style.width = feedback_width.toString() + "px";
//                console.log("Pressed", input_notes, num_notes, trial.boundary)
            }
            if (input_notes==num_notes){
                if (start_play == 1){
                    start_play = 0;
                    console.log("Rep Complete", input_notes, num_notes);
                    setTimeout(end_rep_trial, 1000);
                }
            }
        }
    }

    function after_response(){
        // kill any remaining setTimeout handlers
        jsPsych.pluginAPI.clearAllTimeouts();

        // kill keyboard listeners
        document.removeEventListener("keydown", play_note, true);

        // data saving
        var trial_data = {
          boundary: trial.boundary,
          note_order: trial.notes,
          input_time1: input_times[0],
          input_time2: input_times[1],
          input_time3: input_times[2],
          input_time4: input_times[3],
          input_time5: input_times[4],
          input_time6: input_times[5],
          input_time7: input_times[6],
          input_time8: input_times[7],
          is_too_short: is_too_short
        };

        // end trial
        jsPsych.finishTrial(trial_data);
    }

    function end_rep_trial(){
        rep_synth.disconnect();

        is_too_short = false;
        console.log("Original End Time:", trial.final_time/1000);
        console.log("Final Time:", input_times[7]/1000 - input_times[0]/1000);
        original_final_time = trial.final_time/1000;
        curr_final_time = input_times[7]/1000 - input_times[0]/1000;
        if (curr_final_time <= original_final_time*0.5){
            console.log("Too short!")
            is_too_short = true;
        }

        if (is_too_short){
            remaining_time = 10;
            display_element.querySelector('#rep_prompt').innerHTML = "Oops, your last reproduction was far too short.  In fact, it was less than 50% of the original rhythm's duration.  <p>To do this experiment well, we need you to reproduce the rhythm as closely to the original rhythm as you can.  Your data will only be useful to us if you do!</p><p>You will only be allowed to continue in "+remaining_time+" seconds.</p>";
            display_element.querySelector('#feedback-bar').setAttribute("style", "display: none");
            wait_timer = setInterval(function(){
                remaining_time -= 1;
                display_element.querySelector('#rep_prompt').innerHTML = "Oops, your last reproduction was far too short.  In fact, it was less than 50% of the original rhythm's duration.  <p>To do this experiment well, we need you to reproduce the rhythm as closely to the original rhythm as you can.  Your data will only be useful to us if you do!</p><p>You will only be allowed to continue in "+remaining_time+" seconds.</p>";
                if (remaining_time == 0){
                    clearInterval(wait_timer);
                    var keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
                        callback_function: after_response,
                        valid_responses: ['space'],
                        rt_method: 'performance',
                        persist: false,
                        allow_held_key: false
                    });
                    clearInterval(wait_timer);
                    display_element.querySelector('#rep_prompt').innerHTML = "Oops, your last reproduction was far too short.  In fact, it was less than 50% of the original rhythm's duration.  <p>To do this experiment well, we need you to reproduce the rhythm as closely to the original rhythm as you can.  Your data will only be useful to us if you do!</p><p><b>Press the spacebar to continue.</b></p>";
                }
            }, 1000)
        } else {
            // kill any remaining setTimeout handlers
            jsPsych.pluginAPI.clearAllTimeouts();

            // kill keyboard listeners
            document.removeEventListener("keydown", play_note, true);

            // data saving
            var trial_data = {
              boundary: trial.boundary,
              note_order: trial.notes,
              input_time1: input_times[0],
              input_time2: input_times[1],
              input_time3: input_times[2],
              input_time4: input_times[3],
              input_time5: input_times[4],
              input_time6: input_times[5],
              input_time7: input_times[6],
              input_time8: input_times[7],
              is_too_short: is_too_short
            };

            // end trial
            jsPsych.finishTrial(trial_data);
        }
    };
  };

  return plugin;
})();
