// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const BlockType = require("BlockType")

cc.Class({
    extends: cc.Component,

    properties: {
        tableRows: {
            type: cc.Integer,
            default: 10
        },
        tableCols: {
            type: cc.Integer,
            default: 10
        },
        tileSize: {
            type: cc.Integer,
            default: 50
        },
        blockPrefs: [cc.Prefab]
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this._grid = [];

        console.log("block", this.tableRows, this.tableCols);

        for (let row = 0; row < this.tableRows; row++)
        {
            this._grid[row] = [];

            for (let col = 0 ; col < this.tableCols; col++)
            {
                var newBlock = this.createBlockInGrid(col, row);

                newBlock.setPosition(cc.v2(col * this.tileSize, -row  * this.tileSize));
                console.log("Block coord", col * this.tileSize, -row  * this.tileSize);
            }
        }

        this.debugPrintGrid();
    },

    createBlockInGrid(x, y)
    {
        var newBlock = cc.instantiate(this.getBlockPref());
        var blockRef = newBlock.getComponent("Block");

        blockRef.init(this, x, y);
        this._grid[y][x] = blockRef;
        this.node.addChild(newBlock);
        
        return newBlock;
    },

    start () {
        
    },

    blockChosed(x, y)
    {
        console.log('block choosed', x, y);
        var block = this._grid[y][x];

        if (block)
        {
            var gridClone = this.gridCopy();
            gridClone[y][x] = null;
            var siblings = this.findBlockSiblings(x, y, block.getType(), gridClone);

            if (siblings.length > 0)
            {
                this.removeFromGrid(x, y);
                block.node.destroy();
                this._grid[y][x] = null;
                siblings.forEach(pos => { this.removeFromGrid(pos.x, pos.y); });
                this.debugPrintGrid();
                this.moveBlocks();
                this.debugPrintGrid();
            }
        }

        //this.debugVerifyGrid();
    },

    findBlockSiblings(x, y, type, grid)
    {
        var siblings = []

        console.log('Find TYPE:', type, x, y)

        if (x - 1 >= 0)
        {
            var sX = x - 1;
            var block = grid[y][sX];
            
            if (block)
            {
                console.log("leftBlock: type", block.getType(), sX, y);
            
                if (block.getType() == type)
                {
                    console.log("sibling", sX, y);
                    siblings.push(new cc.Vec2(sX, y));
                    grid[y][sX] = null;
                }
            }
        }

        if (x + 1 < this.tableCols)
        {
            var sX = x + 1;
            var block = grid[y][sX];

            if (block)
            {
                console.log("rightBlock: type", block.getType(), sX, y);

                if (block.getType() == type)
                {
                    console.log("sibling", sX, y)
                    siblings.push(new cc.Vec2(sX, y));
                    grid[y][sX] = null;
                }
            }         
        }

        if (y - 1 >= 0)
        {
            var sY = y - 1;
            var block = grid[sY][x];

            if (block)
            {
                console.log("upBlock: type", block.getType(), x, sY);

                if (block.getType() == type)
                {
                    console.log("sibling", x, sY)
                    siblings.push(new cc.Vec2(x, sY));
                    grid[sY][x] = null;
                }
            }        
        }
        
        if (y + 1 < this.tableRows)
        {
            var sY = y + 1;
            var block = grid[sY][x];

            if (block)
            {
                console.log("bottomBlock: type", block.getType(), x, sY);
                
                if (block.getType() == type)
                {
                    console.log("sibling", x, sY)
                    siblings.push(new cc.Vec2(x, sY));
                    grid[sY][x] = null;
                }
            }     
        }

        var newSiblings = [];

        for (var i = 0; i < siblings.length; i++)
        {
            newSiblings = [...newSiblings , ...(this.findBlockSiblings(siblings[i].x, siblings[i].y, type, grid))];
        }

        siblings = [...siblings, ...newSiblings];
        
        console.log(siblings);

        return siblings;
    },

    gridCopy() {
        var copy = [];

        for (var row in this._grid)
        {
            copy[row] = this._grid[row].slice(0);
        }

        return copy;
    },

    removeFromGrid(x, y)
    {
        this._grid[y][x].node.destroy();
        this._grid[y][x] = null;
    },

    moveBlocks()
    {
        for (var col = 0; col < this.tableCols; col++)
        {
            for (var row = 0; row < this.tableRows; row++)
            {
                if (this._grid[row][col] == null)
                {
                    for (var sRow = row + 1; sRow < this.tableRows; sRow++)
                    {
                        if (this._grid[sRow][col])
                        {
                            var duration = sRow - row;
                            var block = this._grid[sRow][col];
                            this._grid[row][col] = block;
                            this._grid[sRow][col] = null;
                            block.updatePosition(col, row);
                            block.node.runAction(new cc.moveTo(duration / 10, col * this.tileSize, - row * this.tileSize));
                            break;
                        }
                    }
                }
            }

            var spawnCounter = 0;

            for (var sRow  = 0; sRow < this.tableRows; sRow++ )
            {
                if (this._grid[sRow][col] != null)
                {
                    continue;
                }

                var duration = this.tableRows - sRow + spawnCounter;
                var block = this.createBlockInGrid(col, sRow);

                block.setPosition(cc.v2(col * this.tileSize, - (this.tableRows + spawnCounter)  * this.tileSize))
                console.log("BLOCK col:", col, sRow, "POS:", col * this.tileSize, - sRow * this.tileSize);
                block.runAction(new cc.moveTo(duration / 10, col * this.tileSize, - sRow * this.tileSize));
                spawnCounter++;
            }
        }
    },

    getBlockPref()
    {
        return this.blockPrefs[Math.floor(Math.random() * this.blockPrefs.length)];
    },

    debugPrintGrid()
    {
        for (var row =0; row < this.tableRows; row++)
        {
            console.log(this._grid[row].map(elem => { return elem ? elem.getType() : 'N'; }).join(" "));
        }
    },

    debugVerifyGrid()
    {
        for (var row = 0; row < this.tableRows; row++)
        {
            for (var col = 0; col < this.tableCols; col++)
            {
                var block = this._grid[row][col];

                if (block == null)
                {
                    continue;
                }

                var position = block.node.position;
                var blockPos = block.getPosition();

                if (Math.floor(position.x / this.tileSize) != blockPos.x || Math.abs(Math.floor(position.y / this.tileSize)) != blockPos.y)
                { 
                    console.log("Block mismatch", col, row, block, position.x, position.y, blockPos.x, block.y);  
                }

                if (col != blockPos.x || row != blockPos.y)
                { 
                    console.log("Block GRID mismatch", col, row, block, blockPos);  
                }
            }
        }
    }
    // update (dt) {},
});
