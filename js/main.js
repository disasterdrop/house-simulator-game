(function ($, Phaser) {
    "use strict";

    let width = 800,
        maxWidth = 1600,
        height = 600,
        gameSettings = {
            housePrice: 250000,
            buildingAreaPositions: [
                {x: 100, y: 192},
                {x: 400, y: 192},
                {x: 700, y: 192},
                {x: 1000, y: 192},
                {x: 1300, y: 192},
            ],
            currentWeek: 1,
            weeklyVisitors: 0,
            weatherStats: [
                'sonnig',
                'wolkig',
                'bedeckt',
                'leichter_regen',
                'regen',
                'starker_regen',
                'sturm',
                'gewitter',
                'schneefall'
            ],
            weather: 'sonnig'
        },
        player = {
            money: 1000000,
            earnings: 0,
            ownedHouses: 0,
            entryFee: 5
        },
        moneyText,
        weekText,
        visitorsText;

    // Game Elements
    let gamePlayMenu,
        npc;

    // Inputs
    let cursors,
        mouse;

    // Game
    let game = new Phaser.Game(width, height, Phaser.AUTO, 'gameContainer');

    // States
    let bootState = {
        create: function () {
            game.physics.startSystem(Phaser.Physics.ARCADE);
            game.state.start('load');
        }
    };
    let loadState = {
        preload: function () {
            let loadingLabel = game.add.text(game.world.x, game.world.y, 'loading ...', {
                font: "20px Arial",
                fill: "#00ff00",
                align: "left"
            });

            game.load.image('sky', 'img/sky.png');
            game.load.image('grass', 'img/grass.png');
            game.load.image('road', 'img/road.png');
            game.load.image('buildingarea', 'img/buildingarea.png');
            game.load.image('house', 'img/house.png');
            game.load.image('menu', 'img/menu.png');

            game.load.spritesheet('dude', 'img/npc-sprite.png', 80, 110);

            game.load.audio('play', 'assets/CastleTheme.mp3');
            game.load.audio('build_house', 'assets/mechanical-clonk.mp3');

        },
        create: function () {
            game.state.start('menu');
        }
    };
    let menuState = {
        create: function () {
            if (window.sessionStorage.getItem('player.name')) {
                game.state.start('play');
            }
            else {
                $('#startScreen').fadeIn('slow');
                $('#startGameButton').click(function () {
                    if ($('#playerName').val() != "") {
                        window.sessionStorage.setItem('player.name', $('#playerName').val());
                        $('#startScreen').hide();

                        game.state.start('play');
                    }
                });
            }
        }
    };
    let playState = {
        create: function () {
            game.world.resize(maxWidth, height);
            game.input.mouse.capture = true;

            let music = game.add.audio('play');
            let sounds = [music];

            game.sound.setDecodedCallback(sounds, function () {
                sounds.shift();
                music.loopFull();
            }, this);

            cursors = game.input.keyboard.createCursorKeys();

            game.add.tileSprite(0, 0, maxWidth, height, 'sky');
            game.add.tileSprite(0, 128, maxWidth, height, 'grass');

            let roads = game.add.group();
            let houses = game.add.group();

            for (let count = 0; count <= maxWidth; count = count + 128) {
                roads.create(count, 320, 'road');
            }

            npc = game.add.sprite(0, 265, 'dude');

            game.physics.arcade.enable(npc);
            //game.camera.follow(npc);

            npc.animations.add('walk', [0, 1, 2], 10, true);
            npc.body.velocity.setTo(150, 0);
            npc.body.bounce.set(1);
            npc.play('walk');
            npc.body.collideWorldBounds = true;
            npc.body.onWorldBounds = new Phaser.Signal();
            npc.body.onWorldBounds.add(function (sprite) {
                sprite.scale.x *= -1;
                sprite.play('walk');
            }, this);

            gameSettings.buildingAreaPositions.forEach(function (item) {
                let ground = houses.create(item.x, item.y, 'buildingarea');
                ground.scale.setTo(1, 1);

                ground.inputEnabled = true;
                ground.events.onInputDown.add(function (sprite, pointer) {
                    if (player.money >= gameSettings.housePrice) {
                        sprite.input.enabled = false;

                        player.ownedHouses++;
                        player.money = player.money - gameSettings.housePrice;

                        moneyText.setText("Guthaben: " + player.money.toString() + " Euro");

                        let house = houses.create(sprite.x - 64, sprite.y - 128, 'house');

                        house.inputEnabled = true;
                        house.events.onInputDown.add(function (sprite, pointer) {

                        });

                        let sound = game.add.audio('build_house');
                        sound.play();
                    }

                    if (player.money <= 0) {
                        moneyText.fill = '#ff0000';
                    } else {
                        moneyText.fill = '#00ff00';
                    }
                }, this);
            });

            moneyText = game.add.text(10, 10, "Guthaben: " + player.money.toString() + " Euro", {
                font: "20px Arial",
                fill: "#00ff00",
                align: "left"
            });
            visitorsText = game.add.text(10, 30, "Besucher: 0", {
                font: "18px Arial",
                fill: "#ffffff",
                align: "left"
            });
            weekText = game.add.text(400, 10, "KW: " + gameSettings.currentWeek, {
                font: "18px Arial",
                fill: "#ffffff",
                align: "left"
            });

            gameLoops();
            gamePlayMenuBar();
        },
        update: function () {
            if (cursors.left.isDown) {
                game.camera.x -= 4;
                if (game.camera.x > 0) {
                    gamePlayMenu.x -= 4;
                }
                else {
                    gamePlayMenu.x = 100;
                }
            }
            else if (cursors.right.isDown) {
                game.camera.x += 4;
                if ((maxWidth - width) > game.camera.x) {
                    gamePlayMenu.x = game.camera.x + 100;
                }
            }
        },
        render: function () {

        }
    };
    let winState = {};

    // Add States to Game
    game.state.add('boot', bootState);
    game.state.add('load', loadState);
    game.state.add('menu', menuState);
    game.state.add('play', playState);
    game.state.add('win', winState);

    // Start Game with boot state
    game.state.start('boot');

    function getWeeklyHouseEarnings() {
        let houseEarnings = 1000 * player.ownedHouses;
        return houseEarnings;
    }

    function gamePlayMenuBar() {
        gamePlayMenu = game.add.sprite(100, height - 100, 'menu');
    }

    function gameLoops() {
        game.time.events.loop(Phaser.Timer.SECOND * 14, function () {
            let weeklyHouseEarnings = getWeeklyHouseEarnings();
            player.money = player.money + weeklyHouseEarnings;
            gameSettings.weeklyVisitors = 0;
            gameSettings.currentWeek += 1;

            moneyText.setText("Guthaben: " + player.money.toString() + " Euro");
            visitorsText.setText("Besucher: " + 0);
            weekText.setText("KW: " + gameSettings.currentWeek);
        }, this);
        game.time.events.loop(Phaser.Timer.SECOND * 2, function () {
            let min = 0;
            let max = player.ownedHouses * 50;

            let dailyVisitors = Math.floor(Math.random() * (Math.floor(max) - Math.ceil(min))) + Math.ceil(min);
            gameSettings.weeklyVisitors += dailyVisitors;

            player.money = player.money + (dailyVisitors * player.entryFee);
            moneyText.setText("Guthaben: " + player.money.toString() + " Euro");
            visitorsText.setText("Besucher: " + gameSettings.weeklyVisitors + " in der Woche | " + dailyVisitors + " am Tag");
        });
    }

    function calculateWeather() {
        if (gameSettings.weather === 'sonnig') {

        }
    }

})(jQuery, Phaser);