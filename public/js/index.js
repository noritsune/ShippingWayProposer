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

    //各辺の入力順に関わらず、判定は長い辺からチェックするため降順にする
    let length = [
        parseFloat(input.width), 
        parseFloat(input.depth), 
        parseFloat(input.height)
    ]
    length.sort((a, b) => b - a);

    let param = new Param(
        parseFloat(input.weight),
        length[0],
        length[1],
        length[2],
        parseFloat(input.width) + parseFloat(input.depth) + parseFloat(input.height)
    );

    let shippingWays = [
        new Nekopos(),
        new YuPacket(),
        new YuPacketPost(),
        new FixedFormMail(),
        new NonFixedFormMail(),
        new ClickPost(),
        new SmartLetter(),
        new LetterPackLite(),
        new YuPacketPlus(),
        new HomeDeliveryCompact(),
        new HomeDelivery(),
        new YuPack(),
        new TanoMeruMail()
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
    
    let middle = "<span>" + name + ":</span> ";
    if(cost == null) {
        middle += "<span>送れません</span>";
    } else {
        middle += "<span>" + cost + "円</span>"
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
        let costByWeight = this.costByWeights.find((element) => element.weightLimit >= param.weight);
        if(costByWeight != null) {
            this.cost = costByWeight.cost;
        }

        return super.GetCost(param);
    }
}

class NonFixedFormMail extends ShippingWay {
    constructor() {
        super();
        
        this.name = "定形外郵便";

        this.cost = null;
        this.costByWeights_standard = [
            {
                weightLimit: 50,
                cost: 120
            },
            {
                weightLimit: 100,
                cost: 140
            },
            {
                weightLimit: 150,
                cost: 210
            },
            {
                weightLimit: 250,
                cost: 250
            },
            {
                weightLimit: 500,
                cost: 390
            },
            {
                weightLimit: 1000,
                cost: 580
            }
        ];
        this.costByWeights_nonStandard = [
            {
                weightLimit: 50,
                cost: 200
            },
            {
                weightLimit: 100,
                cost: 220
            },
            {
                weightLimit: 150,
                cost: 300
            },
            {
                weightLimit: 250,
                cost: 350
            },
            {
                weightLimit: 500,
                cost: 510
            },
            {
                weightLimit: 1000,
                cost: 710
            },
            {
                weightLimit: 2000,
                cost: 1040
            },
            {
                weightLimit: 4000,
                cost: 1350
            }
        ];

        this.paramLimits = null;
        this.paramLimits_standard = new Param(1000, 34, 25, 3, null);
        this.paramLimits_nonStandard = new Param(4000, 60, 60, 60, 90);
    }

    GetCost(param) {
        let costByWeight_standard = this.costByWeights_standard.find((element) => element.weightLimit >= param.weight);
        if(costByWeight_standard != null) {
            this.cost = costByWeight_standard.cost;
        }
        
        this.paramLimits = this.paramLimits_standard;
        let result = super.GetCost(param);
        if(result != null) {
            return result;
        }

        let costByWeight_nonStandard = this.costByWeights_nonStandard.find((element) => element.weightLimit >= param.weight);
        if(costByWeight_nonStandard != null) {
            this.cost = costByWeight_nonStandard.cost;
        }
        
        this.paramLimits = this.paramLimits_nonStandard;
        return super.GetCost(param);
    }
}

class ClickPost extends ShippingWay {
    constructor() {
        super();

        this.name = "クリックポスト";
        this.cost = 198;
        this.paramLimits = new Param(1000, 34, 25, 3, null);
    }
}

class SmartLetter extends ShippingWay {
    constructor() {
        super();

        this.name = "スマートレター";
        this.cost = 180;
        this.paramLimits = new Param(1000, 25, 17, 2, null);
    }
}

class LetterPackLite extends ShippingWay {
    constructor() {
        super();

        this.name = "レターパックライト";
        this.cost = 370;
        this.paramLimits = new Param(4000, 34, 24.8, 3, null);
    }
}

//レターパックプラスは厚さに上限が無く、縦横と厚さに相関があるため実装が重い
//よって未実装
class LetterPackPlus extends ShippingWay {
    
}

class YuPacketPlus extends ShippingWay {
    constructor() {
        super();

        this.name = "ゆうパケットプラス";
        this.cost = 440;
        this.paramLimits = new Param(2000, 24, 17, 7, null);
    }
}

