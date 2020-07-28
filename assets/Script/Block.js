// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,
    
    properties: {
        type: {
            default: 1,
            type: cc.Integer
        }
    },

    init: function (game, x, y) {
        this.game = game;
        this._x = x;
        this._y = y;
    },

    updatePosition(x, y)
    {
        this._x = x;
        this._y = y;
    },

    onLoad () {
        this.node.on(cc.Node.EventType.MOUSE_DOWN,
            (event) => {
                console.log('Mouse down');
                this.game.blockChosed(this._x, this._y);
            },
            this);
    },

    start () {

    },

    getType() 
    {
        return this.type;
    },

    getPosition()
    {
        return new cc.Vec2(this._x, this._y);
    },
    
    isOnPosition()
    {

    }
    // update (dt) {},
});
