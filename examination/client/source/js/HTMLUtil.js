/*
*
*/


function makeDraggable(el, container, extraFunctionality) {
    let arrowDrag;
    let mouseDrag;
    let dragoffset = {
        x: 0,
        y: 0
    };

    let events = function() {
        addEventListeners(el, 'focusin mousedown', (function(event) {
            arrowDrag = true;
            if (event.type === 'mousedown') {
                mouseDrag = true;
                dragoffset.x = event.pageX - el.offsetLeft;
                dragoffset.y = event.pageY - el.offsetTop;
            }
        }));
        addEventListeners(el, 'focusout mouseup', (function() {
            if (event.type === 'mouseup') {
                if (mouseDrag) {
                    mouseDrag = false;
                }
            } else {
                arrowDrag = false;
            }
        }));
        addEventListeners(document, 'mousemove keydown', ((event) => {
            let borders = {};

            if (mouseDrag) {
                    borders.top = (event.pageY - dragoffset.y);
                    borders.left = (event.pageX - dragoffset.x);
            } else if (arrowDrag) {
                borders.top = parseInt(el.style.top.slice(0, -2));
                borders.left = parseInt(el.style.left.slice(0, -2));

                switch (event.key) {
                    case 'ArrowUp':
                        borders.top -= 5;
                        break;
                    case 'ArrowDown':
                        borders.top += 5;
                        break;
                    case 'ArrowLeft':
                        borders.left -= 5;
                        break;
                    case 'ArrowRight':
                        borders.left += 5;
                        break;
                }
            }

            if (mouseDrag || arrowDrag) {
                borders.bottom = borders.top + el.clientHeight;
                borders.right = borders.left + el.clientWidth;
                el.style.left = withinBounds(borders, container).all ? borders.left  + "px" : el.style.left;
                el.style.top = withinBounds(borders, container).all ? borders.top  + "px" : el.style.top + "px";
            }

        }));
    };

    el.style.position = "absolute";
    events();
    extraFunctionality(el);
}

function addEventListeners(element, events, handler) {
    events.split(' ').forEach(event => element.addEventListener(event, handler));
}

function withinBounds(element, container) {
    let border = {
        minX: container.left ? container.left : container.getBoundingClientRect().left,
        maxX: container.right ? container.right : container.getBoundingClientRect().right,
        minY: container.bottom ? container.bottom : container.getBoundingClientRect().bottom,
        maxY: container.top ? container.top : container.getBoundingClientRect().top
    };

    let el = {
        left: element.left ? element.left : element.getBoundingClientRect().left,
        right: element.right ? element.right : element.getBoundingClientRect().right,
        bottom: element.bottom ? element.bottom : element.getBoundingClientRect().bottom,
        top: element.top ? element.top : element.getBoundingClientRect().top
    };

    let result = {
        top: el.top >= border.maxY,
        left: el.left >= border.minX,
        bottom: el.bottom <= border.minY,
        right: el.right <= border.maxX,
        all: (el.top >= border.maxY) && (el.left >= border.minX) && (el.bottom <= border.minY) && (el.right <= border.maxX)
    };

    return result;
}



//exports
module.exports = {
    makeDraggable: makeDraggable,
    addEventListeners: addEventListeners,
    withinBounds: withinBounds
};