class HomeDeliveryCompact extends ShippingWay {
    constructor() {
        super();
        
        this.name = "宅急便コンパクト";
        this.cost = 450;

        this.paramLimits = null;
        //厚さ0.8の根拠
        //https://faq.kuronekoyamato.co.jp/app/answers/detail/a_id/3108/~/%E5%AE%85%E6%80%A5%E4%BE%BF%E3%82%B3%E3%83%B3%E3%83%91%E3%82%AF%E3%83%88%E3%81%AE%E8%96%84%E5%9E%8B%E3%81%AF%E3%80%81%E3%81%A9%E3%82%8C%E3%81%8F%E3%82%89%E3%81%84%E3%81%AE%E5%8E%9A%E3%81%BF%E3%81%AE%E3%82%82%E3%81%AE%E3%81%BE%E3%81%A7%E5%85%A5%E3%82%8A%E3%81%BE%E3%81%99%E3%81%8B%3F#:~:text=%E5%AE%85%E6%80%A5%E4%BE%BF%E3%82%B3%E3%83%B3%E3%83%91%E3%82%AF%E3%83%88-,%E5%AE%85%E6%80%A5%E4%BE%BF%E3%82%B3%E3%83%B3%E3%83%91%E3%82%AF%E3%83%88%E3%81%AE%E8%96%84%E5%9E%8B%E3%81%AF%E3%80%81%E3%81%A9%E3%82%8C%E3%81%8F%E3%82%89%E3%81%84%E3%81%AE%E5%8E%9A%E3%81%BF%E3%81%AE%E3%82%82%E3%81%AE,%E3%81%99%E3%82%8B%E3%81%93%E3%81%A8%E3%81%8C%E3%81%A7%E3%81%8D%E3%81%BE%E3%81%99%E3%80%82
        this.paramLimits_thinBox = new Param(null, 34, 24.8, 0.8, null);
        this.paramLimits_normalBox = new Param(null, 25, 20, 5, null);
    }

    GetCost(param) {
        this.paramLimits = this.paramLimits_thinBox;
        let result = super.GetCost(param);
        if(result != null) {
            return result;
        }
        
        this.paramLimits = this.paramLimits_normalBox;
        return super.GetCost(param);
    }
}

class HomeDelivery extends ShippingWay {
    constructor() {
        super();
        
        this.name = "宅急便";

        this.cost = null;
        this.costByTotalLengthAndWeights = [
            {
                totalLengthLimit: 60,
                weightLimit: 2000,
                cost: 700
            },
            {
                totalLengthLimit: 80,
                weightLimit: 5000,
                cost: 800
            },
            {
                totalLengthLimit: 100,
                weightLimit: 10000,
                cost: 1000
            },
            {
                totalLengthLimit: 120,
                weightLimit: 15000,
                cost: 1100
            },
            {
                totalLengthLimit: 140,
                weightLimit: 20000,
                cost: 1300
            },
            {
                totalLengthLimit: 160,
                weightLimit: 25000,
                cost: 1600
            }
        ];

        this.paramLimits = new Param(null, null, null, null, 160);
    }

    GetCost(param) {
        let costByTotalLengthAndWeight = this.costByTotalLengthAndWeights.find((element) => {
            return element.totalLengthLimit >= param.totalLength && element.weightLimit >= param.weight
        });
        if(costByTotalLengthAndWeight != null) {
            this.cost = costByTotalLengthAndWeight.cost;
        }

        return super.GetCost(param);
    }
}

class YuPack extends ShippingWay {
    constructor() {
        super();
        
        this.name = "ゆうパック";

        this.cost = null;
        this.costByTotalLengthes = [
            {
                totalLengthLimit: 60,
                cost: 700
            },
            {
                totalLengthLimit: 80,
                cost: 800
            },
            {
                totalLengthLimit: 100,
                cost: 1000
            }
        ];

        this.paramLimits = new Param(25000, null, null, null, 100);
    }

    GetCost(param) {
        let costByTotalLength = this.costByTotalLengthes.find((element) => {
            return element.totalLengthLimit >= param.totalLength;
        });
        if(costByTotalLength != null) {
            this.cost = costByTotalLength.cost;
        }

        return super.GetCost(param);
    }
}

class TanoMeruMail extends ShippingWay {
    constructor() {
        super();
        
        this.name = "たのメル便";

        this.cost = null;
        this.costByTotalLengthes = [
            {
                totalLengthLimit: 80,
                cost: 1700
            },
            {
                totalLengthLimit: 120,
                cost: 2400
            },
            {
                totalLengthLimit: 160,
                cost: 3400
            },
            {
                totalLengthLimit: 200,
                cost: 5000
            },
            {
                totalLengthLimit: 250,
                cost: 8600
            },
            {
                totalLengthLimit: 300,
                cost: 12000
            },
            {
                totalLengthLimit: 350,
                cost: 18500
            },
            {
                totalLengthLimit: 400,
                cost: 25400
            },
            {
                totalLengthLimit: 450,
                cost: 33000
            }
        ];

        this.paramLimits = new Param(150000, 250, null, null, 450);
    }

    GetCost(param) {
        let costByTotalLength = this.costByTotalLengthes.find((element) => {
            return element.totalLengthLimit >= param.totalLength;
        });
        if(costByTotalLength != null) {
            this.cost = costByTotalLength.cost;
        }

        return super.GetCost(param);
    }
}
