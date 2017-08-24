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
        this.entryFee = 5;
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
    collectDailyEarnings(dailyVisitors) {
        this.addMoney(dailyVisitors * this.entryFee);
    }

    /**
     * @returns {number}
     */
    collectWeeklyHouseEarnings() {
        let houseEarnings = 1000 * this.ownedHouses;
        this.addMoney(houseEarnings);
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