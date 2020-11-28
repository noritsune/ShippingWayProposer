function GetInput() {
    let weight = document.getElementById("weight").value;
    let width = document.getElementById("width").value;
    let depth = document.getElementById("depth").value;
    let height = document.getElementById("height").value;

    if(HasEmptyForm(new Array(weight, width, depth, height))) {
        window . alert( '必須項目は全て入力して下さい。' );
        return false;
    }

    console.log("重さ：" + weight + ", 幅：" + width + ", 奥行き：" + depth + ", 高さ：" + height);

    //TODO: 配送方法を表示する
}

function HasEmptyForm(inputs){
    for (let i = 0; i < inputs.length; i++) {
        if(inputs[i] == "") {
            return true;
        }
    }

    return false;
}