/**
 * jspsych-html-keyboard-response
 * Josh de Leeuw
 *
 * plugin for displaying a stimulus and getting a keyboard response
 *
 * documentation: docs.jspsych.org
 *
 **/


jsPsych.plugins["jo-html-keyboard-response"] = (function() {

  var plugin = {};

  plugin.info = {
    name: 'jo-html-keyboard-response',
    description: '',
    parameters: {
      stimulus: {
        type: jsPsych.plugins.parameterType.HTML_STRING,
        pretty_name: 'Stimulus',
        default: undefined,
        description: 'The HTML string to be displayed'
      },
      choices: {
        type: jsPsych.plugins.parameterType.KEYCODE,
        array: true,
        pretty_name: 'Choices',
        default: jsPsych.ALL_KEYS,
        description: 'The keys the subject is allowed to press to respond to the stimulus.'
      },
      prompt: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Prompt',
        default: null,
        description: 'Any content here will be displayed below the stimulus.'
      },
      stimulus_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Stimulus duration',
        default: null,
        description: 'How long to hide the stimulus.'
      },
      trial_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Trial duration',
        default: null,
        description: 'How long to show trial before it ends.'
      },
      wait_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Trial duration',
        default: 0,
        description: 'How long to show trial before it ends.'
      },
      response_ends_trial: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Response ends trial',
        default: true,
        description: 'If true, trial will end when subject makes a response.'
      },
      check_typo: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Response ends trial',
        default: false,
        description: 'If true, trial will end when subject makes a response.'
      },
    }
  }

  plugin.trial = function(display_element, trial) {

    var new_html = '<div id="jspsych-html-keyboard-response-stimulus">'+trial.stimulus+'</div>';

    if(trial.prompt !== null){
      new_html += '<div id="continue-prompt"><span id="prompt-span" style="color: grey; font-weight: bold">'+trial.prompt+'</div>';
    }

    // draw
    display_element.innerHTML = new_html;

    if (trial.check_typo){
        let typo = document.getElementById('typo'); // grab a reference to your element
        let is_typo = 0;
        typo.addEventListener('click', process_typo);
    }

    function process_typo(){
        typo.removeEventListener('click', process_typo);
        display_element.querySelector('#typo').setAttribute("style", "color: purple");
        is_typo = 1;
    }

    // add prompt
    setTimeout(function(){
        display_element.querySelector("#prompt-span").setAttribute("style", "color: black; font-weight: bold");
        // start the response listener
        if (trial.choices != jsPsych.NO_KEYS) {
          document.addEventListener("keydown", process_response);
        }
    }, trial.wait_duration);

    // store response
    let start_time = performance.now();
    let response = {
      rt: null,
      key: null
    };

    // function to end trial when it is time
    let end_trial = function() {

      // kill any remaining setTimeout handlers
      jsPsych.pluginAPI.clearAllTimeouts();

      // kill keyboard listeners
      if (typeof keyboardListener !== 'undefined') {
        jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);
      }

      // gather the data to store for the trial
      var trial_data = {
        "rt": response.rt,
        "stimulus": trial.stimulus,
        "key_press": response.key
      };

      console.log(trial_data);

      // clear the display
      display_element.innerHTML = '';

      // move on to the next trial
      jsPsych.finishTrial(trial_data);
    };

    // function to handle responses by the subject
    function process_response(evt){
        console.log(evt.key)
        if (evt.key == ' '){
            response.rt = performance.now() - start_time;
            if (trial.check_typo){
                if (is_typo == 1){
                    document.removeEventListener("keydown", process_response)
                    end_trial();
                } else {
                    display_element.querySelector("#prompt-span").setAttribute("style", "color: red; font-weight: bold");
                    display_element.querySelector("#prompt-span").innerHTML = "Click on the typo, and press SPACE to continue.";
                }
            } else {
                document.removeEventListener("keydown", process_response)
                end_trial();
            }

        }
    }


    var after_response = function(info) {

      // after a valid response, the stimulus will have the CSS class 'responded'
      // which can be used to provide visual feedback that a response was recorded
      display_element.querySelector('#jspsych-html-keyboard-response-stimulus').className += ' responded';

      // only record the first response
      if (response.key == null) {
        response = info;
      }

      if (trial.response_ends_trial) {
        end_trial();
      }
    };

    // hide stimulus if stimulus_duration is set
    if (trial.stimulus_duration !== null) {
      jsPsych.pluginAPI.setTimeout(function() {
        display_element.querySelector('#jspsych-html-keyboard-response-stimulus').style.visibility = 'hidden';
      }, trial.stimulus_duration);
    }

    // end trial if trial_duration is set
    if (trial.trial_duration !== null) {
      jsPsych.pluginAPI.setTimeout(function() {
        end_trial();
      }, trial.trial_duration);
    }

  };

  return plugin;
})();
