const isNil = v => v === null || v === undefined || (typeof(v) === 'number' && isNaN(v));

class NameValue {
    constructor(name = null, value = null){
        this.name(name);
        this.value(value);
    }

    get nameInvalid(){
        return isNil(this.n);
    }

    get valueInvalid(){
        return isNil(this.v);
    }

    get status(){
        return !isNil(this.n) << 1 | !isNil(this.v)
    }

    set(name, value){
        this.name(name).value(value);
        return this;
    }

    name(n){
        if(arguments.length < 1) return this.n;
        else {
            this.n = n;
            return this;
        }
    }
    value(v){
        if(arguments.length < 1) return this.v;
        else {
            this.v = v;
            return this;
        }
    }
    toString(){
        let { status } = this;
        switch(status){
            case 3:
                return `${this.n}=${JSON.stringify(this.v.toString())}`;
            case 2:
                return `${this.n}`;
        }
        return '';
    }
    toObject(){
        if(this.status !== 3){
            return null;
        }
        return { [this.n]: this.v }
    }
}

module.exports = NameValue;