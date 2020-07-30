// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {
        scoreDisplay: {
            default: null,
            type: cc.Label
        },
        resultDisplay: {
            default: null,
            type: cc.Label
        },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad ()
    {
        var score = cc.sys.localStorage.getItem("score");
        var win = cc.sys.localStorage.getItem("win");

        if (win)
        {
            this.resultDisplay.string = "Победа";
        }
        else
        {
            this.resultDisplay.string = "Вы проиграли";
        }

        this.scoreDisplay.string = score;

        cc.sys.localStorage.removeItem("score");
        cc.sys.localStorage.clear();
    },

    loadGame()
    {
        cc.director.loadScene("Game");
    }
    // update (dt) {},
});
