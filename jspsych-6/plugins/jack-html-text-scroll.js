jsPsych.plugins["jack-html-text-scroll"] = (function() {

    var plugin = {};
  
    plugin.info = {
        name: 'jack-html-text-scroll',
        description: '',
        parameters: {
        stimulus: {
            type: jsPsych.plugins.parameterType.HTML_STRING,
            pretty_name: 'Stimulus',                
            default: undefined,
            description: 'The HTML string to be displayed'
        },

        input_text: {
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

        wait_time: {
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
          description: 'If true, trial will end when subject makes a response.'
        },
      }
    }
  
    plugin.trial = function(display_element, trial) {

        // document.addEventListener("keydown", change_color, true);
        document.addEventListener("wheel", check_mouse, true);
      
        var new_html = '<div id="jspsych-html-keyboard-response-stimulus">'+trial.stimulus+'</div>';
        
        console.log(trial.stimulus);
        console.log(trial.input_text);

        var input_text = trial.input_text;
        var sentence_list = input_text.split(". ");
        var num_sentences = sentence_list.length;

        var total_time_per_sentence = Array(num_sentences).fill(0);
        var time_to_sentence = Array(num_sentences).fill(0);
        var visits_per_sentence = Array(num_sentences).fill(0);
        var reversals_at_sentence = Array(num_sentences).fill(0);

        console.log(sentence_list);
        console.log(total_time_per_sentence);
        console.log(time_to_sentence);

        var start_time = performance.now();
        var previous_press_time = start_time;
        var current_index = 0;
        var previous_press_direction = 0;

        function change_color(evt){
            if (evt.keyCode == 40){ //down

                if (current_index < sentence_list.length - 1) {

                  previous_press_direction = 1;

                  //COLLECT PRESS TIME AND TIME SPENT AT LAST SENTENCE
                  press_time = performance.now();
                  interval = press_time - previous_press_time;

                  //INCREMENT TOTAL TIME SPENT AT LAST SENTENCE
                  total_time_per_sentence[current_index] = total_time_per_sentence[current_index] + interval;

                  //INCREMENT THE NUMBER OF VISITS TO NEXT SENTENCE
                  visits_per_sentence[current_index + 1] += 1

                  //AT FIRST VISIT, RECORD TOTAL TIME TO SENTENCE
                  if (time_to_sentence[current_index] == 0){
                      time_to_sentence[current_index] = press_time - start_time;
                  }
                
                  //CHANGE SENTENCE COLORS
                  current_id = "#s" + current_index;
                  next_id = "#s" + (current_index + 1);
                  display_element.querySelector(current_id).setAttribute("style", "color: grey;");
                  display_element.querySelector(next_id).setAttribute("style", "color: black;");
    
                  //INCREMENT CURRENT_INDEX AND SET PREVIOUS_PRESS TO MOST RECENT PRESS TIME
                  current_index += 1;
                  previous_press = press_time;
                }
            }

            if (evt.keyCode == 38){ //up
                
                if (current_index > 0) {

                  if (previous_press_direction == 1){
                    reversals_at_sentence[current_index] += 1;
                  }
                  previous_press_direction = 0;

                  //COLLECT VARIABLES
                  press_time = performance.now();
                  interval = press_time - previous_press_time; 
                  
                  //INCREMENT TOTAL TIME SPENT AT LAST SENTENCE
                  total_time_per_sentence[current_index] = total_time_per_sentence[current_index] + interval;

                  //INCREMENT THE NUMBER OF VISITS TO NEXT SENTENCE
                  visits_per_sentence[current_index - 1] += 1

                  //CHANGES SENTENCE COLORS
                  current_id = "#s" + current_index;
                  previous_id = "#s" + (current_index - 1);
                  display_element.querySelector(current_id).setAttribute("style", "color: grey;");
                  display_element.querySelector(previous_id).setAttribute("style", "color: black;");

                  //Decrements current_index and sets previous_press to the most recent press time
                  current_index -= 1;
                  previous_press = press_time;

                }
            }
      }

    var time_of_scroll = [];
    var amount_of_scroll = [];
    var type_of_scroll = [];

    function check_mouse(evt){
        if (evt.deltaY < 0) {
          console.log('scrolling up');
          type_of_scroll.push("up");
        }
        else if (evt.deltaY > 0) {
          console.log('scrolling down');
          type_of_scroll.push("down");
        }
        amount_of_scroll.push(evt.deltaY);
        console.log(evt.deltaY);

        scroll_time = performance.now() - start_time;
        time_of_scroll.push(scroll_time);
    }

    // add prompt
    if(trial.prompt !== null){
        new_html += trial.prompt;
    }
  
    // draw
    display_element.innerHTML = new_html;
  
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
//        var trial_data = {
//          "rt": response.rt,
//          "stimulus": trial.stimulus,
//          "key_press": response.key,
//          "total_time_per_sentence": total_time_per_sentence,
//          "time_to_sentence": time_to_sentence,
//          "visits_per_sentence": visits_per_sentence,
//          "reversals_at_sentence": reversals_at_sentence
//        };

        var trial_data = {
          "rt": response.rt,
          "stimulus": trial.stimulus,
          "key_press": response.key,
          "time_of_scroll": time_of_scroll,
          "amount_of_scroll": amount_of_scroll,
          "type_of_scroll": type_of_scroll,
          "num_scroll": time_of_scroll.length
        };

        // clear the display
        display_element.innerHTML = '';
  
        // move on to the next trial
        jsPsych.finishTrial(trial_data);
      };
  
      // function to handle responses by the subject
      var after_response = function(info) {
  
        // after a valid response, the stimulus will have the CSS class 'responded'
        // which can be used to provide visual feedback that a response was recorded
        display_element.querySelector('#jspsych-html-keyboard-response-stimulus').className += ' responded';
  
        // only record the first response
        if (response.key == null) {
          response = info;
        }
        
        console.log(response.key);

        if (response.key == 81) {
          end_trial();
        }
      };
  
      // start the response listener
      if (trial.choices != jsPsych.NO_KEYS) {

        // add wait time before person can proceed
        setTimeout(function(){
            display_element.querySelector('#exit_prompt').innerHTML = 'Press Q to continue.';
            display_element.querySelector('#exit_prompt').setAttribute("style", "black");
            var keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
              callback_function: after_response,
              valid_responses: trial.choices,
              rt_method: 'performance',
              persist: false,
              allow_held_key: false
            });
        }, trial.wait_time)
  
      }
  
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
  