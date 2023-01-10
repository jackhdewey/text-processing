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

    seq.events = converted_seq;

    var start_playing = 0;
    console.log("wait to play", start_playing);
    console.log("wait to play", seq.progress);
    document.querySelector('#start-button')?.addEventListener('click', async () => {
        await Tone.start();
        console.log('audio is ready');
        display_element.querySelector("#sound-img").setAttribute("style", "display:block; position:absolute; width:10%; top:60%; left:45%");
        Tone.Transport.start();
        setTimeout(function(){ start_playing = 1;}, 500);
    });

    var check_progress = setInterval(function(){
        if (seq.progress > 0.99 & start_playing == 1){
            console.log("progress", seq.progress)
            end_trial();
        }
    }, 10)

    function end_trial(){
        jsPsych.pluginAPI.clearAllTimeouts();
        clearInterval(check_progress);
        Tone.Transport.pause();

        // data saving
        var trial_data = {
          rhythm: trial.rhythm,
          converted_seq: converted_seq,
          boundary: trial.boundary,
          note_order: notes,
          note_time1: note_times[0],
          note_time2: note_times[1],
          note_time3: note_times[2],
          note_time4: note_times[3],
          note_time5: note_times[4],
          note_time6: note_times[5],
          note_time7: note_times[6],
          note_time8: note_times[7],
        };

//        console.log(trial_data);

        // end trial
        jsPsych.finishTrial(trial_data);
    };
  };

  return plugin;
})();
