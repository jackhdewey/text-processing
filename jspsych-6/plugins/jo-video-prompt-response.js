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
      image: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Image',
        default: undefined,
        description: 'The image to show.'
      },
      image_name: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Image name',
        default: undefined,
        description: 'The name of the item.'
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
    video_html += "<div id='jspsych-video-start-wrapper' style='display:block; border-radius: 4px; padding: 10px 10px 20px 20px; background-color: white; width: 600px; height: 380px; position: absolute; top: 10%'><p>In this experiment, you will watch an animation, where you will be situated in the room in the background.  In the animation, the scene will gradually change, as if you were virtually walking through the room.  At the end of the animation, you will be asked a question about an item in the room.</p><p>Throughout the animation, you will not have any particular task, but we nevertheless want you to pay attention.  <strong>Just try your best to situate yourself in the room, as if you were actually walking through it.</strong>  Your data will only be useful to us if you do!</p><p><strong>Press the ENTER key to play the animation.</strong></p></div>";
    video_html += "<div id='jspsych-video-prompt-wrapper' style='display:none;'></div>";
    video_html += "<div id='jspsych-video-box-wrapper' style='display:none;'></div>";
    video_html += "</div>";

    //display buttons
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

    display_element.innerHTML = video_html;

    var inner_video_html = '';
    inner_video_html += '<p id="text_prompt">Now imagine that you had the opportunity to purchase the headset you see on the table.  <strong>What is the maximum amount in US dollars that you would be willing to pay for this headset?</strong><br>Input the amount in the box below.<br></p>' + '<input id="img_payment" name="img_payment" type="number" min="5" max="99" style="width: 20%; border-radius: 4px; padding: 10px 10px; margin: 8px 0; border: 1px solid #ccc; font-size: 20px" ></p><div id="jspsych-video-prompt-response-btngroup">';
//    inner_video_html += '<div style="width: 600px; height:500px"><p id="text_prompt"><strong>What is the maximum amount you would be willing to pay for the item below?</strong><br>Input a number in the box below.<br></p><div><p>'+trial.image_name+'</p><img class="random_image" src="'+trial.image+'" style="object-fit:cover; max-width:200px; max-height: 200px;"></div><input id="img_payment" name="img_payment" type="number" min="15" max="99" style="width: 20%; border-radius: 4px; padding: 10px 10px; margin: 8px 0; border: 1px solid #ccc; font-size: 20px" ></p><div id="jspsych-video-prompt-response-btngroup">';
    for (var i = 0; i < trial.choices.length; i++) {
      var str = buttons[i].replace(/%choice%/g, trial.choices[i]);
      inner_video_html += '<div class="jspsych-video-button-response-button" style="display: inline-block; margin:'+trial.margin_vertical+' '+trial.margin_horizontal+'" id="jspsych-video-button-response-button-' + i +'" data-choice="'+i+'">'+str+'</div>';
    }

    // add prompt if there is one
    if (trial.prompt !== null) {
      inner_video_html += trial.prompt;
    }

    var start_time = performance.now();

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

    var play_vid = function(info) {
      display_element.querySelector('#jspsych-video-start-wrapper').setAttribute("style", "display: none;");
      display_element.querySelector('#jspsych-video-prompt-response-stimulus').play();
    };

    if(trial.autoplay !== true){
      var keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: play_vid,
        valid_responses: ['enter'],
        rt_method: 'performance',
        persist: false,
        allow_held_key: false
      });
    }

    if(trial.stop !== null){
      var display_box = false;
      display_element.querySelector('#jspsych-video-prompt-response-stimulus').addEventListener('timeupdate', function(e){
        var currenttime = display_element.querySelector('#jspsych-video-prompt-response-stimulus').currentTime;
        if(currenttime >= trial.stop)
        {
          display_element.querySelector('#jspsych-video-prompt-response-stimulus').pause();
            // display_element.innerHTML += inner_video_html;
              if(display_box == false)
              {
                var box = display_element.querySelector("#jspsych-video-prompt-wrapper");
                var box2 = display_element.querySelector("#jspsych-video-box-wrapper");
                box.innerHTML = inner_video_html;
                //box2.innerHTML = "<div class='container' style='border:5px solid #000; width: 90px; height: 90px;'></div>";
                box.setAttribute("style", "display: block; width: 600px; height: 300px; position: absolute; left: 45%");
                //box2.setAttribute("style", "display: block; width: 50px; height: 50px; position: absolute; top: 56%; left: 6%");

                  // add event listeners to buttons
                    for (var i = 0; i < trial.choices.length; i++) {
                      display_element.querySelector('#jspsych-video-button-response-button-' + i).addEventListener('click', function(e){
                        var choice = e.currentTarget.getAttribute('data-choice'); // don't use dataset for jsdom compatibility
                        after_response(choice);
                      });
                    }
                display_box = true;
              }
            }
          })
        }

    display_element.querySelector('#jspsych-video-prompt-response-stimulus').playbackRate = trial.rate;

    // store response
    var response = {
      rt: null,
      button: null,
    };

    // function to end trial when it is time
    function end_trial() {

      console.log(display_element.querySelector('#img_payment').value);
      if (display_element.querySelector('#img_payment').value.length == 0)
      {
         change_text = display_element.querySelector('#text_prompt');
         change_text.setAttribute("style", "color: red;");
      } else {
          // kill any remaining setTimeout handlers
          jsPsych.pluginAPI.clearAllTimeouts();

          // gather the data to store for the trial
          var trial_data = {
            "rt": response.rt,
            "stimulus": trial.source,
            "button_pressed": response.button,
            "response_value": display_element.querySelector('#img_payment').value
          };

          // clear the display
          display_element.innerHTML = '';

          // move on to the next trial
          jsPsych.finishTrial(trial_data)};
    };

    // function to handle responses by the subject
    function after_response(choice) {

      // measure rt
      var end_time = performance.now();
      var rt = end_time - start_time;
      response.button = choice;
      response.rt = rt;

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
