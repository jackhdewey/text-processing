//
// -*- Video-Timeline synchonizer
//
// Wait until video playhead advances to the specified timestamp
//
jsPsych.plugins["jo-video-sync"] = (function() {

    var plugin = {};

    plugin.info = {
        name: "jo-video-sync",
        parameters: {
            sources: {
                type: jsPsych.plugins.parameterType.STRING,
                default: ['images/door.mp4']
            },
            pause_at: {
                type: jsPsych.plugins.parameterType.FLOAT, // timestamp
                default: 0
            },
            // Note: The frequency at which timeupdate is called is browser specific.
            deviation: {
                type: jsPsych.plugins.parameterType.FLOAT, // +/- timestamp
                default: 0.2
            },

            flag: {
                type: jsPsych.plugins.parameterType.STRING,
                default: 'normal'
            }
        }
    };

    plugin.loadVideo = function(display_element, trial) {
        console.log([screen.width, screen.height]);
        const w = document.documentElement.clientWidth;
        const h = document.documentElement.clientHeight;
        const offset_x = w * 0.02
        const offset_y = h * 0.02
        console.log([w, h]);

        const filename = trial.sources[0];
        const template = // ES6 Template Literals (Note: not supported on older browsers)
        `<div id="video-wrapper" style="margin:auto; z-index:-999; position:absolute; left:${offset_x}px; top: ${offset_y}px">
            <video id="video" data-state="paused"
                width="${w * .97}"
//                height="${h * .97}"
                style="object-fit:contain"
                >
                <source src="${filename}" type="video/mp4">
            </video>
        </div>`;

        const instruct_size = screen.width*.65;
        const left_center = screen.width/2-instruct_size/2;
        const instructions =
        `<div id='jspsych-video-start-wrapper' style='display:block; border-radius: 4px; padding: 10px 10px 20px 20px; background-color: white; width: ${instruct_size}px; position: absolute; top: 10%; left: ${left_center}px'>
           <p>In this experiment, you will watch an animation, where you will move around a room (such as what you see in the background).
           You will see a table where you will perform a task multiple times.
           Each time, you will see differently colored objects distributed across the table.  Most of these will be L-shaped objects, and each time, there will always be a <b>one T-shaped object</b> (in the image below, the T-shaped object has been circled for you).<p><img src='images/sample_display.png' width=60%></img></p>
            <p><span id='space_prompt' style='color: grey'><strong>Press SPACE to continue.</strong></span></p>
        </div>`

        const other_text =
        `<div id='jspsych-video-start-wrapper' style='display:block; border-radius: 4px; padding: 10px 10px 20px 20px; background-color: white; width: ${instruct_size}px; position: absolute; top: 10%; left: ${left_center}px'>Your task is to search for the T-shaped object and press the <b>F KEY</b> if it is facing the left, and the <b>J KEY</b> if it is facing the right.<br>
            Try to do this as accurately and as quickly as you can.</p>
            <div>
            <div style='left: ${left_center}px'><img src='images/grey-left-T.png' width=5%></img>
            <p class='small'><strong>Press the F key</strong></p></div>
            <div class='left: ${left_center}px'><img src='images/grey-right-T.png' width=5%></img>
            <p class='small'><strong>Press the J key</strong></p></div>
            </div>
           <p>The first section will last for awhile with breaks in between, so please try to pay attention throughout.  Your data will only be useful to us if you do.  After awhile, the animation will start playing again, as if you were walking through the room.
           <strong>During this time, you don't have any particular task, but to watch the animation and imagine you were actually walking through it.</strong>
           Afterwards, you will see another table and perform the same task multiple times again.</p>
           <p>Place your left and right index fingers on the F and J keys respectively to prepare.</p>

           <p><span id='enter_prompt' style='color: grey'><strong>Press SPACE to begin!</strong></span></p></div>`

        let wrapper = document.createElement('template');

        wrapper.innerHTML = template;

        // Display the video on a different node
        display_element.innerHTML = instructions;
        display_element.insertAdjacentElement('afterend', wrapper.content.firstChild);

        let video = document.querySelector('#video')

        // Wait for Enter
        var onSpace = function(event){
            console.log(event.key)
            if (event.key == ' ') {
                    document.removeEventListener('keydown', onSpace)
                    display_element.innerHTML = other_text;

                    setTimeout(function(){
                        display_element.querySelector('#enter_prompt').setAttribute("style", "color: black");
                        document.addEventListener('keydown', onEnter);
                    }, 5000)
            }
        }

        var onEnter = function(event){
            if (event.key == ' ') {
                    document.removeEventListener('keydown', onEnter)
                    display_element.innerHTML = '';

                    video.play();
                    video.dataset.state = 'playing';
                    event.currentTarget.removeEventListener(event.type, onEnter)

                    jsPsych.finishTrial();
            }
        }

        setTimeout(function(){
            display_element.querySelector('#space_prompt').setAttribute("style", "color: black");
            document.addEventListener('keydown', onSpace);
        }, 5000)

    }

    plugin.trial = function(display_element, trial) {
        if(trial.behavior == 'init') {
            this.loadVideo(display_element, trial);
            return;
        }

        if(trial.behavior == 'clear') {
            document.querySelector('#video-wrapper').remove();
            jsPsych.finishTrial();
            return;
        }

        let video = document.querySelector('#video')

        video.play();
        video.dataset.state = 'playing';

        //
        // Listen for single event only.
        //

        // End of video listener?
        if(trial.pause_at == -1) {
            video.addEventListener('ended', function onEnd(event) {
                video.dataset.state = 'ended'
                event.currentTarget.removeEventListener(event.type, onEnd)
                console.log('video ended', event)
                jsPsych.finishTrial();
            });

            return;
        }

        // else
        video.addEventListener('timeupdate', function onTimeUpdate(event) {
            if(video.currentTime >= trial.pause_at) {
                if(video.dataset.state == 'playing') {
                    video.pause();
                    video.dataset.state = 'paused'

                    event.currentTarget.removeEventListener(event.type, onTimeUpdate)
                    jsPsych.finishTrial();
                    return;
                }
            }
            // console.log('playhead moved', [ video.currentTime, trial.pause_at ])
        });
    }

    return plugin;

})();
