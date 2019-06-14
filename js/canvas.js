let pen_size = 2;

// Note: getImageData and putImageData is slow for large canvas sizes

$(function () {
    // Resize the canvas to the textarea's size on load
    resizeCanvas($('.textarea').width(), $('.textarea').height());

    // If the textarea changes size, change the canvas size
    $(".textarea").on("changesize", function (e) {
        let canvas = $('#penCanvas');
        resizeCanvas(e.width, e.height);
    });

    let hover_func;
    $('#penCanvas').hover(
        // Mouse enter
        function (e) {
            // Get the position of the mouse
            window.mouse_pos = { 'mouse_x': e.clientX, 'mouse_y': e.clientY };

            let canvas = $('#penCanvas');
            // Capture the new location of the mouse if it moves
            canvas.mousemove(function (e) {
                if (window.mouse_pos) {
                    window.mouse_pos.mouse_x = e.clientX;
                    window.mouse_pos.mouse_y = e.clientY;
                }
            });

            hover_func = setInterval(function () {
                penHover(canvas);
            }, 10);

        },
        // Mouse exit
        function () {
            // Stop logging the mouse position
            $('#penCanvas').off('mousemove');
            clearInterval(hover_func);

            // Put the last known canvas image
            if(window.prev_canvas) {
                $('#penCanvas')[0].getContext('2d').putImageData(window.prev_canvas, 0, 0);
                delete window.prev_canvas;
            }

            // Remove old values
            delete window.mouse_pos;
        });

    // Draws on the canvas if the mouse is held down
    let draw_timeout;
    $('#penCanvas').on("pointerdown", function (e) {
        let canvas = $(this);
        let context = this.getContext('2d');

        // Get pointer type (DEBUG)
        // console.log(e.pointerType);

        // Draw the point(s)
        draw_timeout = setInterval(function () {
            // Remove the old canvas so that it doesnt get reloaded
            // by the hover function
            if (window.prev_canvas) {
                delete window.prev_canvas;
            }
            // Stop the hover function
            clearInterval(hover_func);

            userDraw(canvas, context);
        }, 10);
    });

    // If the mouse is not held stop drawing
    $('#penCanvas').on("pointerup", () => {
        clearInterval(draw_timeout);

        // Restart the hover function
        hover_func = setInterval(function () {
            penHover($('#penCanvas'));
        }, 10);

        // Remove old values
        delete window.old_canvas_pos;
    });
});

function penHover(canvas) {
    let context = canvas[0].getContext('2d');

    if(window.mouse_pos) {
        let canvas_pos = canvasMousePos(canvas, window.mouse_pos);

        // If a previous canvas hasnt been made already - make one
        if (!window.prev_canvas) {
            window.prev_canvas = context.getImageData(0, 0, canvas.width(), canvas.height());
        }
        
        // Put the old canvas (the one without the hover circle) back 
        context.putImageData(window.prev_canvas, 0, 0);
        // Draw the new circle
        drawCircle(canvas_pos.x, canvas_pos.y, pen_size, context);
    }
}

function canvasMousePos(canvas, mouse_pos) {
    // Convert the global mouse coordinates to those on the canvas
    canvas = $(canvas)[0];
    let rect = canvas.getBoundingClientRect();

    return {
        x: ((mouse_pos.mouse_x - rect.left) / rect.width) * canvas.width,
        y: ((mouse_pos.mouse_y - rect.top) / rect.height) * canvas.height
    }
}

function resizeCanvas(w, h) {
    let canvas = $('#penCanvas');
    let context = canvas[0].getContext('2d');

    let image_data = context.getImageData(0, 0, canvas.width(), canvas.height());
    canvas.attr("width", w);
    canvas.attr("height", h);
    canvas.css("width", w);
    canvas.css("height", h);
    context.putImageData(image_data, 0, 0);
}

function userDraw(canvas, context) {
    if (window.mouse_pos) {
        let canvas_pos = canvasMousePos(canvas, window.mouse_pos);

        // If we have a old position - draw a 'smooth' line to the new position
        if (window.old_canvas_pos) {
            // let increment = (500 / pen_size);
            let increment = (1000 / pen_size);

            // Break down the distance into increments
            let diff_y = (canvas_pos.y - window.old_canvas_pos.y) / (increment);
            let diff_x = (canvas_pos.x - window.old_canvas_pos.x) / (increment);

            if (diff_x != 0 || diff_y != 0) {
                // Draw the points to make the line
                let x = window.old_canvas_pos.x;
                let y = window.old_canvas_pos.y;
                for (let i = 0; i < increment; i++) {
                    drawCircle(x, y, pen_size, context);
                    x += diff_x, y += diff_y;
                }
            } else {
                drawCircle(canvas_pos.x, canvas_pos.y, pen_size, context);
            }
        } else {
            // Else draw at point normally
            drawCircle(canvas_pos.x, canvas_pos.y, pen_size, context);
        }

        // Store the old position in the window
        window.old_canvas_pos = canvas_pos;
    }
}

function drawCircle(x, y, r, context) {
    // Runs the eraser - this is probably a temp location for it
    if ($("#erase").hasClass('active')) {
        context.fillStyle = "black";
        context.strokeStyle = "rgba(0,0,0,1)";
        context.globalCompositeOperation = "destination-out";
    } else {
        context.fillStyle = "black";
        context.strokeStyle = " black";
        context.globalCompositeOperation = "source-over";
    }

    context.beginPath();
    context.arc(x - (r / 2), y - (r / 2), r, 0, 2 * Math.PI);
    context.closePath();
    context.fill();
    // context.fillRect(position.x - (pen_size / 2), position.y - (pen_size / 2), pen_size, pen_size);
    context.stroke();
}

function toggleDraw() {
    $("#penCanvas").toggleClass("noclick");
    $("#draw").toggleClass("active");
    $("#erase").toggleClass('hidden');
    $("#pen-inc").toggleClass('hidden');
    $("#pen-dec").toggleClass('hidden');
}

function toggleErase() {
    $("#erase").toggleClass("active");
}