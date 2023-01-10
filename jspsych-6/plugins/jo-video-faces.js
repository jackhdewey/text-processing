/**
 * jspsych-video-keyboard-response
 * Josh de Leeuw
 *
 * plugin for playing a video file and getting a keyboard response
 *
 * documentation: docs.jspsych.org
 *
 **/

jsPsych.plugins["video-faces"] = (function() {

  var plugin = {};

  jsPsych.pluginAPI.registerPreload('video-faces', 'stimulus', 'video');

  plugin.info = {
    name: 'video-faces',
    description: '',
    parameters: {
      sources: {
        type: jsPsych.plugins.parameterType.VIDEO,
        pretty_name: 'Video',
        default: undefined,
        description: 'The video file to play.'
      },
      face_list: {
        pretty_name: 'Faces',
        default: [],
        description: 'The faces to show.'
      },
      image_dimensions: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Width',
        default: 100,
        description: 'The width of the video in pixels.'
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
      rate: {
        type: jsPsych.plugins.parameterType.FLOAT,
        pretty_name: 'Rate',
        default: 1,
        description: 'The playback rate of the video. 1 is normal, <1 is slower, >1 is faster.'
      },
      start: {
        type: jsPsych.plugins.parameterType.FLOAT,
        pretty_name: 'Start',
        default: null,
        description: 'Time to start the clip.'
      },
      trial_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Trial duration',
        default: 17000,
        description: 'How long to show trial before it ends.'
      },
    }
  }

  plugin.trial = function(display_element, trial) {

    // setup stimulus
    var video_html = '<div>'
    video_html += '<video id="jspsych-video-keyboard-response-stimulus"';

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
    video_html += "<div id='face_img_1' style='display:none'><img src='"+trial.face_list[0]+"' width='"+trial.image_dimensions+"' height='"+trial.image_dimensions+"'></img></div>";
    video_html += "<div id='face_img_2' style='display:none'><img src='"+trial.face_list[1]+"' width='"+trial.image_dimensions+"' height='"+trial.image_dimensions+"'></img></div>";
    video_html += "<div id='face_img_3' style='display:none'><img src='"+trial.face_list[2]+"' width='"+trial.image_dimensions+"' height='"+trial.image_dimensions+"'></img></div>";
    video_html += "<div id='face_img_4' style='display:none'><img src='"+trial.face_list[3]+"' width='"+trial.image_dimensions+"' height='"+trial.image_dimensions+"'></img></div>";
    video_html += "<div id='face_img_5' style='display:none'><img src='"+trial.face_list[4]+"' width='"+trial.image_dimensions+"' height='"+trial.image_dimensions+"'></img></div>";
    video_html += "<div id='face_img_6' style='display:none'><img src='"+trial.face_list[5]+"' width='"+trial.image_dimensions+"' height='"+trial.image_dimensions+"'></img></div>";
    video_html += "<div id='face_img_7' style='display:none'><img src='"+trial.face_list[6]+"' width='"+trial.image_dimensions+"' height='"+trial.image_dimensions+"'></img></div>";
    video_html += "<div id='face_img_8' style='display:none'><img src='"+trial.face_list[7]+"' width='"+trial.image_dimensions+"' height='"+trial.image_dimensions+"'></img></div>";
    video_html += "<div id='face_img_9' style='display:none'><img src='"+trial.face_list[8]+"' width='"+trial.image_dimensions+"' height='"+trial.image_dimensions+"'></img></div>";

    // add prompt if there is one
    if (trial.prompt !== null) {
      video_html += trial.prompt;
    }

    display_element.innerHTML = video_html;

    if(video_preload_blob){
      display_element.querySelector('#jspsych-video-keyboard-response-stimulus').src = video_preload_blob;
    }

    if(trial.start !== null){
      display_element.querySelector('#jspsych-video-keyboard-response-stimulus').currentTime = trial.start;
    }

    var image_half = trial.image_dimensions/2*-1;
    var show_set_1 = 0;
    var show_set_2 = 0;
    var show_set_3 = 0;
    var face_time = 850; //950;
    var interval_time = 150; //100;

    display_element.querySelector('#jspsych-video-keyboard-response-stimulus').play()
    display_element.querySelector('#jspsych-video-keyboard-response-stimulus').addEventListener('timeupdate', function(e){
      var currenttime = display_element.querySelector('#jspsych-video-keyboard-response-stimulus').currentTime;
      if (currenttime>=1){
        if (show_set_1==0){
          display_element.querySelector('#jspsych-video-keyboard-response-stimulus').pause();
          setTimeout(function(){
              display_element.querySelector('#face_img_1').setAttribute("style", "display: block; position: absolute; top: 50%; left: 50%; margin-left: "+image_half+"px");
              setTimeout(function(){
                display_element.querySelector('#face_img_1').setAttribute("style", "display: none");
                setTimeout(function(){
              display_element.querySelector('#face_img_2').setAttribute("style", "display: block; position: absolute; top: 50%; left: 50%; margin-left: "+image_half+"px");
                  setTimeout(function(){
                    display_element.querySelector('#face_img_2').setAttribute("style", "display: none");
                    setTimeout(function(){
              display_element.querySelector('#face_img_3').setAttribute("style", "display: block; position: absolute; top: 50%; left: 50%; margin-left: "+image_half+"px");
                      setTimeout(function(){
                        display_element.querySelector('#face_img_3').setAttribute("style", "display: none");
                        setTimeout(function(){
                          display_element.querySelector('#jspsych-video-keyboard-response-stimulus').play();
                          show_set_1 = 1;
                        }, interval_time)
                      }, face_time)
                    }, interval_time)
                  }, face_time)
                }, interval_time)
              }, face_time)
            }, interval_time);
        }
      }
      if (currenttime>=7){
        if (show_set_2==0){
          display_element.querySelector('#jspsych-video-keyboard-response-stimulus').pause();
          setTimeout(function(){
              display_element.querySelector('#face_img_4').setAttribute("style", "display: block; position: absolute; top: 50%; left: 50%; margin-left: "+image_half+"px");
              setTimeout(function(){
                display_element.querySelector('#face_img_4').setAttribute("style", "display: none");
                setTimeout(function(){
              display_element.querySelector('#face_img_5').setAttribute("style", "display: block; position: absolute; top: 50%; left: 50%; margin-left: "+image_half+"px");
                  setTimeout(function(){
                    display_element.querySelector('#face_img_5').setAttribute("style", "display: none");
                    setTimeout(function(){
              display_element.querySelector('#face_img_6').setAttribute("style", "display: block; position: absolute; top: 50%; left: 50%; margin-left: "+image_half+"px");
                      setTimeout(function(){
                        display_element.querySelector('#face_img_6').setAttribute("style", "display: none");
                        setTimeout(function(){
                          display_element.querySelector('#jspsych-video-keyboard-response-stimulus').play();
                          show_set_2 = 1;
                        }, interval_time)
                      }, face_time)
                    }, interval_time)
                  }, face_time)
                }, interval_time)
              }, face_time)
            }, interval_time);
        }
      }
      if (currenttime>=13){
        if (show_set_3==0){
          display_element.querySelector('#jspsych-video-keyboard-response-stimulus').pause();
          setTimeout(function(){
              display_element.querySelector('#face_img_7').setAttribute("style", "display: block; position: absolute; top: 50%; left: 50%; margin-left: "+image_half+"px");
              setTimeout(function(){
                display_element.querySelector('#face_img_7').setAttribute("style", "display: none");
                setTimeout(function(){
              display_element.querySelector('#face_img_8').setAttribute("style", "display: block; position: absolute; top: 50%; left: 50%; margin-left: "+image_half+"px");
                  setTimeout(function(){
                    display_element.querySelector('#face_img_8').setAttribute("style", "display: none");
                    setTimeout(function(){
              display_element.querySelector('#face_img_9').setAttribute("style", "display: block; position: absolute; top: 50%; left: 50%; margin-left: "+image_half+"px");
                      setTimeout(function(){
                        display_element.querySelector('#face_img_9').setAttribute("style", "display: none");
                        setTimeout(function(){
                          show_set_3 = 1;
                        }, interval_time)
                      }, face_time)
                    }, interval_time)
                  }, face_time)
                }, interval_time)
              }, face_time)
            }, interval_time);
        }
      }
    })

    if (trial.trial_duration !== null) {
      jsPsych.pluginAPI.setTimeout(function() {
        end_trial();
      }, trial.trial_duration);
    }

    display_element.querySelector('#jspsych-video-keyboard-response-stimulus').playbackRate = trial.rate;

    // function to end trial when it is time
    function end_trial() {
      // kill any remaining setTimeout handlers
      jsPsych.pluginAPI.clearAllTimeouts();

      // gather the data to store for the trial
      var trial_data = {
        "stimulus": trial.sources
      };

      // clear the display
      display_element.innerHTML = '';

      // move on to the next trial
      jsPsych.finishTrial(trial_data);
    };
  };
  return plugin;
})();
