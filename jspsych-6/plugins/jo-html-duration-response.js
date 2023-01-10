/*
 * Example plugin template
 */

jsPsych.plugins["html-duration-response"] = (function() {

  var plugin = {};

  plugin.info = {
    name: "html-duration-response",
    description:'Allows you to get the duration of a key hold',
    parameters: {
      stimulus: {
        type: jsPsych.plugins.parameterType.HTML_STRING,
        pretty_name: 'Stimulus',
        default: 'This is the stimulus. This accepts HTML, String, etc. If you want to put an image in, please write it as you would for the html-keyboard-response type, NOT the html-image-response type.',
        description: 'The HTML string to be displayed'
      },
      prompt: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Prompt',
        default: 'This is the prompt (aka subtitle). This only accepts a string.',
        description: 'Any content here will be displayed below the stimulus.'
      },
      choice: {
        type: jsPsych.plugins.parameterType.KEYCODE,
        pretty_name: 'Choice',
        default: 'enter',
        description: 'ONLY ALLOWS ONE KEY.'
      }
    }
  }

  plugin.trial = function(display_element, trial) {

    var new_html = '<div id="jspsych-html-duration-response-stimulus">'+trial.stimulus+'</div>';

    // add prompt
    if(trial.prompt !== null){
      new_html += trial.prompt;
    }

    // draw
    display_element.innerHTML = new_html;

    // create variable to store response
    var response = {
      duration: null
    };

    // to capture the keypress
    var allowed_keycode = jsPsych.pluginAPI.convertKeyCharacterToKeyCode(trial.choice);
    var start;
    var end;

    document.addEventListener("keydown", checkKeyPressed, false);
    function checkKeyPressed(pressed_key) {
      if (pressed_key.keyCode === allowed_keycode) {
        start = performance.now() // new Date();
        console.log("You have pressed down a valid key. This is the moment of press-down:");
        console.log(start);
        document.removeEventListener("keydown", checkKeyPressed, false)
      }
    };

    document.addEventListener("keyup", checkKeyRelease, false);
    function checkKeyRelease(pressed_key) {
      if (pressed_key.keyCode === allowed_keycode) {
        end = performance.now(); // new Date();
        response.duration = end - start;
        console.log("You have released your valid key. This is the moment of release:");
        console.log(end)

        console.log("Here is the calculated total duration of the key hold.")
        console.log(response.duration)
        document.removeEventListener("keyup", checkKeyRelease, false)

        // data saving
        var trial_data = {
          "holdDuration": response.duration
        };

        // end trial
        jsPsych.finishTrial(trial_data);
      }
    }
  };

  return plugin;
})();
