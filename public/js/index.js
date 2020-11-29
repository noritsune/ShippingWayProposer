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

    console.log("重さ：" + input.weight + ", 幅：" + input.width + ", 奥行き：" + input.depth + ", 高さ：" + input.height);

    //TODO: 配送方法を表示する
}