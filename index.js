require('./lib/metro-transit')

// Create the handler that responds to the Alexa Request.
exports.handler = function (event, context) {
    // Create an instance of the MetroTransit skill.
    var dcMetro = new MetroTransit();
    dcMetro.execute(event, context);
};
