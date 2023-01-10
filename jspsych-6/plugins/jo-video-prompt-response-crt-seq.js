/**
 * jspsych-video-button-response
 * Josh de Leeuw
 *
 * plugin for playing a video file and getting a button response
 *
 * documentation: docs.jspsych.org
 *
 **/

jsPsych.plugins["video-prompt-response"] = (function() {

  var plugin = {};

  jsPsych.pluginAPI.registerPreload('video-prompt-response', 'stimulus', 'video');

  plugin.info = {
    name: 'video-prompt-response',
    description: '',
    parameters: {
      sources: {
        type: jsPsych.plugins.parameterType.VIDEO,
        pretty_name: 'Video',
        default: undefined,
        description: 'The video file to play.'
      },
      instruction1: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Instructions',
        default: undefined,
        description: 'The prompt introducing the task.'
      },
      instruction2: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Instructions',
        default: undefined,
        description: 'The prompt introducing the task.'
      },
      choices: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Choices',
        default: undefined,
        array: true,
        description: 'The labels for the buttons.'
      },
      button_html: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Button HTML',
        default: '<button class="jspsych-btn">%choice%</button>',
        array: true,
        description: 'The html of the button. Can create own style.'
      },
      prompt: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Prompt',
        default: null,
        description: 'Any content here will be displayed below the buttons.'
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
      trial_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Trial duration',
        default: null,
        description: 'How long to show trial before it ends.'
      },
      margin_vertical: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Margin vertical',
        default: '0px',
        description: 'The vertical margin of the button.'
      },
      margin_horizontal: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Margin horizontal',
        default: '8px',
        description: 'The horizontal margin of the button.'
      },
      response_ends_trial: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Response ends trial',
        default: true,
        description: 'If true, the trial will end when subject makes a response.'
      },
      box_dims: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Choices',
        default: undefined,
        array: true,
        description: 'Dimensions for prompt.'
      },
    }
  }

  plugin.trial = function(display_element, trial) {

    // VIDEO
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

    // INSTRUCTIONS
    video_html += trial.prompt;

    // VALUATION JUDGEMENT
    video_html += "<div id='jspsych-video-prompt-filler' style='display:none;'>" + trial.instruction1 + '<span id="displayError" style="color:red"></span><div id="jspsych-video-prompt-response-btngroup"><button id="jspsych-video-button-response-button-submit" type="button" style="display: inline-block; margin:'+trial.margin_vertical+' '+trial.margin_horizontal+'">NEXT</button></form></div></div>';
    video_html += "<div id='jspsych-video-prompt-question' style='display:none;'>" + trial.instruction2 + '<span id="displayError" style="color:red"></span><div id="jspsych-video-prompt-response-btngroup"><button id="jspsych-video-button-response-button-question" type="button" style="display: inline-block; margin:'+trial.margin_vertical+' '+trial.margin_horizontal+'">NEXT</button></form></div></div>';

    video_html += "</div>";

    var buttons = [];
    if (Array.isArray(trial.button_html)) {
      if (trial.button_html.length == trial.choices.length) {
        buttons = trial.button_html;
      } else {
        console.error('Error in video-prompt-response plugin. The length of the button_html array does not equal the length of the choices array');
      }
    } else {
      for (var i = 0; i < trial.choices.length; i++) {
        buttons.push(trial.button_html);
      }
    }

    // DISPLAY START
    display_element.innerHTML = video_html;
    var start_time = performance.now();
    if(video_preload_blob){
      display_element.querySelector('#jspsych-video-prompt-response-stimulus').src = video_preload_blob;
    }
    if(trial.start !== null){
      display_element.querySelector('#jspsych-video-prompt-response-stimulus').currentTime = trial.start;
    }
    var play_vid = function(e) {
      if (e.key=='Enter'){
        document.removeEventListener("keypress", play_vid);
        document.documentElement.style.cursor = 'none';
        display_element.querySelector('#jspsych-video-start-wrapper').setAttribute("style", "display: none;");
        display_element.querySelector('#jspsych-video-prompt-response-stimulus').play();
      }
    };
    if(trial.autoplay !== true){
        setTimeout(function(){
            display_element.querySelector('#start-key').setAttribute("style", "color: black");
            document.addEventListener("keypress", play_vid);
        }, 5000);
    }

    document.body.exitPointerLock = document.body.exitPointerLock || document.body.mozExitPointerLock;

    var disable_enter = function(e){
        if (e.key=='Enter'){
            e.preventDefault();
        }
    }

    // DISPLAY JUDGEMENT
    if(trial.stop !== null){
      var display_box = false;
      display_element.querySelector('#jspsych-video-prompt-response-stimulus').addEventListener('timeupdate', function(e){
        var currenttime = display_element.querySelector('#jspsych-video-prompt-response-stimulus').currentTime;
        if(currenttime >= trial.stop)
        {
          display_element.querySelector('#jspsych-video-prompt-response-stimulus').pause();
          document.addEventListener("keypress", disable_enter);
          document.documentElement.style.cursor = 'auto';
              if(display_box == false)
              {
                left_align = screen.width/2 - 425;
                display_element.querySelector("#jspsych-video-prompt-filler").setAttribute("style", "display: block; width: "+trial.box_dims[0]+"; height: 250px; opacity:0.9; border-radius: 4px; padding: 10px 10px 20px 20px; background-color: white; position: absolute; top: 15%; left: "+left_align+"px");
                display_element.querySelector('#jspsych-video-button-response-button-submit').addEventListener('click', function(e){
                    if (display_element.querySelector('#filler').value <= 0){
                        display_element.querySelector('#displayError').innerHTML = 'For question 1, please input a number.'
                    } else if (display_element.querySelector('#filler').value.length != 0){
                        after_response();
                    }
                });
                display_box = true;
              }
            }
          })
        }

    display_element.querySelector('#jspsych-video-prompt-response-stimulus').playbackRate = trial.rate;

    // store response
    var response = {
      rt1: null,
      rt2: null,
      button: null,
    };

    // function to handle responses by the subject
    function after_response() {
      var end_time = performance.now();
      var rt = end_time - start_time;
      response.rt1 = rt;
      display_element.querySelector('#jspsych-video-prompt-response-stimulus').className += ' responded';

      start_time = performance.now();
      left_align = screen.width/2 - 425;
      display_element.querySelector("#jspsych-video-prompt-filler").setAttribute("style", "display: none");
      display_element.querySelector("#jspsych-video-prompt-question").setAttribute("style", "display: block; width: "+trial.box_dims[0]+"; height: 250px; opacity:0.9; border-radius: 4px; padding: 10px 10px 20px 20px; background-color: white; position: absolute; top: 15%; left: "+left_align+"px");

      display_element.querySelector('#jspsych-video-button-response-button-question').addEventListener('click', function(e){
        if (display_element.querySelector('#crt').value.length !== 0){
            document.removeEventListener("keypress", disable_enter);
            end_trial();
        } else { display_element.querySelector('#displayErrorMemory').innerHTML = 'Please answer the question.'}
      });
    };

    // function to end trial when it is time
    function end_trial() {
      // kill any remaining setTimeout handlers
      jsPsych.pluginAPI.clearAllTimeouts();

      response.rt2 = performance.now() - start_time;

      // gather the data to store for the trial
      var trial_data = {
        "rt1": response.rt1,
        "rt2": response.rt2,
        "stimulus": trial.source,
        "button_pressed": response.button,
        "filler_value": display_element.querySelector('#filler').value,
        "crt_value": display_element.querySelector('#crt').value
      };

      // clear the display
      display_element.innerHTML = '';

      // move on to the next trial
      jsPsych.finishTrial(trial_data);
    };

    // end trial if time limit is set
    if (trial.trial_duration !== null) {
      jsPsych.pluginAPI.setTimeout(function() {
        end_trial();
      }, trial.trial_duration);
    }
  };

  return plugin;
})();
