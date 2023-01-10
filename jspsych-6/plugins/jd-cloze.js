/**
 * jspsych-cloze
 * Philipp Sprengholz
 *
 * Plugin for displaying a cloze test and checking participants answers against a correct solution.
 *
 * documentation: docs.jspsych.org
 **/

jsPsych.plugins['jd-cloze'] = (function () {

    let plugin = {};

    plugin.info = {
        name: 'jd-cloze',
        description: '',
        parameters: {
            text: {
                type: jsPsych.plugins.parameterType.STRING,
                pretty_name: 'Cloze text',
                default: undefined,
                description: 'The cloze text to be displayed. Blanks are indicated by %% signs and automatically replaced by input fields. '
                             + 'If there is a correct answer you want the system to check against, it must be typed between the two percentage signs (i.e. %solution%).'
            },
            button_text: {
                type: jsPsych.plugins.parameterType.STRING,
                pretty_name: 'Button text',
                default: 'OK',
                description: 'Text of the button participants have to press for finishing the cloze test.'
            },
            check_answers: {
                type: jsPsych.plugins.parameterType.BOOL,
                pretty_name: 'Check answers',
                default: false,
                description: 'Boolean value indicating if the answers given by participants should be compared against a correct solution given in the text (between % signs) after the button was clicked.'
            },
            mistake_fn: {
                type: jsPsych.plugins.parameterType.FUNCTION,
                pretty_name: 'Mistake function',
                default: function () {},
                description: 'Function called if check_answers is set to TRUE and there is a difference between the participants answers and the correct solution provided in the text.'
            }
        }
    };

    plugin.trial = function (display_element, trial) {

        /**
         * Prevent the user from scrolling with arrow keys, space bar, or page up / page down.
         */
        window.addEventListener("keydown", processSpace);

        function processSpace(e) {
            if(["Space","ArrowUp","ArrowDown","ArrowLeft","ArrowRight",
                "Home", "End", "PageDown", "PageUp"].indexOf(e.code) > -1) {
                e.preventDefault();
            }
        }

        let html = '<div class="cloze" style="text-align:left; margin-left: 30%; margin-right: 30%">';
        let elements = trial.text.split('%');
        let solutions = [];

        console.log(elements.length);
        console.log(elements);

        for (let i = 0; i < elements.length; i++) {
            if (i%2 === 0) {
                html += elements[i];
            } else {
                solutions.push(elements[i].trim());
                html += '<input type="text" id="input' + (solutions.length - 1) + '" value="">';
            }
        }

        html += '<button type="button" id="submit_button" class="jspsych-btn">Continue</button>';
        html += '</div><br>';

        display_element.innerHTML = html;
                
        let check = function() {

            let answers = [];
            let all_fields_completed = true;

            for (let i=0; i < solutions.length; i++) {
                let id = 'input' + i;
                let field = $('#' + id);
                let value = field.val().trim();
                answers.push(value);
                console.log(value);
                
                if (trial.check_answers) {
                    if (value === '') {
                        field.css({"border-color": "red"});
                        all_fields_completed = false;
                    }
                    else {
                        field.css({"border-color": "black"});
                    }
                }
            }
            
            if (!trial.check_answers || (trial.check_answers && all_fields_completed)) {
                let trial_data = {
                    'answers' : answers
                };
                display_element.innerHTML = '';
                window.removeEventListener("keydown", processSpace);
                jsPsych.finishTrial(trial_data);
            } else {
                $(".cloze").append(" <span style='color:#c42222'>Please complete all answer boxes</span>");
            }
        };

        let button = $('#submit_button');
        button.on('click', check);
    };

    return plugin;

})();