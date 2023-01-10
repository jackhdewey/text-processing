/**
 * jsPsych plugin for showing scenes that mimic the experiments described in
 *
 * Fiser, J., & Aslin, R. N. (2001). Unsupervised statistical learning of
 * higher-order spatial structures from visual scenes. Psychological science,
 * 12(6), 499-504.
 *
 * Josh de Leeuw
 *
 * documentation: docs.jspsych.org
 *
 */

jsPsych.plugins['draw-grid-2'] = (function() {

  var plugin = {};

  jsPsych.pluginAPI.registerPreload('draw-grid-2', 'stimuli', 'image');

  plugin.info = {
    name: 'draw-grid-2',
    description: '',
    parameters: {
      grid_size: {
        type: jsPsych.plugins.parameterType.IMAGE,
        pretty_name: 'Grid dimensions',
        default: undefined,
        description: 'x by x squares.'
      },
      canvas_size: {
        type: jsPsych.plugins.parameterType.IMAGE,
        pretty_name: 'Grid dimensions',
        array: true,
        default: [500, 500],
        description: 'Size of canvas.'
      },
      trial_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Trial duration',
        default: 2000,
        description: 'How long to show the stimulus for in milliseconds.'
      },
      allow_drawing: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Drawing permission',
        default: false,
        description: 'Whether they can draw on the grid.'
      },
      prompt: {
        type: jsPsych.plugins.parameterType.HTML_STRING,
        pretty_name: 'Text prompt',
        default: '<p>Press SPACE to tap out as many rhythms as you experienced hearing.</p>',
        description: 'Instructions with the grid.'
      },
      choices: {
        type: jsPsych.plugins.parameterType.KEYCODE,
        array: true,
        pretty_name: 'Choices',
        default: [],
        description: 'The keys the subject is allowed to press to respond to the stimulus.'
      },
      subj_id: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Subject name',
        array: true,
        default: '',
        description: 'ID of the subject'
      },
      bypass: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Automatically end trial',
        array: false,
        default: '',
        description: 'End trial trigger'
      },
      hold_key: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Automatically end trial',
        array: false,
        default: false,
        description: 'End trial trigger'
      },
      control_key: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Automatically end trial',
        array: false,
        default: false,
        description: 'End trial trigger'
      },
    }
  }

  plugin.trial = function(display_element, trial) {
    var hold_onsets = [];
    var hold_durations = [];
    var hold_num = 0;

    var control_onsets = [];
    var control_durations = [];
    var control_num = 0;
    var no_control_onsets = [];
    var no_control_durations = [];
    var no_control_num = 0;

    var pace = 350;

    if (trial.bypass){
        console.log("END TRIAL")
        endTrial();
    } else {
        var phase_prompt = "";
        if (trial.hold_key){

//            phase_prompt = "<span id='holdKeyPrompt'>Hold the S KEY down when you see a shape/pattern.</span>";

            document.addEventListener("keydown", checkKeyPressed, false);
            function checkKeyPressed(pressed_key) {
              if (pressed_key.keyCode === 74) {
//                display_element.querySelector('#holdKeyPrompt').setAttribute("style", "color:blue");
                start = performance.now() // new Date();
                hold_onsets.push(start);
                hold_num++;
                console.log("Adding hold", hold_num);
                document.removeEventListener("keydown", checkKeyPressed, false);
                document.addEventListener("keyup", checkKeyRelease, false);
              }
            };

            function checkKeyRelease(pressed_key) {
              if (pressed_key.keyCode === 74) {
//                display_element.querySelector('#holdKeyPrompt').setAttribute("style", "color:black");
                end = performance.now(); // new Date();
                hold_dur = end - start;
                hold_durations.push(hold_dur);
                console.log("Here is the calculated total duration of the key hold.", hold_dur);
                document.removeEventListener("keyup", checkKeyRelease, false);
                document.addEventListener("keydown", checkKeyPressed, false);
              }
            }
        }

        if (trial.control_key){

//            phase_prompt = "<span id='holdKeyPrompt'>Hold the S KEY down when you see an S, and the D KEY when you see a different pattern.</span>";

            document.addEventListener("keydown", checkKeyPressed, false);
            function checkKeyPressed(pressed_key) {
              if (pressed_key.keyCode === 74) {
//                display_element.querySelector('#holdKeyPrompt').setAttribute("style", "color:blue");
                start = performance.now() // new Date();
                control_onsets.push(start);
                control_num++;
                console.log("Adding SUCCESS hold", control_num);
                document.removeEventListener("keydown", checkKeyPressed, false);
                document.addEventListener("keyup", checkKeyRelease, false);
              } else if (pressed_key.keyCode === 70) {
//                display_element.querySelector('#holdKeyPrompt').setAttribute("style", "color:purple");
                start = performance.now() // new Date();
                no_control_onsets.push(start);
                no_control_num++;
                console.log("Adding OOPS hold", no_control_num);
                document.removeEventListener("keydown", checkKeyPressed, false);
                document.addEventListener("keyup", checkKeyRelease, false);
              }
            };

            function checkKeyRelease(pressed_key) {
              if (pressed_key.keyCode === 74) {
//                display_element.querySelector('#holdKeyPrompt').setAttribute("style", "color:black");
                end = performance.now(); // new Date();
                control_dur = end - start;
                control_durations.push(control_dur);
                console.log("Here is the calculated total duration of the key hold.", control_dur);
                document.removeEventListener("keyup", checkKeyRelease, false);
                document.addEventListener("keydown", checkKeyPressed, false);
              }  else if (pressed_key.keyCode === 70) {
//                display_element.querySelector('#holdKeyPrompt').setAttribute("style", "color:black");
                end = performance.now(); // new Date();
                no_control_dur = end - start;
                no_control_durations.push(no_control_dur);
                console.log("Here is the calculated total duration of the key hold.", no_control_dur);
                document.removeEventListener("keyup", checkKeyRelease, false);
                document.addEventListener("keydown", checkKeyPressed, false);
              }
            }
        }

        var rhythm_onsets = [];
        var rhythm_presses = [];
        var start_now = performance.now();
        var check_key = 0;
        if (trial.allow_drawing == true){
            display_element.innerHTML = '<p>Press the RETURN key to hear the tones.</p><div id="countdown"></div>';
            display_element.innerHTML += trial.prompt;
            function checkKeyPressed(pressed_key) {
              if (pressed_key.keyCode === 32) {
//                rep_synth.triggerAttackRelease('D1', '8n');
                key_onset = performance.now() - start_now;
                check_key = 1;
                rhythm_onsets.push(key_onset);
              }
            };
        } else {
            display_element.innerHTML = '<p>Press the RETURN key to hear the tones.</p><div id="countdown"></div>';
        }

        function formatTimer (seconds)
        {
            seconds = Math.floor(seconds);

            var new_sec = null;
            var new_min = null;
            var new_time = "";

            new_sec = seconds%60;
            new_sec = (new_sec < 10 ? "0" + new_sec : new_sec);
            new_min = Math.floor(seconds/60);

            new_time = new_min + ":" + new_sec;

            return new_time;
        };

        function writeMessage(canvas, message)
        {
            console.log(message);
        };

        function startTimer()
        {
            if(isTimerStarted == 0)
            {
              isTimerStarted = 1;
              startTime = Date.now();

              setInterval(function(){
                var elapsedTime = Date.now() - startTime;
                timer_time = (elapsedTime / 1000).toFixed(3);
              //  console.log(timer_time);
              }, 50);
            }
        };

        function resetTimer() {
            timer_time = 0;
            startTime = Date.now();
        };

       function getMousePos(canvas, evt)
        {
            var rect = canvas.getBoundingClientRect();
            return {
                x: evt.clientX - rect.left,
                y: evt.clientY - rect.top
            };
        };

        function get_key_for_grid(info)
        {
            response = info;
            if (response.key == 81) { endTrial()};
        };

        var keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
            callback_function: get_key_for_grid,
            valid_responses: trial.choices,
            rt_method: 'performance',
            persist: false,
            allow_held_key: false
        });

        var s = 0;
        var timer = 0;
        var timeleft = 3;

        synth_note.toDestination();
        document.addEventListener("keydown", play_note, true);

        function play_note(evt){
            if (evt.keyCode == 13){
                console.log("END", Math.round(trial.trial_duration/pace));
                document.removeEventListener("keydown", play_note, true);
                document.addEventListener("keydown", checkKeyPressed, false);

                var downloadTimer = setInterval(function(){
                  if(timeleft <= 0){
                    clearInterval(downloadTimer);
                    document.getElementById("countdown").innerHTML = "Playing...";
                    var note_loop = setInterval(function(){

                        if (trial.allow_drawing){
                            console.log(check_key)
                            rhythm_presses.push(check_key);
                            if (check_key==1){
//                                rep_synth.triggerAttackRelease('D1', '8n');
                                check_key = 0;
                            }
                        }

                        synth_note.triggerAttackRelease('D4', '8n');

                        s++;
                        console.log(s);
                        if (s==Math.round(trial.trial_duration/pace)){
                            clearInterval(note_loop);
                            endTrial();
                        };
                    }, pace);
                  } else {
                    document.getElementById("countdown").innerHTML = timeleft;
                  }
                  timeleft -= 1;
                }, 500);
            }
        }
    }

    function endTrial() {
        document.removeEventListener("keydown", checkKeyPressed, false);
        document.removeEventListener("keyup", checkKeyRelease, false);
        display_element.innerHTML = '';
        synth_note.disconnect();

        console.log(rhythm_presses);
        console.log(rhythm_onsets);

        var trial_data = {
            "stimulus": JSON.stringify(trial.stimuli),
            "hold_onsets": JSON.stringify(hold_onsets),
            "hold_durations": JSON.stringify(hold_durations),
            "hold_num": JSON.stringify(hold_num),
            "control_onsets": JSON.stringify(control_onsets),
            "control_durations": JSON.stringify(control_durations),
            "control_num": JSON.stringify(control_num),
            "no_control_onsets": JSON.stringify(no_control_onsets),
            "no_control_durations": JSON.stringify(no_control_durations),
            "no_control_num": JSON.stringify(no_control_num),
        };

        jsPsych.finishTrial(trial_data);
    };
  };
  return plugin;
})();
