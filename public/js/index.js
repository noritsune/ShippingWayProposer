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


    let param = new Param(
        parseFloat(input.weight), 
        parseFloat(input.width), 
        parseFloat(input.depth), 
        parseFloat(input.height),
        parseFloat(input.width) + parseFloat(input.depth) + parseFloat(input.height)
    );
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
        if(a.cost == null && b.cost == null) return 0;
        if(a.cost != null && b.cost == null) return 1;
        if(a.cost == null && b.cost != null) return -1;

        if(a.cost < b.cost) return 1;
        if(a.cost > b.cost) return -1;
        return 0;
    });

    results.forEach(result => {
        AddResultElement(result.name, result.cost);
    });
    
    //結果の各行を右からスライドイン
    $("#resultList > .element")
        .css({
            left : '100px',
            opacity: 0
        })
        .each(function(i){
            $(this)
                .delay(300 * i)
                .animate({
                    left : '0',
                    opacity: 1
                }, 300);
        });

    //比較ボタンを押下済みか示すために無効化
    $("#submitButton").prop("disabled", true);
}

function AddResultElement(name, cost) {
    const resultList = document.getElementById("resultList");
    const before = "<h5 class=\"element\"><li>";
    const after = "</li></h5>";
    
    let middle = "<span>名前：" + name + "</span>";
    if(cost == null) {
        middle += ", <span>送れません</span>";
    } else {
        middle += ", <span>費用：" + cost + "円</span>"
    }

    resultList.insertAdjacentHTML("afterbegin", before + middle + after);
}

class Param{
    //totalLengthをnullにすれば3辺合計の制限は無い
    constructor(weight, vertical, horizontal, thickness, totalLength) {
        this.weight = weight;
        this.vertical = vertical;
        this.horizontal = horizontal;
        this.thickness = thickness;
        this.totalLength = totalLength;
    }

    IsInRange(param) {
        for (const key in param) {
            if(!this.hasOwnProperty(key))  continue;
            if(this[key] == null) continue;
            
            if(param[key] > this[key]) {
                return false;
            }
        }

        return true;
    }
}

class ShippingWay {
    constructor(name, cost, paramLimits) {
        this.name = name;
        this.cost = cost;
        this.paramLimits = paramLimits;
    }

    //価格を返す。送れない場合はnullを返す
    GetCost(param) {
        if(this.paramLimits.IsInRange(param)) {
            return this.cost;
        }

        return null;
    }
}

//参考：https://pj.mercari.com/mercari-spot/mercari_school_list.pdf
class Nekopos extends ShippingWay {
    constructor() {
        super();

        this.name = "ネコポス";
        this.cost = 175;
        this.paramLimits = new Param(1000, 31.2, 22.8, 3, null);
    }
}

class YuPacket extends ShippingWay {
    constructor() {
        super();
        
        this.name = "ゆうパケット";
        this.cost = 200;
        this.paramLimits = new Param(1000, 34, 34, 3, 60);
    }
}

class YuPacketPost extends ShippingWay {
    constructor() {
        super();
        
        this.name = "ゆうパケットポスト";
        this.cost = 265;
        this.paramLimits = new Param(2000, 32.7, 22.8, 3, null);
    }
}

class FixedFormMail extends ShippingWay {
    constructor() {
        super();
        
        this.name = "定形郵便";
        this.cost = null;
        this.costByWeights = [
            {
                weightLimit: 25,
                cost: 84
            },
            {
                weightLimit: 50,
                cost: 94
            }
        ]
        this.paramLimits = new Param(50, 23.5, 12, 1, null);
    }

    GetCost(param) {
        this.cost = this.costByWeights.find((costByWeight) => costByWeight.weightLimit >= param.weight).cost;

        return super.GetCost(param);
    }
}
