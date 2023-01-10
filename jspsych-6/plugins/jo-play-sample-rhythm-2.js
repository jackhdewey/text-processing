/**
 * jspsych-audio-keyboard-response
 * Josh de Leeuw
 *
 * plugin for playing an audio file and getting a keyboard response
 *
 * documentation: docs.jspsych.org
 *
 **/

jsPsych.plugins["jo-play-sample-rhythm"] = (function() {

  var plugin = {};

  jsPsych.pluginAPI.registerPreload('jo-play-sample-rhythm', 'stimulus', 'audio');

  plugin.info = {
    name: 'jo-play-sample-rhythm',
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
      demo: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Whether the section is a demo to imagine or not',
        default: false,
        description: 'If true, display prompt for imagining.'
      },
    }
  }

  plugin.trial = function(display_element, trial) {

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

    // show prompt if there is one
    var section_prompt = '';

    if (trial.demo=='imagine'){
        section_prompt = "Great! Now you'll hear the regular sequence of tones one more time for another 30 seconds.  This time, we’ll ask you to try to hear a specific rhythm (you can press the RETURN key after reading these instructions to hear it).  The way we will tell you what to try to hear is by playing a regular sequence of tones, with the drumbeats again superimposed onto the sequence.</p><p>Now, for some people, it might take time to hear this rhythm.  Or you might hear the rhythm one moment, and then not in the next.  Each time you experience any of the tones as grouped into the specific rhythm, regardless of where or how you hear it, please hold the <b>J KEY</b> down for the duration you hear the rhythm.  However, many people also find that while trying to imagine a specific rhythm, they may also begin to hear all sorts of other patterns besides this specific rhythm.  This is okay!  When you hear a different rhythmic pattern besides the one we've asked you to hear, please hold the <b>F KEY</b> down for the duration you hear this other pattern.</p><p>Press the RETURN key to play the specific rhythm, and then place your left and right index fingers on the F and J keys respectively.  When you feel like you remember the rhythm, press the R key to begin.";
    } else if (trial.demo=='demo1'){
        section_prompt = "Press the RETURN key to play a sample rhythm.";
    } else if (trial.demo=='demo2'){
        section_prompt = "Press the RETURN key to play another example.";
    }

    display_element.innerHTML = section_prompt;
    display_element.innerHTML += '<div id="countdown"></div>';

    // store response
    var response = {
      rt: null,
      key: null
    };

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

      // gather the data to store for the trial
      if(context !== null && response.rt !== null){
        response.rt = Math.round(response.rt * 1000);
      }
      var trial_data = {
        "rt": response.rt,
        "stimulus": trial.stimulus,
        "key_press": response.key
      };

      // clear the display
      display_element.innerHTML = '';

      // move on to the next trial
      jsPsych.finishTrial(trial_data);
    };

    // function to handle responses by the subject
    var after_response = function(info) {

      // only record the first response
      if (response.key == null) {
        response = info;
      }

      if (trial.response_ends_trial) {
        end_trial();
      }
    };

    // start audio
    var startTime;
    var startAudio;
    var endAudio;
    document.addEventListener("keydown", play_note, true);
    function play_note(evt){
        if (evt.keyCode == 13){
            startAudio = performance.now();
            if(context !== null){
              startTime = context.currentTime;
              source.start(startTime);
            } else {
              audio.play();
            }
            document.removeEventListener("keydown", play_note, true);
            document.getElementById("countdown").innerHTML = "Playing...";
        }
    }

    // start the response listener
    if(context !== null) {
      var keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: after_response,
        valid_responses: trial.choices,
        rt_method: 'audio',
        persist: false,
        allow_held_key: false,
        audio_context: context,
        audio_context_start_time: startTime
      });
    } else {
      var keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: after_response,
        valid_responses: trial.choices,
        rt_method: 'performance',
        persist: false,
        allow_held_key: false
      });
    }

    // end trial if time limit is set
    if (trial.trial_duration !== null) {
      jsPsych.pluginAPI.setTimeout(function() {
        end_trial();
      }, trial.trial_duration);
    }

  };

  return plugin;
})();
