// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

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
        msToEnable: {
            type: cc.Integer,
            default: 1
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

        this.movesEnabled = true;
        this.disableTime = 0;

        this.debugPrintGrid();
    },

    start () {
        
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

    blockChosed(x, y)
    {
        if (this.movesEnabled)
        {
            console.log('block choosed', x, y);
            var choosedBlock = this._grid[y][x];

            if (choosedBlock)
            {
                var gridClone = this.gridCopy();
                
                gridClone[y][x] = null;

                var siblings = this.findGroup(choosedBlock, gridClone);
                
                var blockCount = siblings.length;

                if (blockCount > 0)
                {
                    this.movesEnabled = false;
                    this.disableTime = (new Date()).getTime();

                    this.removeFromGrid(choosedBlock);

                    siblings.forEach( sibling => { 
                        this.printBlockDebugInfo("Remove", sibling);
                        this.removeFromGrid(sibling); 
                    });
                    
                    var blockClickEvent = new cc.Event.EventCustom('TEST_EVENT', true);
                    blockClickEvent.setUserData({count: blockCount + 1});
                    this.node.dispatchEvent(blockClickEvent);


                    this.debugPrintGrid();
                    this.moveBlocks();
                    this.debugPrintGrid();
                }
            }
        }

        //this.debugVerifyGrid();
    },

    findSiblings(searchBlock, grid)
    {
        var siblings = [];
        var pos  = searchBlock.getPosition();
        var type = searchBlock.getType();

        this.printBlockDebugInfo("Sibling search", searchBlock);

        if (pos.x - 1 >= 0)
        {
            var sX = pos.x - 1;
            var block = grid[pos.y][sX];
            
            if (block)
            {
                this.printBlockDebugInfo("Sibling Left Block", block);
            
                if (block.getType() == type)
                {
                    this.printBlockDebugInfo("Find Sibling", block);
                    siblings.push(block);
                    grid[pos.y][sX] = null;
                }
            }
        }

        if (pos.x + 1 < this.tableCols)
        {
            var sX = pos.x + 1;
            var block = grid[pos.y][sX];

            if (block)
            {
                this.printBlockDebugInfo("Sibling Right Block", block);

                if (block.getType() == type)
                {
                    this.printBlockDebugInfo("Find Sibling", block);
                    siblings.push(block);
                    grid[pos.y][sX] = null;
                }
            }         
        }

        if (pos.y - 1 >= 0)
        {
            var sY = pos.y - 1;
            var block = grid[sY][pos.x];

            if (block)
            {
                this.printBlockDebugInfo("Sibling Up Block", block);

                if (block.getType() == type)
                {
                    this.printBlockDebugInfo("Find Sibling", block);
                    siblings.push(block);
                    grid[sY][pos.x] = null;
                }
            }        
        }
        
        if (pos.y + 1 < this.tableRows)
        {
            var sY = pos.y + 1;
            var block = grid[sY][pos.x];

            if (block)
            {
                this.printBlockDebugInfo("Sibling Bottom Block", block);
                
                if (block.getType() == type)
                {
                    this.printBlockDebugInfo("Find Sibling", block);
                    siblings.push(block);
                    grid[sY][pos.x] = null;
                }
            }     
        }

        return siblings;
    },

    findGroup(block, grid)
    {
        var siblings = this.findSiblings(block, grid)

        var newSiblings = [];

        for (var i = 0; i < siblings.length; i++)
        {
            newSiblings = [...newSiblings , ...(this.findGroup(siblings[i], grid))];
        }

        siblings = [...siblings, ...newSiblings];

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

    removeFromGrid(block)
    {
        var pos = block.getPosition();
        block.node.destroy();
        this._grid[pos.y][pos.x] = null;
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
                console.log("Blocks col:", col, sRow, "POS:", col * this.tileSize, - sRow * this.tileSize);
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
    },

    printBlockDebugInfo(message, block)
    {
        var pos = block.getPosition();
        
        console.log(message, `name: ${block.node.name} type: ${block.getType()} col: ${pos.x} row: ${pos.y}`);
    },

    hasMoves()
    {
        for (var row = 0; row < this.tableRows; row++)
        {
            for (var col = 0; col > this.tableCols; col++)
            {
                if (this.findSiblings(this._grid[row][col]).length > 0)
                {
                    return true;
                }
            }
        }

        return false;
    },

    isTilesOnPlaces()
    {
        for (var row = 0; row < this.tableRows; row++)
        {
            for (var col = 0; col > this.tableCols; col++)
            {
                var block = this._grid[row][col];

                if (block)
                {
                    if ( floor(lock.node.position.x) != col * this.tileSize || floor(lock.node.position.y / this.tileSize) != - row * this.tileSize)
                    {
                        return false;
                    }
                }
            }
        }

        return true;
    },

    update (dt)
    {
        if (!this.movesEnabled )
        {
            var currentTime = (new Date()).getTime();

            if (currentTime >= this.disableTime +  this.msToEnable)
            {
                var result = this.isTilesOnPlaces();

                this.movesEnabled = true;
                console.log(`Moves enabled`)
            }
        }
    },
});
