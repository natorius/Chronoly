//
// recordTime.js
//
// Functions related to recording time in Basecamp
//

// This information could be cached locally when
// we get the todo lists, should check that out next
function getToDoItems() {
    $('#item_select > option').remove();
    $('#item_select').attr('disabled', 'disabled');

    if ($(this).val() == -1)
        return;

    showLoading();
    $.get(base_url + '/todo_lists/' + $(this).val() + '#{id}.xml', function(data) {
        hideLoading();

        $('#item_select').append('<option value="-1">Select a task</option>');

        $(data).find('todo-items > todo-item').sort(byContent).each(function() {
            // Skip items that have been completed
            if ( $(this).children('completed').text() == 'true' )
                return;

            var todo_item_id = $(this).children('id').text();
            var todo_item_content = $(this).children('content').text();

            $('#item_select').append('<option value="' + todo_item_id + '">' + todo_item_content + '</option>');
            $('#item_select').attr('disabled', null);
        });

    });
}

function getToDoList() {
    $('#todo_list_select > option').remove();
    $('#item_select > option').remove();
    $('#todo_list_select').attr('disabled', 'disabled');
    $('#item_select').attr('disabled', 'disabled');

    if ($(this).val() == -1)
        return;

    showLoading();
    $.get(base_url + '/projects/' + $(this).val() + '/todo_lists.xml?filter=pending', function(data) {
        hideLoading();

        $('#todo_list_select').append('<option value="-1">Select a list</option>');

        $(data).find('todo-lists > todo-list').sort(byName).each(function() {
            // Skip lists that don't have time tracking turned on
            if ( $(this).children('tracked').text() != 'true' )
                return;

            var todo_list_id = $(this).children('id').text();
            var todo_list_name = $(this).children('name').text();

            $('#todo_list_select').append('<option value="' + todo_list_id + '">' + todo_list_name + '</option>');
        });

        $('#todo_list_select').change(getToDoItems);
        $('#todo_list_select').attr('disabled', null);

    });
}

function getProjectList() {
    showLoading();
    $.get(base_url + '/projects.xml', function(data) {
        hideLoading();

        $('#project_select').append('<option value="-1">Select a project</option>');

        $(data).find('projects > project').sort(byName).each(function() {
            if ( $(this).children('status').text() != 'active' )
                return;

            var project_id = $(this).children('id').text();
            var project_name = $(this).children('name').text();

            $('#project_select').append('<option value="' + project_id + '">' + project_name + '</option>');
        });

        $('#project_select').change(getToDoList);
        $('#project_select').attr('disabled', null);

    });
}

function byName(a, b) {
    if ( $(a).children('name').text() < $(b).children('name').text() ) {
        return -1;
    } else if ( $(a).children('name').text() == $(b).children('name').text() ) {
        return 0;
    } else {
        return 1;
    }
}

function byContent(a, b) {
    if ( $(a).children('content').text() < $(b).children('content').text() ) {
        return -1;
    } else if ( $(a).children('content').text() == $(b).children('content').text() ) {
        return 0;
    } else {
        return 1;
    }
}

function submitTime() {
    var item_id     = $('#item_select').val();
    var hours       = $('#time_input').val();
    var description = $('#time_description').val();

    var date           = selectsToDate();
    var validation_obj = _validate_time_params(item_id, hours);

    if ( validation_obj.valid == false ) {
        showMessage(validation_obj.msg);
        return;
    }

    var time_ajax_params = _build_submit_time_ajax_params(item_id, hours, description, date);

    stopTimer();
    showLoading();
    $.ajax(time_ajax_params);
}

function _validate_time_params(item_id, hours) {
    var validation_obj   = new Object;
    validation_obj.valid = true;
    validation_obj.msg   = '';

    if (item_id == -1 || item_id == null) {
        validation_obj.valid = false;
        validation_obj.msg   = 'No valid todo item selected.';
    }
    else if (hours == '' || hours == 0) {
        validation_obj.valid = false;
        validation_obj.msg   = 'Time value is not valid.';
    }

    return validation_obj;
}

function _build_submit_time_ajax_params(item_id, hours, description, date) {
    var date = dateToString(date);
    
    var ajax_params = new Object;
    ajax_params.url = base_url + '/todo_items/' +  item_id + '/time_entries.xml';
    ajax_params.type = 'POST';
    ajax_params.dataType = 'text';

    ajax_params.success = function(data, textStatus) {
        hideLoading();
        showMessage('Time successfully entered!');

        // Reset inputs
        $('#time_input').val(0);
        $('#time_description').val('');

        getTimeReports();
    };

    // Only include description if it's provided
    var descriptionData = '';
    if ( description != '' ) {
        descriptionData =  '<description>' + description + '</description>';
    }

    ajax_params.data 
        = '<time-entry>'
        + '<person-id>'   + user_id     + '</person-id>'
        + '<date>'        + date        + '</date>'
        + '<hours>'       + hours       + '</hours>'
        + descriptionData
        + '</time-entry>';

    return ajax_params;
}

function completeTodoItem() {
    var item_id = $('#item_select').val();

    var validation_obj = _validate_item(item_id);

    if ( validation_obj.valid == false ) {
        showMessage(validation_obj.msg);
        return;
    }

    var complete_ajax_params = _build_complete_item_ajax_params(item_id);

    showLoading();
    $.ajax(complete_ajax_params);
}

function _validate_item(item_id) {
    var validation_obj   = new Object;
    validation_obj.valid = true;
    validation_obj.msg   = '';

    if (item_id == -1 || item_id == null) {
        validation_obj.valid = false;
        validation_obj.msg   = 'No valid todo item selected.';
    }

    return validation_obj;
}

function _build_complete_item_ajax_params(item_id) {
    var ajax_params      = new Object;

    ajax_params.url      = base_url + '/todo_items/' +  item_id + '/complete.xml';
    ajax_params.type     = 'PUT';
    ajax_params.dataType = 'text';

    ajax_params.success  = function(data, textStatus) {
        hideLoading();
        showMessage('Item successfully completed!');
        // Trigger a refresh of the todo list items
        $('#todo_list_select').change();
    };
    
    return ajax_params;
}
