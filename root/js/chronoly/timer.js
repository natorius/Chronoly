//
// timer.js
//
// Functions are variables related to the timer
//
// The time spent is recorded only in the #time_input text box and not in any
// local variable.
// This allows the user to make changes if they started the timer too early/late
// and not have the timer discard those changes.

// Check for dependencies
if ( typeof hoursToMS == 'undefined' ) {
    // utility function in chronoly.js
    air.Introspector.Console.error('Missing hoursToMS function');
}

// Holds the id for the setInterval handle so it can be 
// cleared when we want to stop the timer
var timerId;

function startTimer() {
    $('#startTimer').attr('disabled', 'true');
    $('#stopTimer').attr('disabled', null);
    window.document.title = 'Chronoly (Timer Running)';
    $('#time_input').attr('disabled', 'true');
    $('#timerGraphic').css('display', 'inline');

    // To have the timer round up we add 0.1 to the input box
    // every time we start the timer. So, any time spent is considered
    // to be at least 6 minutes.
    incrementTimer();

    timerId = setInterval( incrementTimer, hoursToMS(0.1) );
}

function incrementTimer() {
    if ( $('#time_input').val() == '' ) {
        $('#time_input').val(0.1)
    } else {
        var newTime = getTimeSpent() + 0.1;
        $('#time_input').val(newTime.toFixed(1));
    }
}

function stopTimer() {
    $('#stopTimer').attr('disabled', 'true');
    $('#startTimer').attr('disabled', null);
    window.document.title = 'Chronoly';
    $('#time_input').attr('disabled', null);
    $('#timerGraphic').css('display', 'none');

    clearInterval(timerId);
}

function getTimeSpent() {
    return parseFloat($('#time_input').val());
}
