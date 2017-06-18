var ControllerClient = function(socket) {
  this.socket = socket;
  var client = this;

  this.socket.on("controller_event", function(controller_event) {
    if(client.display_client) {
      client.display_client.sendEvent(controller_event);
    } else {
      console.log("No display client connected! Event will be dropped.");
    }
  });
};

ControllerClient.prototype.setDisplayClient = function(display_client) {
  this.display_client = display_client;
};

module.exports = ControllerClient;
