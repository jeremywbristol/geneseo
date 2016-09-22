/* main.js */

"use strict";

$(document).ready(function() {
    
    // Set up the events for the loading animation.
    $(this).ajaxStop(function() {
       $('.loading').hide(); 
    });
    $(this).ajaxStart(function() {
        $('.loading').show();
    })

    // Populate the instructors SELECT element.
    $.get({
        dataType: 'JSON',
        url: 'https://knightweb.geneseo.edu/bannerdatafeed/CourseSearch/courseSearch',
        data: { 'subject': 'ANTH' },
        success: function(json) {
            
            // Use jsonPath to get an array of instructor objects.
            // An instructor object has: firstName, lastName, middleName, primary, and username.
            var instructorArray = jsonPath(json, '$..instructorList[*]');
            
            // Sort the array. Sort it by last name, then first name.
            instructorArray.sort(function(a, b) {
                var aVal = a.lastName + a.firstName;
                var bVal = b.lastName + b.firstName;
                if (aVal < bVal) {
                    return -1;
                }
                if (aVal > bVal) {
                    return 1;
                }
                return 0;
            });
            
            // Now that the array is sorted, we can loop through it to populate the SELECT 
            // element in the DOM.
            // We only want to add instructors that do not exist. 
            var template = '<option value="%s">%s, %s</option>';
            var optionElements = [];
            optionElements.push('<option value="">--Select an instructor--</option>');
            for (var i = 0; i < instructorArray.length; i++) {
                if (i === 0 || instructorArray[i].username != instructorArray[i-1].username) {
                    optionElements.push(
                        sprintf(
                            template,
                            instructorArray[i].username,
                            instructorArray[i].lastName,
                            instructorArray[i].firstName
                        )
                    );
                }
            }
            
            // Append the OPTION elements to the DOM.
            // Also, set the font so that it's consistent.
            $('#instructors')
                .empty()
                .append(optionElements.join(''))
                .css('font-family', 'Enriqueta, serif')
                .css('font-size', '1em');
        }
    });
    
    // Add an event handler for the Search button.
    // When the button is pressed, the page will display the courses
    // for that instructor.
    $('select').on('change', function(e) {
        e.preventDefault();
        var username = $(this).val();
        // Clear out the existing data. So, if the username is empty, 
        // we are not left with a confusing UI.
        $('tbody').empty();
        // If the username is empty, return here. We don't need to do anything else.
        if (username === '') {
            return;
        }
        $.get({
            dataType: 'JSON',
            url: 'https://knightweb.geneseo.edu/bannerdatafeed/CourseSearch/courseSearch',
            data: { 'instructor': username },
            success: function(json) {
                
                // We don't need jsonPath here - we can just read from the json object as it is.
                // So, let's populate the rows.
                var rows = [];
                for (var i = 0; i < json.length; i++) {
                    rows.push(
                        sprintf(
                            '<tr><td>%s</td><td>%s</td><td>%s</td><td>%s</td></tr>',
                            json[i].subjectCode,
                            json[i].courseNumber,
                            json[i].section,
                            json[i].title
                        )
                    );
                }
                $('tbody').empty().append(rows.join(''));
            }
        });
    });
    
});