function GetInput() {
    let weight = document.getElementById("weight").value;
    let width = document.getElementById("width").value;
    let depth = document.getElementById("depth").value;
    let height = document.getElementById("height").value;

    console.log("重さ：" + weight + ", 幅：" + width + ", 奥行き：" + depth + ", 高さ：" + height);
}