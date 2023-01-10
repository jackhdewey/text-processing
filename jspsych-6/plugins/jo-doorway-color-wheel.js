/**
 * jspsych-video-button-response
 * Josh de Leeuw
 *
 * plugin for playing a video file and getting a button response
 *
 * documentation: docs.jspsych.org
 *
 **/

jsPsych.plugins["doorway-color-wheel"] = (function() {

  var plugin = {};

  jsPsych.pluginAPI.registerPreload('doorway-color-wheel', 'stimulus', 'video');

  plugin.info = {
    name: 'doorway-color-wheel',
    description: '',
    parameters: {
      sources: {
        type: jsPsych.plugins.parameterType.VIDEO,
        pretty_name: 'Video',
        default: undefined,
        description: 'The video file to play.'
      },
      test_color: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Array',
        default: [255, 0, 0],
        description: 'The test color.'
      },
      start_color: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Array',
        default: [255, 0, 0],
        description: 'The starting anchor.'
      },
      button_label: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Button label',
        default:  'Submit',
        array: false,
        description: 'Label of the button to advance.'
      },
      image_dimensions: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Width',
        default: '',
        description: 'The width of the image in pixels.'
      },
      width: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Width',
        default: '',
        description: 'The width of the video in pixels.'
      },
      height: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Height',
        default: '',
        description: 'The height of the video display in pixels.'
      },
      autoplay: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Autoplay',
        default: true,
        description: 'If true, the video will begin playing as soon as it has loaded.'
      },
      controls: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Controls',
        default: false,
        description: 'If true, the subject will be able to pause the video or move the playback to any point in the video.'
      },
      start: {
        type: jsPsych.plugins.parameterType.FLOAT,
        pretty_name: 'Start',
        default: null,
        description: 'Time to start the clip.'
      },
      stop: {
        type: jsPsych.plugins.parameterType.FLOAT,
        pretty_name: 'Stop',
        default: null,
        description: 'Time to stop the clip.'
      },
      rate: {
        type: jsPsych.plugins.parameterType.FLOAT,
        pretty_name: 'Rate',
        default: 1,
        description: 'The playback rate of the video. 1 is normal, <1 is slower, >1 is faster.'
      },
      trial_ends_after_video: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'End trial after video finishes',
        default: false,
        description: 'If true, the trial will end immediately after the video finishes playing.'
      },
      image_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Trial duration',
        default: null,
        description: 'How long to show trial before it ends.'
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
        description: 'If true, the trial will end when subject makes a response.'
      }
    }
  }

  plugin.trial = function(display_element, trial) {

    // SETUP DISPLAY ELEMENTS
    var video_html = '<div id="video-wrapper">'
    video_html += '<video id="jspsych-video-prompt-response-stimulus"';

    if(trial.width) {
      video_html += ' width="'+trial.width+'"';
    }
    if(trial.height) {
      video_html += ' height="'+trial.height+'"';
    }
    if(trial.autoplay){
      video_html += " autoplay ";
    }
    if(trial.controls){
      video_html +=" controls ";
    }
    video_html +=">";

    var video_preload_blob = jsPsych.pluginAPI.getVideoBuffer(trial.sources[0]);
    if(!video_preload_blob) {
      for(var i=0; i<trial.sources.length; i++){
        var file_name = trial.sources[i];
        if(file_name.indexOf('?') > -1){
          file_name = file_name.substring(0, file_name.indexOf('?'));
        }
        var type = file_name.substr(file_name.lastIndexOf('.') + 1);
        type = type.toLowerCase();
        video_html+='<source src="' + file_name + '" type="video/'+type+'">';
      }
    }
    video_html += "</video>";
    video_html += "</div>";
    video_html += "<div id='test-circle' style='position:absolute; top:50%; left:50%; margin-top:-50px; margin-left:-50px; width:100px; height:100px; border-radius:50%; border:1px solid #000; background-color:hsl("+trial.test_color+", 100%, 50%)'></div>"
    video_html += "<div id='color-wheel-container' style='display:none'><div id='huewheel'></div><br><div id='spot'></div><div id='info'></div><br></div>";
    video_html += '<button id="jspsych-html-slider-response-next" style="display:none; width: 300px;" class="jspsych-btn" '+ (trial.require_movement ? "disabled" : "") + '>'+trial.button_label+'</button>';
    video_html += "</div>";

    display_element.innerHTML = video_html;

    // SETUP COLOR WHEEL
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

	// SETUP VIDEO PLAYER
    if(video_preload_blob){
      display_element.querySelector('#jspsych-video-prompt-response-stimulus').src = video_preload_blob;
    }

    display_element.querySelector('#jspsych-video-prompt-response-stimulus').onended = function(){
      if(trial.trial_ends_after_video){
        end_trial();
      }
    }

    if(trial.start !== null){
      display_element.querySelector('#jspsych-video-prompt-response-stimulus').currentTime = trial.start;
    }

    // SHOW TEST COLOR
    var image_half = trial.image_dimensions/2 * -1
    var show_image = function(info) {
      setTimeout(play_vid, trial.image_duration);
    };

    if(trial.autoplay !== true){
      setTimeout(show_image, trial.image_duration);
    }

    // START PLAYING VIDEO
    var play_vid = function(info) {
      display_element.querySelector('#test-circle').setAttribute("style", "display: none;");
      display_element.querySelector('#jspsych-video-prompt-response-stimulus').play();
    };

    // STOP PLAYING VIDEO + SHOW RESPONSE
    if(trial.stop !== null){
      var start_time = performance.now();
      var keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: after_response,
        valid_responses: trial.choices,
        rt_method: 'performance',
        persist: false,
        allow_held_key: false
      });

      var display_box = false;
        display_element.querySelector('#jspsych-video-prompt-response-stimulus').addEventListener('timeupdate', function(e){
        var current_time = display_element.querySelector('#jspsych-video-prompt-response-stimulus').currentTime;
        if(current_time >= trial.stop)
        {
          display_element.querySelector('#jspsych-video-prompt-response-stimulus').pause();
          display_element.querySelector('#color-wheel-container').setAttribute("style", "display: block; position:absolute; top:50%; left:50%; margin-top:-150px; margin-left:-150px;");
          display_element.querySelector('#jspsych-html-slider-response-next').setAttribute("style", "display:block; position:absolute; top:95%; left:50%; margin-left:-40px;");
        }
      })
    }

    display_element.querySelector('#jspsych-video-prompt-response-stimulus').playbackRate = trial.rate;

    // STORE RESPONSE
    var response = {
      rt: null,
      key: null,
    };

    // END TRIAL
    function end_trial() {
      // kill any remaining setTimeout handlers
      jsPsych.pluginAPI.clearAllTimeouts();

      // gather the data to store for the trial
      var trial_data = {
        "rt": response.rt,
        "stimulus": trial.source,
        "key_pressed": response.key
      };

      // clear the display
      display_element.innerHTML = '';

      // move on to the next trial
      jsPsych.finishTrial(trial_data);
    };

    // HANDLE RESPONSES
    function after_response(choice) {

      // measure rt
      var end_time = performance.now();
      response.rt = end_time - start_time;
      response.key = choice.key;

      // after a valid response, the stimulus will have the CSS class 'responded'
      // which can be used to provide visual feedback that a response was recorded
      display_element.querySelector('#jspsych-video-prompt-response-stimulus').className += ' responded';

      // disable all the buttons after a response
      var btns = document.querySelectorAll('.jspsych-video-prompt-response-button button');
      for(var i=0; i<btns.length; i++){
        //btns[i].removeEventListener('click');
        btns[i].setAttribute('disabled', 'disabled');
      }

      if (trial.response_ends_trial) {
        end_trial();
      }
    };

    // END TRIAL AFTER LIMIT
    if (trial.trial_duration !== null) {
      jsPsych.pluginAPI.setTimeout(function() {
        end_trial();
      }, trial.trial_duration);
    }
  };

  return plugin;
})();
