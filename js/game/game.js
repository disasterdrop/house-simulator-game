class Game {

    constructor(player) {
        this.player = player;
        this.currentWeek = 1;
        this.totalVisitors = 0;
        this.weeklyVisitors = 0;
        this.worldWidth = 1600;
        this.level = 1;
        this.weatherStats = [
            {name: 'sun'},
            {name: 'clouds'},
            {name: 'rain'},
            {name: 'storm'},
            {name: 'thunder_lightning'},
            {name: 'snow'}
        ];
        this.buildingAreas = [];
        this.weather = 'sun';
        this.housePrice = 250000;
    }

    levelUp() {
        this.level++;
        this.worldWidth *= this.level;
    }

    getHousePrice() {
        return this.housePrice;
    }

    getBuildingAreas() {
        let counter = 0,
            buildingAreaCount = this.level * 4;

        for (counter; counter <= buildingAreaCount; counter++) {
            this.buildingAreas.push({
                x: 128 + ((counter * 100) * 3),
                y: 192
            });
        }

        return this.buildingAreas;
    }

    getWorldWidth() {
        return this.worldWidth;
    }

    getPlayer() {
        return this.player;
    }

    getWeather() {
        return this.weather;
    }

    changeWeather(weather) {
        this.weather = weather;
    }

    jumpToNextWeek() {
        this.player.collectWeeklyHouseEarnings();
        this.weeklyVisitors = 0;
        this.currentWeek++;
    }

    getCurrentWeek() {
        return this.currentWeek;
    }

    getWeeklyVisitors() {
        return this.weeklyVisitors;
    }

    collectDailyEarnings(dailyVisitors) {
        this.getPlayer().collectDailyEarnings(dailyVisitors);
        this.addVisitorsToWeeklyVisitors(dailyVisitors)
    }

    addVisitorsToWeeklyVisitors(dailyVisitors) {
        this.weeklyVisitors += dailyVisitors;
        this.totalVisitors += dailyVisitors;
    }

    calculateDailyVisitors() {
        let min = 0;
        let max = this.player.getOwnedHouses() * 50;
        let dailyVisitors = Math.floor(Math.random() * (Math.floor(max) - Math.ceil(min))) + Math.ceil(min);

        return dailyVisitors;
    }

}