class Company {

    constructor(name) {
        this.name = name;
        this.houses = [];
    }

    addHouse(house) {
        this.houses.push(house);
    }

    getHouses() {
        return this.houses;
    }

}