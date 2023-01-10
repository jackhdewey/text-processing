/*
 * Example plugin template
 */

jsPsych.plugins["jo-pest-contrast"] = (function() {

  var plugin = {};

  plugin.info = {
    name: "jo-pest-contrast",
    parameters: {
      change_time: {
        type: jsPsych.plugins.parameterType.INT,
        default: 1
      },
      volume_change: {
        type: jsPsych.plugins.parameterType.INT,
        default: 6
      },
      rhythm: {
        type: jsPsych.plugins.parameterType.OBJECT,
        default: []
      },
      condition: {
        type: jsPsych.plugins.parameterType.STRING,
        default: 'match'
      },
      imagery_condition: {
        type: jsPsych.plugins.parameterType.STRING,
        default: 'imagery'
      },
      section: {
        type: jsPsych.plugins.parameterType.STRING,
        default: 'imagery'
      }
    }
  }

  plugin.trial = function(display_element, trial) {

    display_element.innerHTML = '<div id="begin"><p>Press SPACE to hear the beats.</p></div><div id="countdown"></div>';
    display_element.innerHTML += "<div id='sound_icon' style='display: none'><img width=40% src='images/soundIcon.png'></img></div>";

    var standard_volume = 4;
    var new_volume = standard_volume + trial.volume_change;
//    var volume_inc = trial.volume_change/2;
    var timer = 0;

    var change_rhythm = trial.rhythm;
    synth_beat.toDestination();

    document.addEventListener("keydown", play_note, true);

    console.log(change_rhythm, trial.change_time)
    var timeleft = 3;
    function play_note(evt){
        var s=0;
        if (evt.keyCode == 32){
            document.removeEventListener('keydown', play_note, true);
            var downloadTimer = setInterval(function(){
              if (timeleft <= 0){
                clearInterval(downloadTimer);
                document.getElementById("countdown").innerHTML = "Playing...";
                var note_loop = setInterval(function(){
                    if (trial.change_time==1){
                        if (s<=7){
                            synth_beat.volume.value = standard_volume;
                            synth_beat.triggerAttackRelease('A0', '2n');
//                        } else if (s==6 || s==7){
//                            new_volume += volume_inc;
//                            synth_beat.volume.value = new_volume;
//                            synth_beat.triggerAttackRelease('C1', '2n');
//                            console.log(new_volume);
                        } else if (s>15){
                            synth_beat.volume.value = standard_volume;
                            synth_beat.triggerAttackRelease('A0', '2n');
                        } else {
                            if (change_rhythm[s]==1){
                                synth_beat.volume.value = new_volume;
                                synth_beat.triggerAttackRelease('A0', '2n');
                            } else {
                                synth_beat.volume.value = standard_volume;
                                synth_beat.triggerAttackRelease('A0', '2n');
                            }
                        }
                    } else if (trial.change_time==2){
                        if (s<=15){
                            synth_beat.volume.value = standard_volume;
                            synth_beat.triggerAttackRelease('A0', '2n');
//                        } else if (s==14 || s==15){
//                            new_volume += volume_inc;
//                            synth_beat.volume.value = new_volume;
//                            synth_beat.triggerAttackRelease('C1', '2n');
                        } else {
                            if (change_rhythm[s]==1){
                                synth_beat.volume.value = new_volume;
                                synth_beat.triggerAttackRelease('A0', '2n');
                            } else {
                                synth_beat.volume.value = standard_volume;
                                synth_beat.triggerAttackRelease('A0', '2n');
                            }
                        }
                    } else if (trial.change_time==0){
                        synth_beat.volume.value = standard_volume;
                        synth_beat.triggerAttackRelease('A0', '2n');
                    } else if (trial.change_time==4){
                        if (s<=1){
                            synth_beat.volume.value = standard_volume;
                            synth_beat.triggerAttackRelease('A0', '2n');
                        } else {
                            synth_beat.volume.value = new_volume;
                            synth_beat.triggerAttackRelease('A0', '2n');
                        }
                    }
                    s++;
                    if (trial.section=='practice'){
                        if (s==change_rhythm.length+1){
                            clearInterval(note_loop);
                            end_trial();
                        }
                    } else {
                        if (s==change_rhythm.length){
                            clearInterval(note_loop);
                            display_buttons();
                        }
                    };
                }, 400);
              } else {
                document.getElementById("countdown").innerHTML = timeleft;
              }
              timeleft -= 1;
            }, 500);
        }
    }

    var choices = ['Definitely Yes', 'Maybe Yes', 'Maybe No', 'Definitely No'];
    var start_time = performance.now();
    function display_buttons(){
        start_time = performance.now();

        // display stimulus
        var html = '<div id="jspsych-html-button-response-stimulus"><p><strong>Was there a change?</strong></p></div>';

        //display buttons
        var button_html = '<button class="jspsych-btn">%choice%</button>'
        var margin_vertical = '0px'
        var margin_horizontal = '8px'
        var buttons = [];
        if (Array.isArray(button_html)) {
          if (button_html.length == choices.length) {
            buttons = button_html;
          } else {
            console.error('Error in html-button-response plugin. The length of the button_html array does not equal the length of the choices array');
          }
        } else {
          for (var i = 0; i < choices.length; i++) {
            buttons.push(button_html);
          }
        }
        html += '<div id="jspsych-html-button-response-btngroup">';
        for (var i = 0; i < choices.length; i++) {
          var str = buttons[i].replace(/%choice%/g, choices[i]);
          if (i<4){
            html += '<div class="jspsych-html-button-response-button" style="display: inline-block; margin:'+margin_vertical+' '+margin_horizontal+'" id="jspsych-html-button-response-button-' + i +'" data-choice="'+i+'">'+str+'</div>';
          } else {
            html += '<p><div class="jspsych-html-button-response-button" style="display: inline-block; margin:'+margin_vertical+' '+margin_horizontal+'" id="jspsych-html-button-response-button-' + i +'" data-choice="'+i+'">'+str+'</div>';
          }
        }
        html += '</div>';

        display_element.innerHTML = html;

        // start time
        var start_time = performance.now();

        // add event listeners to buttons
        for (var i = 0; i < 4; i++) {
          display_element.querySelector('#jspsych-html-button-response-button-' + i).addEventListener('click', function(e){
            var choice = e.currentTarget.getAttribute('data-choice'); // don't use dataset for jsdom compatibility
            after_response(choice);
          });
        }
    }

    // function to handle responses by the subject
    var correct = 0;
    var response = {
      rt: null,
      button: null
    };
    function after_response(choice) {

      // measure rt
      var end_time = performance.now();
      var rt = end_time - start_time;
      response.button = choice;
      response.rt = rt;

      // after a valid response, the stimulus will have the CSS class 'responded'
      // which can be used to provide visual feedback that a response was recorded
      display_element.querySelector('#jspsych-html-button-response-stimulus').className += ' responded';

      // disable all the buttons after a response
      var btns = document.querySelectorAll('.jspsych-html-button-response-button button');
      for(var i=0; i<btns.length; i++){
        //btns[i].removeEventListener('click');
        btns[i].setAttribute('disabled', 'disabled');
      }

      if (choice==0 || choice==1){
        correct = 1;
      }

      end_trial();
    };

    function end_trial(){
        synth_beat.disconnect();

        // data saving
        var trial_data = {
          volume_change: trial.volume_change,
          correct: correct,
          rt: response.rt,
          button_pressed: response.button
        };

        // end trial
        jsPsych.finishTrial(trial_data);
    }

  };

  return plugin;
})();
