class List {
    constructor(list){
        this.list = Array.isArray(list) ? list : [];
    }

    get length(){
        return this.list.length;
    }

    append(item){
        this.list.push(item);
        return this;
    }

    contains(fn){
        return this.list.some((...args) => fn(...args));
    }

    indexOf(item){
        return this.list.indexOf(item);
    }

    removeAt(index){
        if(index > -1 && index < this.length){
            return this.list.splice(index, 1)[0];
        } else {
            return null;
        }
    }

    remove(item){
        return this.removeAt(this.indexOf(item));
    }

    clear(){
        this.list.splice(0, this.length);
        return this;
    }

    each(fn){
        this.list.some((...args) => fn(...args));
        return this;
    }

    findIndex(fn){
        return this.list.findIndex((...args) => fn(...args));
    }

    find(fn){
        return this.list.find((...args) => fn(...args));
    }

    filter(fn){
        let list = this.list.filter(fn);
        return new this.constructor(list);
    }
}
module.exports = List;