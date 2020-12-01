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


    let param = new Param(parseFloat(input.weight), parseFloat(input.width), parseFloat(input.depth), parseFloat(input.height));
    let shippingWays = [
        new Nekopos(),
        new YuPacket(),
        new YuPacketPost(),
        new FixedFormMail()
    ];

    let results = []
    shippingWays.forEach(way => {
        results.push({
            way: way,
            name: way.name,
            cost: way.GetCost(param)
        });
    });

    results.sort(function(a,b){
        if(a.cost == null || b.cost == null) return 0;
        
        if(a.cost < b.cost) return 1;
        if(a.cost > b.cost) return -1;
        return 0;
    });

    results.forEach(result => {
        AddResultElement(result.name, result.cost);
    });
}

function AddResultElement(name, cost) {
    const resultList = document.getElementById("resultList");
    const before = "<h5 class=\"element\"><li>";
    const after = "</li></h5>";
    
    let middle = "名前：" + name;
    if(cost == null) {
        middle += ", 送れません";
    } else {
        middle += ", 費用：" + cost + "円"
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
        this.cost = null;
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

//参考：https://pj.mercari.com/mercari-spot/mercari_school_list.pdf
class Nekopos extends ShippingWay {
    constructor() {
        super();
        
        this.name = "ネコポス";
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
                return null;
            }
        }

        return this.cost;
    }
}

class YuPacket extends ShippingWay {
    constructor() {
        super();
        
        this.name = "ゆうパケット";
        this.cost = 200;

        this.paramRanges = {
            weight: new ParamRange(0, 1000),
            vertical: new ParamRange(0, 34),
            horizontal: new ParamRange(0, 34),
            thickness: new ParamRange(0, 3)
        };

        this.totalLengthLimit = 60;
    }

    GetCost(param) {
        for (const key in param) {
            if (!this.paramRanges.hasOwnProperty(key))  return;

            if(this.paramRanges[key].IsOutOfRange(param[key])) {
                return null;
            }
        }
        
        const totalLength = param.vertical + param.horizontal + param.thickness;
        if(totalLength > this.totalLengthLimit) return null;

        return this.cost;
    }
}

class YuPacketPost extends ShippingWay {
    constructor() {
        super();
        
        this.name = "ゆうパケットポスト";
        this.cost = 265;

        this.paramRanges = {
            weight: new ParamRange(0, 2000),
            vertical: new ParamRange(0, 32.7),
            horizontal: new ParamRange(0, 22.8),
            thickness: new ParamRange(0, 3)
        };
    }

    GetCost(param) {
        for (const key in param) {
            if (!this.paramRanges.hasOwnProperty(key))  return;

            if(this.paramRanges[key].IsOutOfRange(param[key])) {
                return null;
            }
        }

        return this.cost;
    }
}

class FixedFormMail extends ShippingWay {
    constructor() {
        super();
        
        this.name = "定形郵便";
        this.cost_lower25 = 84;
        this.cost_lower50 = 94;

        this.paramRanges = {
            weight: new ParamRange(0, 50),
            vertical: new ParamRange(14, 23.5),
            horizontal: new ParamRange(9, 12),
            thickness: new ParamRange(0, 1)
        };
    }

    GetCost(param) {
        for (const key in param) {
            if (!this.paramRanges.hasOwnProperty(key))  return;

            if(this.paramRanges[key].IsOutOfRange(param[key])) {
                return null;
            }
        }

        return param.weight <= 25 ? this.cost_lower25 : this.cost_lower50;
    }
}
