/**
 * jspsych-free-sort
 * plugin for drag-and-drop sorting of a collection of images
 * Josh de Leeuw
 *
 * documentation: docs.jspsych.org
 */


jsPsych.plugins['jd-free-sort'] = (function() {

  let plugin = {};

  plugin.info = {
    name: 'jd-free-sort',
    description: '',
    parameters: {
      stimuli: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Stimuli',
        default: undefined,
        array: true,
        description: 'Text to be displayed.'
      },
      stim_height: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Stimulus height',
        default: 100,
        description: 'Height of images in pixels.'
      },
      stim_width: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Stimulus width',
        default: 100,
        description: 'Width of images in pixels'
      },
      sort_area_height: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Sort area height',
        default: 800,
        description: 'The height of the container that subjects can move the stimuli in.'
      },
      sort_area_width: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Sort area width',
        default: 800,
        description: 'The width of the container that subjects can move the stimuli in.'
      },
      prompt: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Prompt',
        default: null,
        description: 'It can be used to provide a reminder about the action the subject is supposed to take.'
      },
      prompt_location: {
        type: jsPsych.plugins.parameterType.SELECT,
        pretty_name: 'Prompt location',
        options: ['above','below'],
        default: 'above',
        description: 'Indicates whether to show prompt "above" or "below" the sorting area.'
      },
      button_label: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Button label',
        default:  'Continue',
        description: 'The text that appears on the button to continue to the next trial.'
      }
    }
  }

  plugin.trial = function(display_element, trial) {

    let start_time = performance.now();

    let html = "";
    // check if there is a prompt and if it is shown above
    if (trial.prompt !== null && trial.prompt_location === "above") {
      html += trial.prompt;
    }

    html += `<div id="jspsych-free-sort-arena" class="jspsych-free-sort-arena" 
             style="position: relative; width:${trial.sort_area_width}px; height:${trial.sort_area_height}px; border:2px solid #444;"></div>`;

    // check if prompt exists and if it is shown below
    if (trial.prompt !== null && trial.prompt_location === "below") {
      html += trial.prompt;
    }

    display_element.innerHTML = html;

    // store initial location data
    let init_locations = [];

    console.log(trial.stimuli);

    for (let i = 0; i < trial.stimuli.length; i++) {
      let coords = random_coordinate(trial.sort_area_width - trial.stim_width, trial.sort_area_height - trial.stim_height);

      $("#jspsych-free-sort-arena").html += `<div class="jspsych-free-sort-draggable" draggable="false" 
        style="position: absolute; cursor: move; width: ${trial.stim_width}px; height:${trial.stim_height}px; top:${coords.y}px; left:${coords.x}px;">
        ${trial.stimuli[i]}</div>`;

      init_locations.push({
        "text": trial.stimuli[i],
        "x": coords.x,
        "y": coords.y
      });
    }

    display_element.innerHTML += '<button id="jspsych-free-sort-done-btn" class="jspsych-btn">' + trial.button_label + '</button>';

    let draggables = $('.jspsych-free-sort-draggable');

    let moves = [];

    let max_z = 1;

    for (let i=0; i < draggables.length; i++) {
      draggables[i].on('mousedown', function(event){
        let x = event.pageX - event.currentTarget.offsetLeft;
        let y = event.pageY - event.currentTarget.offsetTop - window.scrollY;
        let elem = event.currentTarget;
        elem.style.zIndex = ++max_z;

        let mousemoveevent = function(e){
          elem.style.top =  Math.min(trial.sort_area_height - trial.stim_height, Math.max(0,(e.clientY - y))) + 'px';
          elem.style.left = Math.min(trial.sort_area_width  - trial.stim_width,  Math.max(0,(e.clientX - x))) + 'px';
        }
        document.addEventListener('mousemove', mousemoveevent);

        let mouseupevent = function(e){
          document.removeEventListener('mousemove', mousemoveevent);
          moves.push({
            "text": elem.dataset.text,
            "x": elem.offsetLeft,
            "y": elem.offsetTop
          });
          document.removeEventListener('mouseup', mouseupevent);
        }
        document.addEventListener('mouseup', mouseupevent);
      });
    }

    display_element.querySelector('#jspsych-free-sort-done-btn').addEventListener('click', function(){

      let end_time = performance.now();
      let rt = end_time - start_time;
      // gather data
      // get final position of all objects
      let final_locations = [];
      let matches = display_element.querySelectorAll('.jspsych-free-sort-draggable');
      for(let i=0; i<matches.length; i++){
        final_locations.push({
          "text": matches[i].dataset.text,
          "x": parseInt(matches[i].style.left),
          "y": parseInt(matches[i].style.top)
        });
      }

      let trial_data = {
        "init_locations": JSON.stringify(init_locations),
        "moves": JSON.stringify(moves),
        "final_locations": JSON.stringify(final_locations),
        "rt": rt
      };

      // advance to next part
      display_element.innerHTML = '';
      jsPsych.finishTrial(trial_data);
    });

  };

  // helper functions

  function random_coordinate(max_width, max_height) {
    let rnd_x = Math.floor(Math.random() * (max_width - 1));
    let rnd_y = Math.floor(Math.random() * (max_height - 1));

    return {
      x: rnd_x,
      y: rnd_y
    };
  }

  return plugin;
})();
