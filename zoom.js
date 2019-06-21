"use strict";

function _instanceof(left, right) {
    if (right != null && typeof Symbol !== "undefined" && right[Symbol.hasInstance]) {
        return right[Symbol.hasInstance](left);
    } else {
        return left instanceof right;
    }
}

function _classCallCheck(instance, Constructor) {
    if (!_instanceof(instance, Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
}

function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
    }
}

function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
}

var settings = {
    'magnification': 2,
    'maskSize': 80 // Once our images have loaded let's create the zoom

};
window.addEventListener("load", function () {
    // find all the images
    var images = document.querySelectorAll('.image-zoom-available'); // querySelectorAll produces an array of images that we pull out one by one and create a Zoombini for

    Array.prototype.forEach.call(images, function (image) {
        new Zoombini(image);
    });
}); // A Zoombini (or whatever you want to call it), is a class that takes an image input and adds the zoomable functionality to it. Let's take a look inside at what it does.

var Zoombini =
    /*#__PURE__*/
    function () {
        // When we create a new Zoombini we run this function; it's called the constructor and you can see it taking our image in from above
        function Zoombini(targetImage) {
            _classCallCheck(this, Zoombini);

            // We don't want the Zoombini to forget about it's image, so let's save that info
            this.image = targetImage; // The Zoombini isActive after it has opened up 

            this.isActive = false; // But as it hasn't been used yet it's maskSize will be 0

            this.maskSize = 0; // And we have to start it's coordinates somewhere, they may as well be (0,0)

            this.mousex = this.mousey = 0; // Now we're set up let's build the necessary compoonents
            // First let's clone our original image, I'm going to call it imageZoom and save it our Zoombini

            this.imageZoom = this.image.cloneNode(); // And pop it next to the image target

            this.image.parentNode.insertBefore(this.imageZoom, this.image); // Make the zoom image that we'll crop float above it's original sibling

            this.imageZoom.style.zIndex = 1; // We don't want to be able to touch it though, we want to reach whats underneat

            this.imageZoom.style.pointerEvents = "none"; // And so we can translate it let's make it absolute

            this.imageZoom.style.position = "absolute"; // Now let's scale up our enlarged image and add an event listener so that it resizes whenever the size of the window changes

            this.resizeImageZoom();
            window.addEventListener("resize", this.resizeImageZoom.bind(this), false); // Now that we're finishing the constructor we need to addeventlisteners so we can interact with it
            // This function is just below, but still exists within our Zoombini

            this.UI(); // Finally we'll apply an initial mask at default settings to hide this image

            this.drawMask();
        } // resizeImageZoom resizes the enlarged image


        _createClass(Zoombini, [{
            key: "resizeImageZoom",
            value: function resizeImageZoom() {
                // So let's scale up this version
                this.imageZoom.style.width = this.image.getBoundingClientRect().width * settings.magnification + 'px';
            } // This could be inside the constructor but it's nicer on it's own I think

        }, {
            key: "UI",
            value: function UI() {
                var _this = this;

                this.image.addEventListener('mousemove', function (event) {
                    // When we move our mouse the x and y coordinates from the event
                    // We subtract the left and top coordinates so that we get the (x,y) coordinates of the actualy image, where (0,0) would be the top left
                    _this.mousex = event.clientX - _this.image.getBoundingClientRect().left;
                    _this.mousey = event.clientY - _this.image.getBoundingClientRect().top; // if we're not active then don't display anything

                    if (!_this.isActive) return; // The drawMask() function below displays our the portion of the image that we're interested in

                    _this.drawMask();
                }); // When they mousedown we open up our mask

                this.image.addEventListener('mousedown', function () {
                    // But it can be opening or closing, so let's pass in that information
                    _this.isExpanding = true; // To do that we start the maskSizer function, which calls itself until it reaches full size

                    _this.maskSizer(); // And hide our cursor (we know where it is)


                    _this.image.classList.add('is-active');
                }); // if the mouse is released, close the mask

                this.image.addEventListener('mouseup', function () {
                    // if it's not expanding, it's closing
                    _this.isExpanding = false; // if the mask has already expanded we'll need to start another maskSizer to shrink it. We don't run the maskSizer unless the mask is changing

                    if (_this.isActive) _this.maskSizer();
                }); // same as above, caused by us moving out of the zoom area

                this.image.addEventListener('mouseout', function () {
                    _this.isExpanding = false;
                    if (_this.isActive) _this.maskSizer();
                });
            } // The drawmask function shows us the piece of the image that we are hovering over

        }, {
            key: "drawMask",
            value: function drawMask() {
                // Let's use getBoundingClientRect to get the location of our images
                var image = this.image.getBoundingClientRect();
                var imageZoom = this.imageZoom.getBoundingClientRect(); // We'll start by getting the (x,y) of our big image that matches the piece we're mousing over (which we stored from our event listener as this.mousex and this.mousey). This is a clunky bit of code to help the zooms work in a variety of situations.

                var prop_x = this.mousex / image.width * imageZoom.width * (1 - 1 / settings.magnification) - image.x - window.scrollX;
                var prop_y = this.mousey / image.height * imageZoom.height * (1 - 1 / settings.magnification) - image.y - window.scrollY; // Shift the large image by that amount

                this.imageZoom.style.left = -prop_x + "px";
                this.imageZoom.style.top = -prop_y + "px"; // Now we need to create our mask
                // First let's get the coordinates of the point we're hovering over

                var x = this.mousex * settings.magnification;
                var y = this.mousey * settings.magnification; // And create and apply our clip

                var clippy = "circle(" + this.maskSize + "px at " + x + "px " + y + "px)";
                this.imageZoom.style.clipPath = clippy;
                this.imageZoom.style.webkitClipPath = clippy;
            } // We'll use the maskSizer to either expand or shrink the size of our mask

        }, {
            key: "maskSizer",
            value: function maskSizer() {
                // We're in maskSizer so we're changing the size of our mask. Let's make the mask radius larger if the Zoombini is expanding, or shrink it if it's closing. The numbers below might need to be adjusted. It closes faster than it opens
                this.maskSize = this.isExpanding ? this.maskSize + 35 : this.maskSize - 40; // It has the form of: condition ? value-if-true : value-if-false
                // Think of the ? as "then" and : as "else"
                // if we've reaached max size, don't make it any larger

                if (this.maskSize >= settings.maskSize) {
                    this.maskSize = settings.maskSize; // we'll no longer need to change the maskSize so we'll just set this.isActive to true and let our mousemove do the drawing

                    this.isActive = true;
                } else if (this.maskSize < 0) {
                    // Our mask is closed
                    this.maskSize = 0;
                    this.isActive = false;
                    this.image.classList.remove('is-active');
                } else {
                    // Or else we haven't reached a size that we want to keep yet. So let's loop it on the next available frame
                    // We bind(this) here because so that the function remains in context
                    requestAnimationFrame(this.maskSizer.bind(this));
                } // After we have the appropriate size, draw the mask


                this.drawMask();
            }
        }]);

        return Zoombini;
    }();