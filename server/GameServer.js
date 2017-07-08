var debug = require('debug')('space-dud:GameServer');
var express = require('express');
var read = require('fs').readFileSync;
var exists = require('fs').existsSync;

var Game = require('./Game.js');

function chooseControllerRole(socket) {
  debug('Client chose the "controller" role.');
  this.game.createControllerClient(socket);
};

function chooseDisplayRole(socket) {
  debug('Client chose the "display" role.');

  socket.on('choose_player', (player_id) => {

    try {
      this.game.createDisplayClient(socket, player_id);
      debug('Display client chose valid player with id: '+player_id);
      socket.emit('valid_player_choice', true);
  
    } catch(e) {
      debug('An error occured while creating the display client: '+e.message);
      socket.emit('valid_player_choice', false);
    }
  });
};

function setRole(role, socket) {
  if(role == 'controller') {
    chooseControllerRole.call(this, socket);

  } else if(role == 'display') {
    chooseDisplayRole.call(this, socket);

  } else {
    debug('Client chose an invalid role: '+role);
    socket.disconnect(true);
  }
};

function serveStaticFile(req, res) {
  var filename = req.url.substr(req.url.lastIndexOf("/")+1);
  var path = __dirname+"/../client/"+filename
  if(exists(path)) {
    res.setHeader('Content-Type', 'application/javascript');
    res.writeHead(200);
    res.end(read(path));
  } else {
    res.writeHead(404);
    res.end();
  }
}

function setupServer(http) {

  // Serve the static files
  var evs = http.listeners('request').slice(0);
  http.removeAllListeners('request');

  http.on('request', function(req, res) {
    if(req.url.indexOf('/space-dud') === 0) {
      serveStaticFile.call(this, req, res);

    } else {
      for(var i = 0; i < evs.length; i++) {
        evs[i].call(http, req, res);
      }
    }
  });  

  this.io = require('socket.io')(http).of('/space-dud');
  this.io.on('connection', (socket) => {
    debug('Client connected.');

    socket.on('set_role', (role) => {
      setRole.call(this, role, socket);
    });
  });
}

var GameServer = function(http) {
  this.game = new Game();
  setupServer.call(this, http);
};

module.exports = GameServer; 
