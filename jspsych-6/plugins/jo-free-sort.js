/**
 * jspsych-free-sort
 * plugin for drag-and-drop sorting of a collection of images
 * Josh de Leeuw
 *
 * documentation: docs.jspsych.org
 */


jsPsych.plugins['free-order'] = (function() {

  var plugin = {};

  jsPsych.pluginAPI.registerPreload('free-order', 'stimuli', 'image');

  plugin.info = {
    name: 'free-order',
    description: '',
    parameters: {
      stimuli: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Stimuli',
        default: undefined,
        array: true,
        description: 'Images to be displayed.'
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
      },
      check_for_order: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Check for order',
        default:  false,
        description: 'Only allow to proceed if order is correct.'
      }
    }
  }

  plugin.trial = function(display_element, trial) {

    var start_time = performance.now();

    var html = "";
    // check if there is a prompt and if it is shown above
    if (trial.prompt !== null && trial.prompt_location == "above") {
      html += trial.prompt;
    }

    html += '<div '+
      'id="jspsych-free-sort-arena" '+
      'class="jspsych-free-sort-arena" '+
      'style="float: center; position: relative; width:'+trial.sort_area_width+'px; height:'+trial.sort_area_height+'px; border:2px solid #444;"'+
      '>' +
      '<div class="row"><div class="column" style="background-color:#ccc; border:thin solid black; float: left; width: 33.099%; height: 200px;">Earliest image</div><div class="column" style="background-color:#ccc; border:thin solid black; float: left; width: 33.099%; height: 200px;">Image appeared somewhere between the other two</div><div class="column" style="background-color:#ccc; border:thin solid black; float: left; width: 33.099%; height: 200px;">Latest image</div></div>' +
      '</div>';

    // check if prompt exists and if it is shown below
    if (trial.prompt !== null && trial.prompt_location == "below") {
      html += trial.prompt;
    }

    display_element.innerHTML = html;

    // store initial location data
    var init_locations = [];
    var image_dict = {};

    for (var i = 0; i < trial.stimuli.length; i++) {
      var coords = random_coordinate(trial.sort_area_width - trial.stim_width, trial.sort_area_height/2 - trial.stim_height);

      image_dict[trial.stimuli[i]] = i+1;

      display_element.querySelector("#jspsych-free-sort-arena").innerHTML += '<img '+
        'src="'+trial.stimuli[i]+'" '+
        'data-src="'+trial.stimuli[i]+'" '+
        'class="jspsych-free-sort-draggable" '+
        'draggable="false" '+
        'style="position: absolute; cursor: move; width:'+trial.stim_width+'px; height:'+trial.stim_height+'px; top:'+(200+coords.y)+'px; left:'+coords.x+'px;">'+
        '</img>';

      init_locations.push({
        "src": trial.stimuli[i],
        "x": coords.x,
        "y": coords.y
      });
    }

    display_element.innerHTML += '<p><button id="jspsych-free-sort-done-btn" class="jspsych-btn">'+trial.button_label+'</button>';

    // add blank warning
    display_element.innerHTML += '<div id="jspsych-survey-html-form-warning" style="display: none"><p style="color: red">Oops: You must arrange all the images in order to proceed.</p></div>';

    display_element.innerHTML += '<div id="jspsych-survey-html-order-warning" style="display: none"><p style="color: red">Oops: The images are in the wrong order.</p></div>';

    var maxz = 1;

    var moves = [];

    var draggables = display_element.querySelectorAll('.jspsych-free-sort-draggable');

    for(var i=0;i<draggables.length; i++){
      draggables[i].addEventListener('mousedown', function(event){
        var x = event.pageX - event.currentTarget.offsetLeft;
        var y = event.pageY - event.currentTarget.offsetTop - window.scrollY;
        var elem = event.currentTarget;
        elem.style.zIndex = ++maxz;

        var mousemoveevent = function(e){
          elem.style.top =  Math.min(trial.sort_area_height - trial.stim_height, Math.max(0,(e.clientY - y))) + 'px';
          elem.style.left = Math.min(trial.sort_area_width  - trial.stim_width,  Math.max(0,(e.clientX - x))) + 'px';
        }
        document.addEventListener('mousemove', mousemoveevent);

        var mouseupevent = function(e){
          document.removeEventListener('mousemove', mousemoveevent);
          moves.push({
            "src": elem.dataset.src,
            "x": elem.offsetLeft,
            "y": elem.offsetTop
          });
          document.removeEventListener('mouseup', mouseupevent);
        }
        document.addEventListener('mouseup', mouseupevent);
      });
    }

    display_element.querySelector('#jspsych-free-sort-done-btn').addEventListener('click', function(){

      var end_time = performance.now();
      var rt = end_time - start_time;
      // gather data
      // get final position of all objects
      var final_locations = [];
      var matches = display_element.querySelectorAll('.jspsych-free-sort-draggable');
      for(var i=0; i<matches.length; i++){
        final_locations.push({
          "src": matches[i].dataset.src,
          "x": parseInt(matches[i].style.left),
          "y": parseInt(matches[i].style.top)
        });
      };

      final_locations.sort(compareValues('x'));
      var image_order = [];
      for (i = 0; i < final_locations.length; i++) {
         image_order.push(image_dict[final_locations[i]['src']]);
      };

      //console.log.log("Original Image List:", image_dict);
      //console.log.log("Final Locations:", final_locations);
      //console.log.log("Reported Image Order:", image_order);

      var trial_data = {
        "init_locations": JSON.stringify(init_locations),
        "moves": JSON.stringify(moves),
        "final_locations": JSON.stringify(final_locations),
        "rt": rt,
        "image_order": image_order
      };

      if (moves.length > 2){
        if (trial.check_for_order && check_order(image_order) == 'asc'){
          // advance to next part
          display_element.innerHTML = '';
          jsPsych.finishTrial(trial_data);
        } else if (trial.check_for_order && check_order(image_order) != 'asc') {
          display_element.querySelector('#jspsych-survey-html-form-warning').setAttribute("style", "display: none");
          display_element.querySelector('#jspsych-survey-html-order-warning').setAttribute("style", "display: block");
        } else if (!trial.check_for_order){
          // advance to next part
          display_element.innerHTML = '';
          jsPsych.finishTrial(trial_data);
        }
      } else {
        display_element.querySelector('#jspsych-survey-html-order-warning').setAttribute("style", "display: none");
        display_element.querySelector('#jspsych-survey-html-form-warning').setAttribute("style", "display: block");
      }
    });

  };

  // helper functions

  function random_coordinate(max_width, max_height) {
    var rnd_x = Math.floor(Math.random() * (max_width - 1));
    var rnd_y = Math.floor(Math.random() * (max_height - 1));

    return {
      x: rnd_x,
      y: rnd_y
    };
  }

  function compareValues(key, order = 'asc') {
     return function innerSort(a, b) {
        if (!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) {
           // property doesn't exist on either object
           return 0;
        }

        const varA = (typeof a[key] === 'string') ?
           a[key].toUpperCase() : a[key];
        const varB = (typeof b[key] === 'string') ?
           b[key].toUpperCase() : b[key];

        let comparison = 0;
        if (varA > varB) {
           comparison = 1;
        } else if (varA < varB) {
           comparison = -1;
        }
        return (
           (order === 'desc') ? (comparison * -1) : comparison
        );
     };
  }

  function check_order(array) {
      var direction = array[0] < array[1]
              ? { type: 'asc', fn: (a, b) => a < b }
              : { type: 'desc', fn: (a, b) => a > b };

      return array.every((v, i, a) => !i || direction.fn(a[i - 1], v))
          ? direction.type
          : 'no';
  }

  return plugin;
})();
