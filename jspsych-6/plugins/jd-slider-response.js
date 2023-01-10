/**
 * Name: jspsych-html-slider-response
 * Description: a jspsych plugin for slider survey questions
 */

jsPsych.plugins['jd-html-slider-response'] = (function() {

  let plugin = {};

  plugin.info = {
    name: 'jd-html-slider-response',
    description: '',
    parameters: {
      stimulus: {
        type: jsPsych.plugins.parameterType.HTML_STRING,
        pretty_name: 'Stimulus',
        default: undefined,
        description: 'The HTML string to be displayed'
      },
      min: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Min slider',
        default: 0,
        description: 'Sets the minimum value of the slider.'
      },
      max: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Max slider',
        default: 100,
        description: 'Sets the maximum value of the slider',
      },
      start: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Slider starting value',
        default: 50,
        description: 'Sets the starting value of the slider',
      },
      step: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Step',
        default: 1,
        description: 'Sets the step of the slider'
      },
      labels: {
        type: jsPsych.plugins.parameterType.HTML_STRING,
        pretty_name:'Labels',
        default: [],
        array: true,
        description: 'Labels of the slider.',
      },
      slider_width: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name:'Slider width',
        default: null,
        description: 'Width of the slider in pixels.'
      },
      button_label: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Button label',
        default:  'Continue',
        array: false,
        description: 'Label of the button to advance.'
      },
      require_movement: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Require movement',
        default: false,
        description: 'If true, the participant will have to move the slider before continuing.'
      },
      prompt: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Prompt',
        default: null,
        description: 'Any content here will be displayed below the slider.'
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
        description: 'How long to show the trial.'
      },
      response_ends_trial: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Response ends trial',
        default: true,
        description: 'If true, trial will end when user makes a response.'
      },
    }
  }

  plugin.trial = function(display_element, trial) {

    let html ='<div id="jspsych-html-slider-response-wrapper" style="margin: 100px 0;">';
    html += '<div id="jspsych-html-slider-response-stimulus">' + trial.stimulus + '</div>';
    html += '<div class="jspsych-html-slider-response-container" style="position:relative; margin: 0 auto 3em auto; ';
    if (trial.slider_width !== null) {
      html += 'width:'+ trial.slider_width + 'px;';
    }
    html += '">';
    html +='<input id = "jspsych-html-slider-response-response" type = "range" value = "'+ trial.start + '" min = "'+ trial.min + '" max = "' + trial.max + '" step = "'+ trial.step + '" style = "width: 100%;"/>';
    html += '<div>'

    for (let j = 0; j < trial.labels.length; j++){
      let width = 100 / (trial.labels.length-1);
      let left_offset = (j * (100 /(trial.labels.length - 1))) - (width/2);
      html += '<div style = "display: inline-block; position: absolute; left:'+ left_offset +'%; text-align: center; width: '+ width +'%;">';
      html += '<span style = "text-align: center; font-size: 80%;">' + trial.labels[j] + '</span>';
      html += '</div>'
    }

    html += '</div></div></div>';

    if (trial.prompt !== null){
      html += trial.prompt;
    }

    // add submit button
    html += '<button id="jspsych-html-slider-response-next" class="jspsych-btn" '+ (trial.require_movement ? "disabled" : "") + '>' + trial.button_label + '</button>';
    if (trial.additional_prompt !== null) {
      html += '<button id="optional-response" class="jspsych-btn" style="position:absolute; left: 42.5%; top: 67%">' + trial.additional_prompt + '</button>';
    }

    display_element.innerHTML = html;

    let response = {
      rt: null,
      response: null
    };
    
    if (trial.require_movement) {
      $('#jspsych-html-slider-response-response').on('change', function(){
        display_element.querySelector('#jspsych-html-slider-response-next').disabled = false;
      })
    }

    $('#jspsych-html-slider-response-next').on('click', function() {
      // measure response time
      let endTime = performance.now();
      response.rt = endTime - startTime;
      response.response = display_element.querySelector('#jspsych-html-slider-response-response').value;

      if(trial.response_ends_trial){
        end_trial();
      } else {
        display_element.querySelector('#jspsych-html-slider-response-next').disabled = true;
      }
    });

    if (trial.additional_prompt !== null) {
      $('#optional-response').on('click', function () {
        // measure response time
        let endTime = performance.now();
        response.rt = endTime - startTime;
        response.response =
            display_element.querySelector('#jspsych-html-slider-response-response').value;

        if (trial.response_ends_trial) {
          end_trial();
        } else {
          display_element.querySelector('#jspsych-html-slider-response-next').disabled = true;
        }
      });
    }

    function end_trial(){

      jsPsych.pluginAPI.clearAllTimeouts();

      // save data
      let data = {
        "rt": response.rt,
        "response": response.response,
        "stimulus": trial.stimulus
      };

      display_element.innerHTML = '';
      jsPsych.finishTrial(data);
    }

    if (trial.stimulus_duration !== null) {
      jsPsych.pluginAPI.setTimeout(function() {
        display_element.querySelector('#jspsych-html-slider-response-stimulus').style.visibility = 'hidden';
      }, trial.stimulus_duration);
    }

    // end trial if trial_duration is set
    if (trial.trial_duration !== null) {
      jsPsych.pluginAPI.setTimeout(function() {
        end_trial();
      }, trial.trial_duration);
    }

    let startTime = performance.now();
  };

  return plugin;
})();
