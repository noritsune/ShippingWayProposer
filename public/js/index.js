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

    document.getElementById("resultTitle").innerText = "～結果発表～";
    document.getElementById("resultList").innerHTML = "";


    let param = new Param(input.weight, input.width, input.depth, input.height);
    let shippingWays = [
        new Nekopos("ネコポス"),
        new Nekopos("ねこぽす"),
        new Nekopos("にゃんポス")
    ]

    let costs = {}
    shippingWays.forEach(way => {
        costs[way.name] = way.GetCost(param);
    });

    for (const key in costs) {
        AddResultElement(key, costs[key]);
    }
}

function AddResultElement(name, cost) {
    const resultList = document.getElementById("resultList");
    const before = "<h5 class=\"element\"><li>";
    const after = "</li></h5>";
    
    let middle = "名前：" + name;
    if(cost > 0) {
        middle += ", 費用：" + cost + "円"
    } else {
        middle += ", 送れません";
    }

    resultList.insertAdjacentHTML("afterbegin", before + middle + after);
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
        
        this.name = "なし";
        this.cost = -1;
    }

    //価格を返す。送れない場合は-1を返す
    GetCost() {
        return this.cost;
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
    constructor(name) {
        super();
        
        this.name = name;
        this.cost = 175;

        this.paramRanges = {
            weight: new ParamRange(0, 1000),
            vertical: new ParamRange(23, 31.2),
            horizontal: new ParamRange(11.5, 22.8),
            thickness: new ParamRange(0, 3)
        };
    }

    GetCost(param) {
        for (const key in param) {
            if (!this.paramRanges.hasOwnProperty(key))  return;

            if(this.paramRanges[key].IsOutOfRange(param[key])) {
                return -1;
            }
        }

        return this.cost;
    }
}
