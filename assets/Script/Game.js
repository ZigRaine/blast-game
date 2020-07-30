// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {
        // Inspector provided variables
        movesDisplay: {
            default: null,
            type: cc.Label
        },
        shuffleDisplay: {
            default: null,
            type: cc.Label
        },
        scoreDisplay: {
            default: null,
            type: cc.Label
        },
        progressDisplay: {
            default: null,
            type: cc.ProgressBar
        },
        // Game Variables
        destinationScore: {
            type: cc.Integer,
            default: 1000
        },
        movesCount: {
            type: cc.Integer,
            default: 40
        },
        shuffleCount: {
            type: cc.Integer,
            default: 5
        },
        scoreForBlock:
        {
            type: cc.Integer,
            default: 10
        },
        scoreMultiplier:
        {
            type: cc.Float,
            default: 1.3
        },
        // Estimate moves count
        currentMoves: 0,
        // Estimate scores count
        currentScore: 0,
        // Estimate Shuffles
        currentShuffles: 0,
    },

    onLoad()
    {
        this.currentMoves = this.movesCount;
        this.currentShuffles = this.shuffleCount;

        this.shuffleDisplay.string = this.shuffleCount;
        this.movesDisplay.string = this.movesCount;
        this.progressDisplay.progress = 0;

        console.log("wtf", this.currentScore);
        this.node.on("TEST_EVENT", (event) => { this.scoreListener(event)});
    },

    start () {

    },

    scoreListener(event)
    {
        event.stopPropagation();

        var data = event.getUserData();
        var score = Math.floor(data.count * this.scoreForBlock * Math.pow(this.scoreMultiplier, data.count - 2));

        console.log("Score", score, data.count, this.currentScore);

        this.currentScore += score;
        this.currentMoves -= 1;
        console.log(this.currentMoves);
        this.movesDisplay.string = this.currentMoves;
        this.scoreDisplay.string = this.currentScore;
        this.progressDisplay.progress = this.currentScore / this.destinationScore;

        if (this.movesCount == 0 || this.currentScore >= this.destinationScore)
        {
            this.loadResultScene();
        }
        
    },

    loadResultScene()
    {
        cc.sys.localStorage.setItem("score", this.currentScore);
        cc.sys.localStorage.setItem("win", this.currentScore >= this.destinationScore);
 
        cc.director.loadScene("Result");
    }
});
