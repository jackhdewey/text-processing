/**
 * jspsych-audio-keyboard-response
 * Josh de Leeuw
 *
 * plugin for playing an audio file and getting a keyboard response
 *
 * documentation: docs.jspsych.org
 *
 **/

jsPsych.plugins["draw-grid-2"] = (function() {

  var plugin = {};

  jsPsych.pluginAPI.registerPreload('draw-grid-2', 'stimulus', 'audio');

  plugin.info = {
    name: 'draw-grid-2',
    description: '',
    parameters: {
      stimulus: {
        type: jsPsych.plugins.parameterType.AUDIO,
        pretty_name: 'Stimulus',
        default: undefined,
        description: 'The audio to be played.'
      },
      choices: {
        type: jsPsych.plugins.parameterType.KEYCODE,
        pretty_name: 'Choices',
        array: true,
        default: jsPsych.ALL_KEYS,
        description: 'The keys the subject is allowed to press to respond to the stimulus.'
      },
      prompt: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Prompt',
        default: null,
        description: 'Any content here will be displayed below the stimulus.'
      },
      trial_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Trial duration',
        default: null,
        description: 'The maximum duration to wait for a response.'
      },
      response_ends_trial: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Response ends trial',
        default: true,
        description: 'If true, the trial will end when user makes a response.'
      },
      trial_ends_after_audio: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Trial ends after audio',
        default: false,
        description: 'If true, then the trial will end as soon as the audio file finishes playing.'
      },
      bypass: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Automatically end trial',
        array: false,
        default: '',
        description: 'End trial trigger'
      },
      allow_drawing: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Drawing permission',
        default: false,
        description: 'Whether they can draw on the grid.'
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

    var section_prompt = '';

    if (trial.bypass){
        end_trial();
    } else {
        // setup stimulus
        var context = jsPsych.pluginAPI.audioContext();
        if(context !== null){
          var source = context.createBufferSource();
          source.buffer = jsPsych.pluginAPI.getAudioBuffer(trial.stimulus);
          source.connect(context.destination);
        } else {
          var audio = jsPsych.pluginAPI.getAudioBuffer(trial.stimulus);
          audio.currentTime = 0;
        }

        // set up end event if trial needs it
        if(trial.trial_ends_after_audio){
          if(context !== null){
            source.onended = function() {
              end_trial();
            }
          } else {
            audio.addEventListener('ended', end_trial);
          }
        }

        if (trial.hold_key){

            section_prompt = "Hold the <b>J KEY</b> down while you hear a pattern or grouping beyond the individual tones."

            document.addEventListener("keydown", checkKeyPressed, false);
            function checkKeyPressed(pressed_key) {
              if (pressed_key.keyCode === 74) {
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
                end = performance.now(); // new Date();
                hold_dur = end - start;
                hold_durations.push(hold_dur);
                console.log("Key hold duration", hold_dur);
                document.removeEventListener("keyup", checkKeyRelease, false);
                document.addEventListener("keydown", checkKeyPressed, false);
              }
            }
        }

        // show prompt if there is one
        display_element.innerHTML = section_prompt;
        display_element.innerHTML += '<div id="countdown"></div>';

        // start audio
        if(context !== null){
          startTime = context.currentTime;
          source.start(startTime);
          document.getElementById("countdown").innerHTML = "Playing...";
        } else {
          audio.play();
          document.getElementById("countdown").innerHTML = "Playing...";
        }

        // end trial if time limit is set
        if (trial.trial_duration !== null) {
          jsPsych.pluginAPI.setTimeout(function() {
            end_trial();
          }, trial.trial_duration);
        }
    }

    // function to end trial when it is time
    function end_trial() {

      // kill any remaining setTimeout handlers
      jsPsych.pluginAPI.clearAllTimeouts();

      // stop the audio file if it is playing
      // remove end event listeners if they exist
      if(context !== null){
        source.stop();
        source.onended = function() { }
      } else {
        audio.pause();
        audio.removeEventListener('ended', end_trial);
      }

      // kill keyboard listeners
      jsPsych.pluginAPI.cancelAllKeyboardResponses();

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

      // clear the display
      display_element.innerHTML = '';

      // move on to the next trial
      jsPsych.finishTrial(trial_data);
    };

  };

  return plugin;
})();
