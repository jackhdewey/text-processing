/**
 * jspsych-survey-multi-choice
 * a jspsych plugin for multiple choice survey questions
 *
 * Original Author: Shane Martin
 * Modified By: Jack Dewey
 *
 * documentation: docs.jspsych.org
 */

jsPsych.plugins['survey-multi-choice'] = (function() {
  let plugin = {};

  plugin.info = {
    name: 'survey-multi-choice',
    description: '',
    parameters: {
      questions: {
        type: jsPsych.plugins.parameterType.COMPLEX,
        array: true,
        pretty_name: 'Questions',
        nested: {
          prompt: {
            type: jsPsych.plugins.parameterType.STRING,
            pretty_name: 'Prompt',
            default: undefined,
            description: 'The strings that will be associated with a group of options.'
          },
          options: {
            type: jsPsych.plugins.parameterType.STRING,
            pretty_name: 'Options',
            array: true,
            default: undefined,
            description: 'Displays options for an individual question.'
          },
          required: {
            type: jsPsych.plugins.parameterType.BOOL,
            pretty_name: 'Required',
            default: false,
            description: 'Subject will be required to pick an option for each question.'
          },
          horizontal: {
            type: jsPsych.plugins.parameterType.BOOL,
            pretty_name: 'Horizontal',
            default: false,
            description: 'If true, then questions are centered and options are displayed horizontally.'
          },
          name: {
            type: jsPsych.plugins.parameterType.STRING,
            pretty_name: 'Question Name',
            default: '',
            description: 'Controls the name of data values associated with this question'
          }
        }
      },
      randomize_question_order: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Randomize Question Order',
        default: false,
        description: 'If true, the order of the questions will be randomized'
      },
      preamble: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Preamble',
        default: null,
        description: 'HTML formatted string to display at the top of the page above all the questions.'
      },
      button_label: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Button label',
        default:  'Continue',
        description: 'Label of the button.'
      }
    }
  }

  plugin.trial = function(display_element, trial) {
    let plugin_id_name = "jspsych-survey-multi-choice";

    let html = "";

    // CSS
    html += '<style id="jspsych-survey-multi-choice-css">';
    html += ".question-container { margin-top: 2em; margin-bottom: 2em; text-align: left; margin-left: 5%; margin-right: 5%; }"
            + ".question-text { display: block; padding-left: 1.5em; text-indent: -1.2em;}"
            + ".required-tag { color: darkred; }"
            + ".option { line-height: 2; margin-left: 5%}"
            + ".jspsych-survey-multi-choice-horizontal { text-align: center; }"
            + ".jspsych-survey-multi-choice-horizontal .jspsych-survey-multi-choice-option { display: inline-block;  margin-left: 1em;  margin-right: 1em;  vertical-align: top; }";
    html += '</style>';

    // Preamble
    if (trial.preamble !== null) {
      html += `</br><div class="preamble"> ${trial.preamble} </div>`;
    }

    // Form
    html += '<form id="form" style="position: relative; left:20%; width:60%">';
    
    // Generate Question Order
    let question_order = [];
    for (let i = 0; i < trial.questions.length; i++){
      question_order.push(i);
    }
    if (trial.randomize_question_order) {
      question_order = jsPsych.randomization.shuffle(question_order);
    }
    
    // Add Questions
    for (let i = 0; i < trial.questions.length; i++) {

      let question = trial.questions[question_order[i]];
      let question_id = question_order[i];

      html += `<div id="jspsych-survey-multi-choice-${question_id}" class="question-container" data-name="${question.name}">`;
      html += `<p class="question-text"> ${question.prompt}`;
      if (question.required) {
        html += "<span class='required-tag'>*</span>";
      }
      html += '</p>';

      // Add Response Options
      for (let j = 0; j < question.options.length; j++) {
        let option_id_name = `jspsych-survey-multi-choice-option-${question_id}-${j}`;
        let input_name = `jspsych-survey-multi-choice-response-${question_id}`;
        let input_id = `jspsych-survey-multi-choice-response-${question_id}-${j}`;
        let required_attr = question.required ? 'required' : '';

        html += '<div id="' + option_id_name + '" class="option">';
        html += `<label class="question-text" for="${input_id}">`;
        html += `<input type="radio" name="${input_name}" id="${input_id}" value="${question.options[j]}" ` + required_attr + '>';
        html += `${question.options[j]}</label>`;
        html += '</div>';
      }

      html += '</div>';
    }
    
    // submit button
    html += '<button type="submit" id="'+ plugin_id_name + '-next" class="' + plugin_id_name + ' jspsych-btn"' + (trial.button_label ? ' value="' + trial.button_label + '"': '') + '/>';
    html += trial.button_label + '</button>';

    // End form
    html += '</form></br>';

    display_element.innerHTML = html;

    $(document).ready(function(){
      $(this).scrollTop(0);
    });

    $('form').on('submit', function(event) {
      event.preventDefault();

      // measure response time
      let endTime = performance.now();
      let response_time = endTime - startTime;

      // aggregate responses in a data object
      let question_data = {};
      for (let i = 0; i < trial.questions.length; i++) {
        let match = display_element.querySelector('#jspsych-survey-multi-choice-' + i);
        let id = "Q" + i;
        let val = "";
        if (match.querySelector("input[type=radio]:checked") !== null){
          val = match.querySelector("input[type=radio]:checked").value;
        }
        let obj = {};
        let name = id;
        if(match.attributes['data-name'].value !== ''){
          name = match.attributes['data-name'].value;
        }
        obj[name] = val;
        Object.assign(question_data, obj);
      }
      // save data
      let trial_data = {
        "rt": response_time,
        "responses": JSON.stringify(question_data),
        "question_order": JSON.stringify(question_order)
      };
      display_element.innerHTML = '';

      // next trial
      jsPsych.finishTrial(trial_data);
    });

    let startTime = performance.now();
  };

  return plugin;
})();
