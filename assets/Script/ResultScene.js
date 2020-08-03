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
        var win = cc.sys.localStorage.getItem("win") == "true";

        if (win)
        {
            this.resultDisplay.string = "YOU WIN";
        }
        else
        {
            this.resultDisplay.string = "YOU LOSE";
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
