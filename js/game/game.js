class Game {

    constructor(player) {
        this.player = player;
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

        this.currentWeek = 1;
        this.currentDay = 1;
        this.dayTime = 14;
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

    getDayTime() {
        return this.dayTime;
    }

    toNextHour() {
        if (this.dayTime < 24) {
            this.dayTime++;
        }
        else {
            this.toNextDay();
            this.dayTime = 1;
        }
    }

    getCurrentDay() {
        return this.currentDay;
    }

    toNextDay() {
        this.player.collectDailyEarnings();
        this.addVisitorsToWeeklyVisitors(this.player.getDailyVisitors());
        this.currentDay++;

        if (this.currentDay % 7 === 0) {
            this.toNextWeek();
        }
    }

    getCurrentWeek() {
        return this.currentWeek;
    }

    toNextWeek() {
        this.player.collectWeeklyHouseEarnings();
        this.weeklyVisitors = 0;
        this.currentWeek++;
    }

    getWeeklyVisitors() {
        return this.weeklyVisitors;
    }

    addVisitorsToWeeklyVisitors(dailyVisitors) {
        this.weeklyVisitors += dailyVisitors;
        this.totalVisitors += dailyVisitors;
    }

    getDayTimeBackgroundColor() {
        let tint = 0x0ffffff;

        if (this.dayTime == 5 || this.dayTime == 20) {
            tint = 0xff0000;
        }
        else {
            if (this.dayTime > 20 || this.dayTime < 5) {
                tint = 0x000000;
            }
        }

        return tint;
    }

}