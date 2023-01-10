/**
 * jspsych-video-button-response
 * Josh de Leeuw
 *
 * plugin for playing a video file and getting a button response
 *
 * documentation: docs.jspsych.org
 *
 **/

jsPsych.plugins["video-doorway-response"] = (function() {

  var plugin = {};

  jsPsych.pluginAPI.registerPreload('video-doorway-response', 'stimulus', 'video');

  plugin.info = {
    name: 'video-doorway-response',
    description: '',
    parameters: {
      sources: {
        type: jsPsych.plugins.parameterType.VIDEO,
        pretty_name: 'Video',
        default: undefined,
        description: 'The video file to play.'
      },
      test_image: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Image',
        default: undefined,
        description: 'The image to show.'
      },
      foil_images: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Image',
        default: undefined,
        description: 'The image to show.'
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

    // setup stimulus
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
    video_html += "<div id='test-image-wrapper' style='display:none'><img src='"+trial.test_image+"' width='"+trial.image_dimensions+"' height='"+trial.image_dimensions+"'></img></div>";

    var foil_dim = trial.image_dimensions;
    video_html += "<div id='foil-1' style='display:none'><img src='"+trial.foil_images[0]+"' width="+foil_dim+"px height="+foil_dim+"px></img><br><br><span style='background-color:white; font-size: 30px; padding: 5px; border-radius: 2px'>1</span></div>";
    video_html += "<div id='foil-2' style='display:none'><img src='"+trial.foil_images[1]+"' width="+foil_dim+"px height="+foil_dim+"px></img><br><br><span style='background-color:white; font-size: 30px; padding: 5px; border-radius: 2px'>2</span></div>";
    video_html += "<div id='foil-3' style='display:none'><img src='"+trial.foil_images[2]+"' width="+foil_dim+"px height="+foil_dim+"px></img><br><br><span style='background-color:white; font-size: 30px; padding: 5px; border-radius: 2px'>3</span></div>";
    video_html += "<div id='foil-4' style='display:none'><img src='"+trial.foil_images[3]+"' width="+foil_dim+"px height="+foil_dim+"px></img><br><br><span style='background-color:white; font-size: 30px; padding: 5px; border-radius: 2px'>4 </span></div>";
    video_html += "<div id='foil-5' style='display:none'><img src='"+trial.foil_images[4]+"' width="+foil_dim+"px height="+foil_dim+"px></img><br><br><span style='background-color:white; font-size: 30px; padding: 5px; border-radius: 2px'>5</span></div>";
    video_html += "<div id='foil-6' style='display:none'><img src='"+trial.foil_images[5]+"' width="+foil_dim+"px height="+foil_dim+"px></img><br><br><span style='background-color:white; font-size: 30px; padding: 5px; border-radius: 2px'>6</span></div>";
    video_html += "</div>";

    display_element.innerHTML = video_html;

    // add prompt if there is one
    if (trial.prompt !== null) {
      inner_video_html += trial.prompt;
    }

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
       console.log(3);
    }

    var image_half = trial.image_dimensions/2 * -1
    var show_image = function(info) {
      display_element.querySelector('#test-image-wrapper').setAttribute("style", "display: block; position: absolute; top: 50%; left: 50%; margin-top: "+image_half+"px; margin-left: "+image_half+"px");
      setTimeout(play_vid, trial.image_duration);
    };

    var play_vid = function(info) {
      display_element.querySelector('#test-image-wrapper').setAttribute("style", "display: none;");
      display_element.querySelector('#jspsych-video-prompt-response-stimulus').play();
    };

    if(trial.autoplay !== true){
      setTimeout(show_image, 1000);
    }

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
        var currenttime = display_element.querySelector('#jspsych-video-prompt-response-stimulus').currentTime;
        if(currenttime >= trial.stop)
        {
          display_element.querySelector('#jspsych-video-prompt-response-stimulus').pause();
          display_element.querySelector('#foil-1').setAttribute("style", "display: block; position: absolute; top: 10%; left: 25%; margin-left: "+image_half+"px");
          display_element.querySelector('#foil-2').setAttribute("style", "display: block; position: absolute; top: 10%; left: 50%; margin-left: "+image_half+"px");
          display_element.querySelector('#foil-3').setAttribute("style", "display: block; position: absolute; top: 10%; left: 75%; margin-left: "+image_half+"px");
          display_element.querySelector('#foil-4').setAttribute("style", "display: block; position: absolute; top: 50%; left: 25%; margin-left: "+image_half+"px");
          display_element.querySelector('#foil-5').setAttribute("style", "display: block; position: absolute; top: 50%; left: 50%; margin-left: "+image_half+"px");
          display_element.querySelector('#foil-6').setAttribute("style", "display: block; position: absolute; top: 50%; left: 75%; margin-left: "+image_half+"px");
        }
      })
    }

    display_element.querySelector('#jspsych-video-prompt-response-stimulus').playbackRate = trial.rate;

    // store response
    var response = {
      rt: null,
      key: null,
    };

    // function to end trial when it is time
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

    // function to handle responses by the subject
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

    // end trial if time limit is set
    if (trial.trial_duration !== null) {
      jsPsych.pluginAPI.setTimeout(function() {
        end_trial();
      }, trial.trial_duration);
    }
  };

  return plugin;
})();
