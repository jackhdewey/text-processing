/*
 * Example plugin template
 */

jsPsych.plugins["play-rhythm"] = (function() {

  var plugin = {};

  plugin.info = {
    name: "play-rhythm",
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

    display_element.innerHTML = '<button id="start-button" style="background-color: #4CAF50; border: none; color: white; padding: 12px 30px; text-decoration: none; margin: 4px 2px">PLAY</button><img id="sound-img" src="images/soundIcon.png" style="display:none"></img>';

    var notes = ["D4", "D3"];

    function shuffle(array) {
      for (var i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * i)
        const temp = array[i]
        array[i] = array[j]
        array[j] = temp
      }
    };
    shuffle(notes);

    var num_notes = 8;
    var input_notes = 0;
    var input_times = [];
    var start_time = performance.now();
    var timer = 0;

    console.log("STARTING REP", input_notes);
    synth.toDestination();

    document.querySelector('#start-button')?.addEventListener('click', async () => {
        await Tone.start();
        console.log('audio is ready');
        display_element.querySelector("#sound-img").setAttribute("style", "display:block; position:absolute; width:10%; top:60%; left:45%");
        for (s=0; s<trial.rhythm.length; s++){
            if (trial.rhythm[s]==1){
                play_seq();
                setTimeout(function(){}, 250);
                timer += 0.25;
            } else { setTimeout(function(){}, 250); timer += 0.25;};
        };
    });

    function play_seq(){
        if (input_notes < num_notes){
            resp_time = performance.now() - start_time;
            if (input_notes < trial.boundary){ note = notes[0]} else { note = notes[1]};
            synth.triggerAttackRelease(note, 0.25, timer);
            input_notes += 1;
            input_times.push(resp_time);
            console.log("Pressed", input_notes, num_notes, trial.boundary)
        }
    };

    setTimeout(end_trial, (250*trial.rhythm.length+250));

    function end_trial(){
        synth.disconnect();

        // kill any remaining setTimeout handlers
        jsPsych.pluginAPI.clearAllTimeouts();

        // data saving
        var trial_data = {
          rhythm: trial.rhythm,
          boundary: trial.boundary,
          note_order: notes,
          input_time1: input_times[0],
          input_time2: input_times[1],
          input_time3: input_times[2],
          input_time4: input_times[3],
          input_time5: input_times[4],
          input_time6: input_times[5],
          input_time7: input_times[6],
          input_time8: input_times[7],
        };

        console.log(trial_data);

        // end trial
        jsPsych.finishTrial(trial_data);
    };
  };

  return plugin;
})();
