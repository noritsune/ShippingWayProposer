//入力フォームへの入力値を全て読んでオブジェクトで返す
function GetAllInputs() {
    return {
        weight: document.getElementById("weight").value,
        width: document.getElementById("width").value,
        depth: document.getElementById("depth").value,
        height: document.getElementById("height").value,
    }
}

//空の入力項目があればtrueを返す
function HasEmptyForm(input){
    for(let key in input) {
        if(input[key] == "") {
            return true;
        }
    }

    return false;
}

//入力フォームが全て埋まっていればsubmitButtonを有効化する
function ButtonMakeEnable() {
    document.getElementById("submitButton").disabled = HasEmptyForm(GetAllInputs());
}

//配送方法を表示する
function ShowShippingWay() {
    let input = GetAllInputs();

    //TODO: 配送方法を表示する
    let param = new Param(input.weight, input.width, input.depth, input.height);
    let nekopos = new Nekopos();
    console.log("費用：" + nekopos.GetCost(param) + "円");
}

class Param{
    constructor(weight, vertical, horizontal, thickness) {
        this.weight = weight;
        this.vertical = vertical;
        this.horizontal = horizontal;
        this.thickness = thickness;
    }
}

class ShippingWay {
    constructor() {

    }

    //価格を返す。送れない場合は-1を返す
    GetCost() {
        return -1;
    }
}

class ParamRange {
    constructor(min, max) {
        this.min = min;
        this.max = max;
    }

    IsOutOfRange(val) {
        return val < this.min || val > this.max;
    }
}

class Nekopos extends ShippingWay {
    constructor() {
        super();

        this.cost = 175;
        this.weightRange = new ParamRange(0, 1000);
        this.verticalRange = new ParamRange(23, 31.2);
        this.horizontalRange = new ParamRange(11.5, 22.8);
        this.thicknessRange = new ParamRange(0, 3);
    }

    GetCost(param) {
        if(this.weightRange.IsOutOfRange(param.weight)) {
            console.log("重さが範囲外です");
            return -1;
        }
        
        if(this.verticalRange.IsOutOfRange(param.vertical)) {
            console.log("縦が範囲外です");
            return -1;
        }
        
        if(this.horizontalRange.IsOutOfRange(param.horizontal)) {
            console.log("横が範囲外です");
            return -1;
        }
        
        if(this.thicknessRange.IsOutOfRange(param.thickness)) {
            console.log("厚さが範囲外です");
            return -1;
        }

        return this.cost;
    }
}
