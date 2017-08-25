class Player {

    /**
     *
     * @param name
     * @param startMoney
     */
    constructor(name, startMoney = 1000000) {
        this.name = name;
        this.money = startMoney;
        this.ownedHouses = 0;
        this.houseBuildsInProgress = [];
        this.entryFee = 5;
        this.dailyVisitors = 0;
    }

    /**
     *
     * @returns {number}
     */
    getOwnedHouses() {
        return this.ownedHouses;
    }

    /**
     *
     * @returns {number|*}
     */
    getMoney() {
        return this.money;
    }

    /**
     *
     * @param money
     */
    addMoney(money) {
        this.money = this.money + money;
    }

    /**
     *
     * @param dailyVisitors
     */
    collectDailyEarnings() {
        this.dailyVisitors = this.calculateDailyVisitors();
        this.addMoney(this.dailyVisitors * this.entryFee);
    }

    /**
     * @returns {number}
     */
    collectWeeklyHouseEarnings() {
        let houseEarnings = 1000 * this.ownedHouses;
        this.addMoney(houseEarnings);
    }

    calculateDailyVisitors() {
        let min = 0;
        let max = this.ownedHouses * 50;
        let dailyVisitors = Math.floor(Math.random() * (Math.floor(max) - Math.ceil(min))) + Math.ceil(min);
        return dailyVisitors;
    }

    getDailyVisitors() {
        return this.dailyVisitors;
    }

    /**
     *
     * @param price
     */
    buyHouse(price) {
        this.ownedHouses++;
        this.money = this.money - price;
    }

}