$(function () {
    $(".textarea").on("keyup", () => {
        let textarea = $('.textarea');

        // Prevent the first row of being a string
        if (textarea.html().trim() == '<br>' || textarea.html().trim() == '') {
            textarea.html("<div><br></div>");
        }

        // If the textarea changed size - trigger the 'changesize' event
        if (textarea.height() != window.textarea_height) {
            textarea.trigger({
                type: 'changesize',
                width: textarea.width(),
                height: textarea.height()
            });
            window.textarea_height = textarea.height();
        }
    });

    // Used to show / hide the highlight color picker
    $('body').on('pointerdown', function (e) {
        let target = $(e.target);
        colorPickerOnClick(target, e);
    });
});

function colorPickerOnClick(target, e) {
    target = $(target);

    if (target.is($('.highlight-color-btn')) &&  $('.color-picker').length == 0) {
        // If the color picker was shown
        showColorPicker(target.position());
    } else if (target.hasClass('color')) {
        // If a color was selected
        e.preventDefault();
        highlight(target.css('background-color'));
    } else {
        // If anywhere but the color picker was selected
        let color_picker = $('.color-picker');
        if (color_picker.length > 0 && !target.is(color_picker)) {
            color_picker.remove();
        }
    }
}

function nextNode(node) {
    if (!node.hasChildNodes()) {
        // If the node has no siblings, find the parent that has a sibling
        if (!node.nextSibling) {
            while (node && !node.nextSibling) {
                node = node.parentNode;
            }
        }
        node = node.nextSibling;
    }
    // Get the lowest point in the tree
    while (node && node.hasChildNodes()) {
        node = node.firstChild;
    }
    return node;
}

function getSelectedPath() {
    // Get the selection information
    let selection_info;
    if (window.getSelection) {
        selection_info = window.getSelection().getRangeAt(0);
    } else if (document.getSelection) {
        selection_info = document.getSelection().getRangeAt(0);
    }

    // Get the start/end of the selection
    let start_node = selection_info.startContainer;
    let end_node = selection_info.endContainer;

    // If both points in the same container
    // just return the container
    if (start_node == end_node) {
        return [start_node];
    }

    // Else, build the node path from start to end
    let node_path = [start_node];
    while (start_node && start_node != end_node) {
        start_node = nextNode(start_node);
        node_path.push(start_node);
    }
    return node_path;

}

function highlight(color) {
    let node_path = getSelectedPath();
    let textarea = document.getElementsByClassName('textarea')[0];
    // Used to determine if all of the selected items are highlited
    let highlighted = true;

    // Iterate through the node path
    for (let i = 0; i < node_path.length && highlighted == true; i++) {
        let tmp = node_path[i];

        // Go up the parent tree of the node
        while (tmp != textarea && highlighted != false) {
            tmp = tmp.parentNode;
            let back_color = $(tmp).css('background-color');

            // If we reach the main text area before we find a highlight
            // - the element isnt highlighted
            if (back_color == color) {
                break;
            } else if (tmp == textarea) {
                highlighted = false;
            }
        }
    }

    // If one piece of text isnt highlighted rehighlight the whole text
    if (highlighted) {
        document.execCommand('backColor', false, 'rgba(0,0,0,0)');
    } else {
        document.execCommand('backColor', false, color);
    }
}

function increaseFontSize(size_input) {
    document.execCommand('fontSize', false, $(size_input).val());
}

function showColorPicker(position) {
    let color_picker = $(`<div class='color-picker'>
                            <div class='color' style='background-color: yellow'></div>
                            <div class='color' style='background-color: green'></div>
                            <div class='color' style='background-color: lightblue'></div>
                            <div class='color' style='background-color: pink'></div>
                            <div class='color' style='background-color: blue'></div>
                            <div class='color' style='background-color: red'></div>
                            <div class='color' style='background-color: darkblue'></div>
                            <div class='color' style='background-color: teal'></div>
                            <div class='color' style='background-color: darkgreen'></div>
                            <div class='color' style='background-color: darkorchid'></div>
                            <div class='color' style='background-color: darkred'></div>
                            <div class='color' style='background-color: darkgoldenrod'></div>
                            <div class='color' style='background-color: grey'></div>
                            <div class='color' style='background-color: darkgray'></div>
                            <div class='color' style='background-color: white'></div>
                            <div class='color' style='background-color: black'></div>
                        </div>`);

    let picker_left = (position.left / $(window).width() * 100).toString() + "%";
    let picker_top = position.top + 40;

    position = { 'left': picker_left, 'top': picker_top };
    color_picker.css(position);
    $('body').append(color_picker);
}