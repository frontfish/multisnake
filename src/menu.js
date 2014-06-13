Game.Menu = function (game) { };

var colorsAvailable = [0, 1, 2, 3, 4, 5];
var timer;

Game.Menu.prototype = {
    create: function () {
	timer = 0;

	this.generateColorIds();
	this.updateColor();

	this.addControls(Phaser.Keyboard.W, Phaser.Keyboard.S, Phaser.Keyboard.A, Phaser.Keyboard.D, players[0]);
	this.addControls(Phaser.Keyboard.UP, Phaser.Keyboard.DOWN, Phaser.Keyboard.LEFT, Phaser.Keyboard.RIGHT, players[1]);
	this.addMute();

	for (var i = 0; i < players.length; i++) {
	    players[i].ready = false;
	}

	title = game.add.text (-w / 2, 10, 'Multisnake', { font: '56px Arial', fill: hexColors[players[0].colorId] });
	title.anchor.setTo(0.5, 0);
	this.animateEntry(- w / 2, w / 2, title);

	by = game.add.text(w, 62, 'by Christopher Hinstorff', { font: '22px Arial', fill: hexColors[players[1].colorId] });
	this.animateEntry(w, 50, by);

	players[0].readyText = game.add.sprite(78, 346, 'ready');
	players[0].readyText.anchor.setTo(0.5, 0);
	players[0].readyText.alpha = 0;

	players[1].readyText = game.add.sprite(222, 346, 'ready');
	players[1].readyText.anchor.setTo(0.5, 0);
	players[1].readyText.alpha = 0;

	Game.Play.prototype.createBackground();
	this.updateText();
    },

    update: function () {
	if (game.time.now - timer > 500 && timer > 0) {
	    game.state.start('Play');
	}
    },

    animateEntry: function (start, end, sprite) {
	rate = (start - end) / 7;
	time = 150;
	delay = 150;

	game.add.tween(sprite)
	    .to({ x: end + rate * 6 }, time, null, true, delay, 0, false)
	    .to({ x: end + rate * 5 }, time, null, true, delay, 0, false)
	    .to({ x: end + rate * 4 }, time, null, true, delay, 0, false)
	    .to({ x: end + rate * 3 }, time, null, true, delay, 0, false)
	    .to({ x: end + rate * 2 }, time, null, true, delay, 0, false)
	    .to({ x: end + rate * 1 }, time, null, true, delay, 0, false)
	    .to({ x: end + rate * 0 }, time, null, true, delay, 0, false);	
    },

    ready: function (player) {
	if (!player.ready && timer === 0) {
	    game.add.tween(player.readyText).to({ y: 316, alpha: 1 }, 200, null, true, 0, 0, false);
	    player.ready = true;

	    if (audio) {
		sfx.eat.play('', 0, 1, false, true);
	    }
	    
	    if (this.allReady()){
		this.startGame();
	    }
	}
    },

    unready: function (player) {
	if (player.ready && timer === 0) {
	    game.add.tween(player.readyText).to({ y: 346, alpha: 0 }, 200, null, true, 0, 0, false);
	    player.ready = false;
	   
	    if (audio) {
		sfx.eat2.play('', 0, 1, false, true);
	    }
	}
    },

    allReady: function () {
	var ret = true;
	for (var i = 0; i < players.length; i++) {
	    if (players[i].ready === false) {
		ret = false;
	    }
	}
	return ret;
    },

    updateColor: function () {
	for (var i = 0; i < players.length; i++) {
	    players[i].color = colors[players[i].colorId];
	}
    },
    
    updateText: function () {
	title.fill = hexColors[players[0].colorId];
	by.fill = hexColors[players[1].colorId];
	
	players[0].readyText.bringToTop();
	players[1].readyText.bringToTop();
    },

    generateColorIds: function () {
	for (var i = 0; i < players.length; i++) {
	    if (!players[i].color) {
		var success = false;
		while (!success) {
		    var rand = Math.floor(Math.random() * 6);
		    if (colorsAvailable.indexOf(rand) > -1) {
			players[i].colorId = rand;
			colorsAvailable.splice(colorsAvailable.indexOf(rand), 1);
			success = true;
		    }
		}
	    }
	}
    },

    addControls: function (up, down, left, right, player) {
	player.keys = {};
	player.keys.up = game.input.keyboard.addKey(up);
	player.keys.down = game.input.keyboard.addKey(down);
	player.keys.left = game.input.keyboard.addKey(left);
	player.keys.right = game.input.keyboard.addKey(right);

	player.keys.up.onDown.add(
	    function () {
		this.ready(player);
		Game.Play.prototype.updateBackground();
		this.updateText();
	    }, this);
	player.keys.down.onDown.add(
	    function () {
		this.unready(player);
		Game.Play.prototype.updateBackground();
		this.updateText();
	    }, this);
	player.keys.left.onDown.add(
	    function () { 
		if (!player.ready) {
		    colorsAvailable.push(player.colorId);
		    player.colorId = (player.colorId + colors.length - 1) % colors.length;
		    while (colorsAvailable.indexOf(player.colorId) === -1) {
			player.colorId = (player.colorId + colors.length - 1) % colors.length;
		    }
		    colorsAvailable.splice(colorsAvailable.indexOf(player.colorId), 1);
		    this.updateColor() 
		    
		    Game.Play.prototype.updateBackground();
		    this.updateText();
		}
	    }, this);
	player.keys.right.onDown.add(
	    function () { 
		if (!player.ready) {
		    colorsAvailable.push(player.colorId);
		    player.colorId = (player.colorId + 1) % colors.length; 
		    while (colorsAvailable.indexOf(player.colorId) === -1) {
			player.colorId = (player.colorId + 1) % colors.length;
		    }
		    colorsAvailable.splice(colorsAvailable.indexOf(player.colorId), 1);
		    this.updateColor();
		    
		    Game.Play.prototype.updateBackground();
		    this.updateText();
		}
	    }, this);
    },

    addMute: function () {
	muteKey = game.input.keyboard.addKey(Phaser.Keyboard.M);
	muteKey.onDown.add(
	    function () {
		audio = !audio;
	    }, this);
    },

    startGame: function () {
	timer = game.time.now;
	game.add.tween(title).to({ alpha: 0 }, 250, null, true, 250, 0, false);
	game.add.tween(by).to({ alpha: 0 }, 250, null, true, 250, 0, false);
	game.add.tween(players[0].readyText).to({ alpha: 0 }, 250, null, true, 250, 0, false);
	game.add.tween(players[1].readyText).to({ alpha: 0 }, 250, null, true, 250, 0, false);
    }
};
