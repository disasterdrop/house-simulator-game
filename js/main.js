let gameSettings = {
        width: 600,
        height: 600,
        housePrice: 500000,
        buildingAreaPositions: [
            {x: 90, y: 200},
            {x: 120, y: 420},
            {x: 260, y: 120},
            {x: 390, y: 90},
            {x: 500, y: 500},
        ],
        currentWeek: 1,
        weeklyVisitors: 0,
        weatherStats: [
            'sunshine',
            'rain'
        ],
        weather: 'sunshine'
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

let game = new Phaser.Game(gameSettings.width, gameSettings.height, Phaser.AUTO, '#GameContainer', {
    preload: preload,
    create: create,
    render: render
});

function preload() {
    game.load.image('groundplan', 'img/groundplan.png');
    game.load.image('buildingarea', 'img/buildingarea.png');
    game.load.image('house', 'img/house.png');
}

function create() {
    game.physics.startSystem(Phaser.Physics.ARCADE);
    game.add.sprite(0, 0, 'groundplan');

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

    game.time.events.loop(Phaser.Timer.SECOND * 7, function () {
        let weeklyHouseEarnings = getWeeklyHouseEarnings();
        player.money = player.money + weeklyHouseEarnings;
        gameSettings.weeklyVisitors = 0;
        gameSettings.currentWeek += 1;

        moneyText.setText("Guthaben: " + player.money.toString() + " Euro");
        visitorsText.setText("Besucher: " + 0);
        weekText.setText("KW: " + gameSettings.currentWeek);
    }, this);

    game.time.events.loop(Phaser.Timer.SECOND, function () {
        let min = 0;
        let max = player.ownedHouses * 50;

        let dailyVisitors = Math.floor(Math.random() * (Math.floor(max) - Math.ceil(min))) + Math.ceil(min);
        gameSettings.weeklyVisitors += dailyVisitors;

        player.money = player.money + (dailyVisitors * player.entryFee);
        moneyText.setText("Guthaben: " + player.money.toString() + " Euro");
        visitorsText.setText("Besucher: " + gameSettings.weeklyVisitors + " in der Woche | " + dailyVisitors + " am Tag");
    });

    gameSettings.buildingAreaPositions.forEach(function (item) {
        let ground = game.add.sprite(item.x, item.y, 'buildingarea');
        ground.anchor.setTo(0.5, 0.5);

        ground.inputEnabled = true;
        ground.events.onInputDown.add(function (sprite, pointer) {
            if (player.money >= gameSettings.housePrice) {
                sprite.input.enabled = false;

                player.ownedHouses++;
                player.money = player.money - 500000;

                moneyText.setText("Guthaben: " + player.money.toString() + " Euro");

                let house = game.add.sprite(sprite.x, sprite.y, 'house');
                house.anchor.setTo(0.5, 0.5);
                house.inputEnabled = true;
                house.events.onInputDown.add(function (sprite, pointer) {

                });
            }

            if (player.money <= 0) {
                moneyText.fill = '#ff0000';
            } else {
                moneyText.fill = '#00ff00';
            }
        }, this);
    });
}

function getWeeklyHouseEarnings() {
    let houseEarnings = 1000 * player.ownedHouses;
    return houseEarnings;
}

function render() {
    game.debug.text("Time until event: " + game.time.events.duration.toFixed(0), 32, 32);
    game.debug.text("Next tick: " + game.time.events.next.toFixed(0), 32, 64);
}