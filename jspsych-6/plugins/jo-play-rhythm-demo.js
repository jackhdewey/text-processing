/*
 * Example plugin template
 */

jsPsych.plugins["play-demo"] = (function() {

  var plugin = {};

  plugin.info = {
    name: "play-demo",
    parameters: {
      rhythm: {
        type: jsPsych.plugins.parameterType.OBJECT, // BOOL, STRING, INT, FLOAT, FUNCTION, KEYCODE, SELECT, HTML_STRING, IMAGE, AUDIO, VIDEO, OBJECT, COMPLEX
        default: []
      },
      boundary: {
        type: jsPsych.plugins.parameterType.INT, // BOOL, STRING, INT, FLOAT, FUNCTION, KEYCODE, SELECT, HTML_STRING, IMAGE, AUDIO, VIDEO, OBJECT, COMPLEX
        default: 4
      },
    }
  }

  plugin.trial = function(display_element, trial) {

    display_element.innerHTML = '<p>Please press the PLAY button below to hear the sample audio sequence.  <b>The sequence will only play once, then proceed.</b>  So get ready!</p><button id="start-demo-button" style="background-color: #4CAF50; border: none; color: white; padding: 12px 30px; text-decoration: none; margin: 4px 2px">PLAY</button><img id="sound-img" src="images/soundIcon.png" style="display:none"></img>';

    var notes = ["D4", "D3"];

    jsPsych.pluginAPI.cancelAllKeyboardResponses();
    var remove_response = function(info) {
      info.stopPropagation();
    };
    var keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: remove_response,
        valid_responses: jsPsych.ALL_KEYS,
        rt_method: 'performance',
        persist: false,
        allow_held_key: false
    });

    function shuffle(array) {
      for (var i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * i)
        const temp = array[i]
        array[i] = array[j]
        array[j] = temp
      }
    };
    shuffle(notes);

    var converted_seq = [];
    var notes_played = 0;
    var note_times = [];
    var timer = 0;
    for (s=0; s<trial.rhythm.length; s++){
        if (trial.rhythm[s]==1){
            if (notes_played<trial.boundary) { converted_seq.push(notes[0])} else { converted_seq.push(notes[1])}
            notes_played += 1;
            note_times.push(timer);
        } else { converted_seq.push([]);};
        timer += 250;
    };

    demo_seq.events = converted_seq;
    demo_synth.toDestination();
    play_start = 0;

    console.log("wait to play", demo_seq.progress);
    document.querySelector('#start-demo-button')?.addEventListener('click', async () => {
        if (play_start==0){
            play_start = 1;
            await Tone.start();
            console.log('audio is ready');
            display_element.querySelector("#sound-img").setAttribute("style", "display:block; position:absolute; width:10%; top:60%; left:45%");
            setTimeout(function(){
                demo_synth.triggerAttackRelease(notes[1], 0.25);
                setTimeout(function(){
                    demo_synth.triggerAttackRelease(notes[1], 0.25);
                    setTimeout(function(){
                        demo_synth.triggerAttackRelease(notes[1], 0.25);
                        setTimeout(function(){
                            end_trial();
                        }, 500)
                    }, 500)
                }, 500)
            }, 500);
        }
    });

    function end_trial(){
        jsPsych.pluginAPI.cancelAllKeyboardResponses();
        jsPsych.pluginAPI.clearAllTimeouts();
        demo_synth.disconnect();

        // data saving
        var trial_data = {
          rhythm: trial.rhythm,
          converted_seq: converted_seq,
        };

//        console.log(trial_data);

        // end trial
        jsPsych.finishTrial(trial_data);
    };
  };

  return plugin;
})();
