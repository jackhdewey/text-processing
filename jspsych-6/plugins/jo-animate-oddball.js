/**
 * jsPsych plugin for showing animations for oddballs
 *
 */

jsPsych.plugins['animate-oddball'] = (function() {

  var plugin = {};

  plugin.info = {
    name: 'animate-oddball',
    description: '',
    parameters: {
      stimulus: {
        type: jsPsych.plugins.parameterType.IMAGE,
        pretty_name: 'Stimulus',
        default: undefined,
        description: 'The image to be displayed'
      },
      choices: {
        type: jsPsych.plugins.parameterType.KEYCODE,
        pretty_name: 'Choices',
        default: jsPsych.NO_KEYS,
        description: 'The keys the subject is allowed to press to respond to the stimulus.'
      },
      canvas_size: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Canvas size',
        array: true,
        default: [400,400],
        description: 'Array specifying the width and height of the area that the animation will display in.'
      },
      image_size: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Image size',
        array: true,
        default: [100,100],
        description: 'Array specifying the width and height of the images to show.'
      },
      grow: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Grow',
        default: true,
        description: 'If true, grow image.'
      },
      trial_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Trial duration',
        default: null,
        description: 'How long to show trial before it ends.'
      },
      response_ends_trial: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Response ends trial',
        default: true,
        description: 'If true, trial will end when subject makes a response.'
      },
      pre_movement_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Pre movement duration',
        default: 100,
        description: 'How long to wait before the stimuli starts moving from behind the center rectangle.'
      }
    }
  }

  plugin.trial = function(display_element, trial) {

    // variable to keep track of timing info and responses
    var start_time = 0;
    var responses = [];

    display_element.innerHTML = "<svg id='jspsych-canvas' width=" + trial.canvas_size[0] + " height=" + trial.canvas_size[1] + "></svg>";

    var paper = Snap("#jspsych-canvas");

    var image_path = "images/"+trial.stimulus+"_std.png"
    var c = paper.image(image_path,
                        (trial.canvas_size[0]  - trial.image_size[0]) * 0.5,
                        (trial.canvas_size[1]  - trial.image_size[1]) * 0.5,
                        trial.image_size[0], trial.image_size[1]).attr({"id": 'jspsych-image'});

    var growth_amount = 3;
    function next_step() {
        if (trial.grow){
            c.animate({width: trial.image_size[0] * growth_amount,
                        height: trial.image_size[1] * growth_amount,
                        x: (trial.canvas_size[0] - trial.image_size[0] * growth_amount) * 0.5,
                        y: (trial.canvas_size[1] - trial.image_size[1] * growth_amount) * 0.5},
                        trial.trial_duration/growth_amount);
        };

        // start timer for this trial
        start_time = performance.now();
    };

    if (trial.pre_movement_duration > 0) {
      jsPsych.pluginAPI.setTimeout(function() {
        next_step();
      }, trial.pre_movement_duration);
    } else {
      next_step();
    };

    // store response
    var response = {
      rt: null,
      key: null
    };

    // function to end trial when it is time
    var end_trial = function() {

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

    // start the response listener
    if (trial.choices != jsPsych.NO_KEYS) {
      var keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: after_response,
        valid_responses: trial.choices,
        rt_method: 'performance',
        persist: false,
        allow_held_key: false
      });
    };

    // end trial if trial_duration is set
    if (trial.trial_duration !== null) {
      jsPsych.pluginAPI.setTimeout(function() {
        end_trial();
      }, trial.trial_duration);
    }

  };

  return plugin;
})();
