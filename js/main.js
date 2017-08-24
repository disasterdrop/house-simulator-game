(function ($, Phaser) {
    "use strict";

    let width = 800,
        height = 600,
        moneyText,
        weekText,
        visitorsText,
        gamePlayMenu,
        player,
        roads,
        houses,
        cursors;

    let game;

    // Game
    let phaser = new Phaser.Game(width, height, Phaser.AUTO, 'gameContainer');

    // States
    let bootState = {
        create: function () {
            phaser.physics.startSystem(Phaser.Physics.ARCADE);
            phaser.scale.scaleMode = Phaser.ScaleManager.aspectRatio;
            phaser.scale.pageAlignVertically = true;
            phaser.scale.pageAlignHorizontally = true;
            phaser.scale.setShowAll();
            phaser.scale.refresh();
            phaser.state.start('load');
        }
    };
    let loadState = {
        preload: function () {
            let loadingLabel = phaser.add.text((width / 2) - 60, (height / 2), 'loading ...', {
                font: "20px Arial",
                fill: "#00ff00",
                align: "left"
            });

            // Map
            phaser.load.image('sky', 'img/sky-big.png');
            phaser.load.image('grass', 'img/grass.png');
            phaser.load.image('road', 'img/road.png');
            phaser.load.image('buildingarea', 'img/buildingarea.png');
            phaser.load.image('house', 'img/house.png');
            phaser.load.image('menu', 'img/menu.png');
            phaser.load.image('playerAvatar', 'img/avatar.png');

            // NPCs
            phaser.load.spritesheet('player', 'img/npc-sprite.png', 80, 110);

            // Weather Effects
            phaser.load.spritesheet('rain', 'img/sprites/rain.png', 17, 17);
            phaser.load.spritesheet('snowflakes', 'img/sprites/snowflakes.png', 17, 17);
            phaser.load.spritesheet('snowflakes_large', 'img/sprites/snowflakes_large.png', 64, 64);

            // Audio
            phaser.load.audio('play', 'assets/CastleTheme.mp3');
            phaser.load.audio('build_house', 'assets/mechanical-clonk.mp3');
            phaser.load.audio('rain_sound', 'assets/rain.mp3');
            phaser.load.audio('walking', 'assets/footsteps-4.mp3');
        },
        create: function () {
            phaser.state.start('menu');
        }
    };
    let menuState = {
        create: function () {
            $('#startScreen').fadeIn('slow');
            $('#startGameButton').click(function () {
                if ($('#playerName').val() != "") {
                    // create player and game
                    let player = new Player($('#playerName').val());
                    game = new Game(player);
                    $('#startScreen').hide();

                    phaser.state.start('play');
                }
            });
        }
    };
    let playState = {
        create: function () {
            let worldWidth = game.getWorldWidth();

            phaser.world.resize(worldWidth, height);
            phaser.input.mouse.capture = true;

            let music = phaser.add.audio('play');
            let sounds = [music];

            phaser.sound.setDecodedCallback(sounds, function () {
                //sounds.shift();
                //music.loopFull();
            }, this);

            cursors = phaser.input.keyboard.createCursorKeys();

            phaser.add.tileSprite(0, 0, worldWidth, height, 'sky');
            phaser.add.tileSprite(0, 256, worldWidth, height, 'grass');

            roads = phaser.add.group();
            houses = phaser.add.group();

            for (let count = 0; count <= worldWidth; count = count + 128) {
                roads.create(count, 320, 'road');
            }

            player = phaser.add.sprite(0, 265, 'player');
            phaser.physics.arcade.enable(player);
            phaser.camera.follow(player);

            player.animations.add('walk', [0, 1, 2], 10, true);
            player.body.bounce.set(1);
            player.anchor.set(0.5, 0);
            player.body.collideWorldBounds = true;
            player.body.onWorldBounds = new Phaser.Signal();

            game.getBuildingAreas().forEach(function (item) {
                let ground = houses.create(item.x, item.y, 'buildingarea');

                ground.scale.setTo(1, 1);
                ground.inputEnabled = true;
                ground.events.onInputDown.add(function (sprite, pointer) {
                    if (game.getPlayer().getMoney() >= game.getHousePrice()) {
                        sprite.input.enabled = false;

                        game.getPlayer().buyHouse(game.getHousePrice());

                        let house = houses.create(sprite.x - 64, sprite.y - 128, 'house');
                        let sound = phaser.add.audio('build_house');

                        house.inputEnabled = true;
                        sound.play();
                        changeText(moneyText, "Guthaben: " + game.getPlayer().getMoney() + " Euro");
                    }

                    // Change color of text
                    if (game.getPlayer().getMoney() <= 0) {
                        moneyText.fill = '#ff0000';
                    } else {
                        moneyText.fill = '#00ff00';
                    }
                }, this);
            });

            createWeatherEffect();

            moneyText = phaser.add.text(10, 10, "Guthaben: " + game.getPlayer().getMoney() + " Euro", {
                font: "20px Arial",
                fill: "#00ff00",
                align: "left"
            });
            visitorsText = phaser.add.text(10, 30, "Besucher: 0", {
                font: "18px Arial",
                fill: "#ffffff",
                align: "left"
            });
            weekText = phaser.add.text(width - 100, 10, "KW: " + game.getCurrentWeek(), {
                font: "18px Arial",
                fill: "#ffffff",
                align: "right"
            });

            gameLoops();
            gamePlayMenuBar();
        },
        update: function () {
            phaser.scale.setShowAll();
            phaser.scale.refresh();

            player.body.velocity.setTo(0, 0);

            if (cursors.left.isDown) {
                if (player.scale.x > 0) {
                    player.scale.x *= -1;
                }
                player.body.velocity.setTo(-150, 0);
                player.play('walk');
            }
            else if (cursors.right.isDown) {
                if (player.scale.x < 0) {
                    player.scale.x *= -1;
                }
                player.body.velocity.setTo(150, 0);
                player.play('walk');
            }
            else {
                player.animations.stop(null, true);
            }

            if (phaser.input.keyboard.isDown(Phaser.Keyboard.R)) {
                console.log("R");
                game.changeWeather('rain');
            }
            if (phaser.input.keyboard.isDown(Phaser.Keyboard.N)) {
                game.changeWeather('snow');
            }
            if (phaser.input.keyboard.isDown(Phaser.Keyboard.S)) {
                game.changeWeather('sun');
            }

            gamePlayMenu.x = phaser.camera.x + 100;
            moneyText.x = phaser.camera.x + 10;
            visitorsText.x = phaser.camera.x + 10;
            weekText.x = phaser.camera.x + (width - 100);
        }
    };
    let pauseState = {
        create: function () {

        }
    };

    // Add States to Game
    phaser.state.add('boot', bootState);
    phaser.state.add('load', loadState);
    phaser.state.add('menu', menuState);
    phaser.state.add('play', playState);
    phaser.state.add('pause', pauseState);

    // Start Game with boot state
    phaser.state.start('boot');

    /**
     *
     */
    function gamePlayMenuBar() {
        gamePlayMenu = phaser.add.sprite(100, height - 100, 'menu');
        let avatarImage = phaser.make.sprite(gamePlayMenu.width - 122, -((gamePlayMenu.height / 2) - 24), 'playerAvatar');

        gamePlayMenu.addChild(avatarImage);
    }

    /**
     *
     */
    function gameLoops() {
        phaser.time.events.loop(Phaser.Timer.SECOND * 14, function () {
            game.jumpToNextWeek();

            changeText(moneyText, "Guthaben: " + game.getPlayer().getMoney() + " Euro");
            changeText(visitorsText, "Besucher: " + 0);
            changeText(weekText, "KW: " + game.getCurrentWeek());
        }, this);

        phaser.time.events.loop(Phaser.Timer.SECOND * 2, function () {
            let dailyVisitors = game.calculateDailyVisitors();
            game.collectDailyEarnings(dailyVisitors);

            changeText(moneyText, "Guthaben: " + game.getPlayer().getMoney() + " Euro");
            changeText(visitorsText, "Besucher: " + game.getWeeklyVisitors() + " in der Woche | " + dailyVisitors + " am Tag");
        });
    }

    /**
     *
     */
    function createWeatherEffect() {
        if (game.getWeather() === 'sun') {

        }
        else if (game.getWeather() === 'clouds') {

        }
        else if (game.getWeather() === 'rain') {
            weatherRainEffect();
            let sound = phaser.add.audio('rain_sound');
            sound.loopFull();
        }
        else if (game.getWeather() === 'snow') {
            weatherSnowEffect();
        }
    }

    /**
     *
     */
    function weatherRainEffect() {
        let emitter = phaser.add.emitter(phaser.world.centerX, 0, 400);

        emitter.width = phaser.world.width;
        // emitter.angle = 30; // uncomment to set an angle for the rain.

        emitter.makeParticles('rain');

        emitter.minParticleScale = 0.1;
        emitter.maxParticleScale = 0.5;

        emitter.setYSpeed(300, 500);
        emitter.setXSpeed(-5, 5);

        emitter.minRotation = 0;
        emitter.maxRotation = 0;

        emitter.start(false, 1600, 5, 0);
    }

    /**
     *
     */
    function weatherSnowEffect() {
        let max = 0;

        let back_emitter = phaser.add.emitter(phaser.world.centerX, -32, 600);
        back_emitter.makeParticles('snowflakes', [0, 1, 2, 3, 4, 5]);
        back_emitter.maxParticleScale = 0.6;
        back_emitter.minParticleScale = 0.2;
        back_emitter.setYSpeed(20, 100);
        back_emitter.gravity = 0;
        back_emitter.width = phaser.world.width * 1.5;
        back_emitter.minRotation = 0;
        back_emitter.maxRotation = 40;

        let mid_emitter = phaser.add.emitter(phaser.world.centerX, -32, 250);
        mid_emitter.makeParticles('snowflakes', [0, 1, 2, 3, 4, 5]);
        mid_emitter.maxParticleScale = 1.2;
        mid_emitter.minParticleScale = 0.8;
        mid_emitter.setYSpeed(50, 150);
        mid_emitter.gravity = 0;
        mid_emitter.width = phaser.world.width * 1.5;
        mid_emitter.minRotation = 0;
        mid_emitter.maxRotation = 40;

        let front_emitter = phaser.add.emitter(phaser.world.centerX, -32, 50);
        front_emitter.makeParticles('snowflakes_large', [0, 1, 2, 3, 4, 5]);
        front_emitter.maxParticleScale = 1;
        front_emitter.minParticleScale = 0.5;
        front_emitter.setYSpeed(100, 200);
        front_emitter.gravity = 0;
        front_emitter.width = phaser.world.width * 1.5;
        front_emitter.minRotation = 0;
        front_emitter.maxRotation = 40;

        changeWindDirection(max, back_emitter, mid_emitter, front_emitter);

        back_emitter.start(false, 14000, 20);
        mid_emitter.start(false, 12000, 40);
        front_emitter.start(false, 6000, 1000);
    }

    /**
     *
     * @param max
     * @param back_emitter
     * @param mid_emitter
     * @param front_emitter
     */
    function changeWindDirection(max, back_emitter, mid_emitter, front_emitter) {
        let multi = Math.floor((max + 200) / 4),
            frag = (Math.floor(Math.random() * 100) - multi);
        max = max + frag;

        if (max > 200) max = 150;
        if (max < -200) max = -150;

        setXSpeed(back_emitter, max);
        setXSpeed(mid_emitter, max);
        setXSpeed(front_emitter, max);
    }

    /**
     *
     * @param emitter
     * @param max
     */
    function setXSpeed(emitter, max) {
        emitter.setXSpeed(max - 20, max);
        emitter.forEachAlive(setParticleXSpeed, this, max);
    }

    /**
     *
     * @param particle
     * @param max
     */
    function setParticleXSpeed(particle, max) {
        particle.body.velocity.x = max - Math.floor(Math.random() * 30);
    }

    function changeText(textElement, newText) {
        textElement.setText(newText);
    }

})(jQuery, Phaser);