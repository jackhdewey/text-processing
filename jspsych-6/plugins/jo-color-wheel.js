/**
 * jspsych-html-slider-response
 * a jspsych plugin for free response survey questions
 *
 * Josh de Leeuw
 *
 * documentation: docs.jspsych.org
 *
 */


jsPsych.plugins['color-wheel-response'] = (function() {

  var plugin = {};

  plugin.info = {
    name: 'color-wheel-response',
    description: '',
    parameters: {
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
      button_label: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Button label',
        default:  'Submit',
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
    var html = '<div id="container"><div id="huewheel"></div><br>';
    html += '<div id="spot"></div><div id="info"></div><br></div>';

    // add submit button
    html += '<button id="jspsych-html-slider-response-next" class="jspsych-btn" '+ (trial.require_movement ? "disabled" : "") + '>'+trial.button_label+'</button>';

    display_element.innerHTML = html;

	var spot = document.getElementById('spot'),
		info = document.getElementById('info'),
        hw = new HueWheel('huewheel', {
			onChange:				update,
			saturation:				1.0,
			lightness:				0.5,
			colorSpace:				'hsl',

			diameter:				300,
			shadowBlur:				7,
			changeSaturation:		false,
			changeLightness:		false,
			showColor:				true,
			colorSpotWidth:			0.7,
			colorSpotBorder:		1,
			colorSpotBorderColor:	'#333',
			quality:				2,

			hueKnobSize:			0.12,
			hueKnobColor:			'#ffc',
			lightKnobColor:			'#ff0',
			hueKnobColorSelected:	'#fff',
			hueKnobShadow:			true,
			lightnessKnobColorSelected:	'#f00',
			lightnessRingClickable:	false,

			useKeys:				true,
			hueKeyDelta:			2,
			saturationKeyDelta:		1,
			lightnessKeyDelta:		1,
			shiftKeyFactor:			10
		});

	function update(e) {
		info.innerHTML = 'H: ' + e.h.toFixed(0) + ' S:' + e.s.toFixed(2) + ' L:' + e.l.toFixed(2) +
						 ' R:' + e.r + ' G:' + e.g + ' B:' + e.b;
		spot.style.backgroundColor = 'rgb(' + e.r + ',' + e.g + ',' + e.b + ')';
	}

    var response = {
      rt: null,
      response: null
    };

    display_element.querySelector('#jspsych-html-slider-response-next').addEventListener('click', function() {
      // measure response time
      var endTime = performance.now();
      response.rt = endTime - startTime;
      response.response = display_element.querySelector('#jspsych-html-slider-response-response').value;

      if(trial.response_ends_trial){
        end_trial();
      } else {
        display_element.querySelector('#jspsych-html-slider-response-next').disabled = true;
      }

    });

    function end_trial(){

      jsPsych.pluginAPI.clearAllTimeouts();

      // save data
      var trialdata = {
        "rt": response.rt,
        "response": response.response,
        "stimulus": trial.stimulus
      };

      display_element.innerHTML = '';

      // next trial
      jsPsych.finishTrial(trialdata);
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

    var startTime = performance.now();
  };

  return plugin;
})();
