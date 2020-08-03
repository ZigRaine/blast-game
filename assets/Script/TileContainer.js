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

    onLoad ()
    {
        this._grid = [];

        for (var row = 0; row < this.tableRows; row++)
        {
            this._grid[row] = [];

            for (var col = 0 ; col < this.tableCols; col++)
            {
                var newBlock = this._createBlockInGrid(col, row);

                newBlock.setPosition(cc.v2(col * this.tileSize, -row  * this.tileSize));
            }
        }

        this._movesEnabled = true;
        this._enableTime = 0;

        this.debugPrintGrid();
    },

    start () {
        
    },

    update (dt)
    {
        if (!this._movesEnabled )
        {
            var currentTime = (new Date()).getTime();

            if (currentTime >= this._enableTime)
            {
                this._movesEnabled = true;
            }
        }
    },

    _createBlockInGrid(x, y)
    {
        var newBlock = cc.instantiate(this._getBlockPref());
        var blockRef = newBlock.getComponent("Block");
        
        blockRef.init(this, x, y);
        this._grid[y][x] = blockRef;
        this.node.addChild(newBlock);
        
        return newBlock;
    },

    blockChosed(x, y)
    {
        if (this._movesEnabled)
        {
            var choosedBlock = this._grid[y][x];

            if (choosedBlock)
            {
                var gridClone = this._gridCopy();
                
                gridClone[y][x] = null;

                var siblings = this._findGroup(choosedBlock, gridClone);
                
                var blockCount = siblings.length;

                if (blockCount > 0)
                {
                    this._disableTimeout(this.msToEnable);

                    this._removeFromGrid(choosedBlock);

                    siblings.forEach( sibling => { 
                        this._printBlockDebugInfo("Remove", sibling);
                        this._removeFromGrid(sibling); 
                    });
                    
                    var blockClickEvent = new cc.Event.EventCustom('SCORE_EVENT', true);
                    blockClickEvent.setUserData({count: blockCount + 1});
                    this.node.dispatchEvent(blockClickEvent);

                    this.debugPrintGrid();
                    this._moveBlocks();

                    if (!this.hasMoves())
                    {
                        this.node.dispatchEvent(new cc.Event.EventCustom('NO_MOVES_EVENT', true));   
                    }

                    this.debugPrintGrid();
                }
            }
        }
    },

    /// Use only grid copy, cause modifies grid
    _findSiblings(searchBlock, grid)
    {
        var siblings = [];
        var pos  = searchBlock.getPosition();
        var type = searchBlock.getType();

        this._printBlockDebugInfo("Sibling search", searchBlock);

        if (pos.x - 1 >= 0)
        {
            var sX = pos.x - 1;
            var block = grid[pos.y][sX];
            
            if (block)
            {
                this._printBlockDebugInfo("Sibling Left Block", block);
            
                if (block.getType() === type)
                {
                    this._printBlockDebugInfo("Find Sibling", block);
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
                this._printBlockDebugInfo("Sibling Right Block", block);

                if (block.getType() === type)
                {
                    this._printBlockDebugInfo("Find Sibling", block);
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
                this._printBlockDebugInfo("Sibling Up Block", block);

                if (block.getType() === type)
                {
                    this._printBlockDebugInfo("Find Sibling", block);
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
                this._printBlockDebugInfo("Sibling Bottom Block", block);
                
                if (block.getType() == type)
                {
                    this._printBlockDebugInfo("Find Sibling", block);
                    siblings.push(block);
                    grid[sY][pos.x] = null;
                }
            }     
        }

        return siblings;
    },

    _findGroup(block, grid)
    {
        var siblings = this._findSiblings(block, grid)

        var newSiblings = [];

        for (var i = 0; i < siblings.length; i++)
        {
            newSiblings = [...newSiblings , ...(this._findGroup(siblings[i], grid))];
        }

        siblings = [...siblings, ...newSiblings];

        return siblings;
    },

    _gridCopy() {
        var copy = [];

        for (var row in this._grid)
        {
            copy[row] = this._grid[row].slice(0);
        }

        return copy;
    },

    _removeFromGrid(block)
    {
        var pos = block.getPosition();
        block.node.destroy();
        this._grid[pos.y][pos.x] = null;
    },

    _moveBlocks()
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
                var block = this._createBlockInGrid(col, sRow);

                block.setPosition(cc.v2(col * this.tileSize, - (this.tableRows + spawnCounter)  * this.tileSize))
                block.runAction(new cc.moveTo(duration / 10, col * this.tileSize, - sRow * this.tileSize));
                spawnCounter++;
            }
        }
    },

    _getBlockPref()
    {
        return this.blockPrefs[this.getRandomInt(this.blockPrefs.length - 1)];
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

                if (block === null)
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

    _printBlockDebugInfo(message, block)
    {
        var pos = block.getPosition();
        
        console.log(message, `name: ${block.node.name} type: ${block.getType()} col: ${pos.x} row: ${pos.y}`);
    },

    hasMoves()
    {
        var grid = this._gridCopy();

        for (var row = 0; row < this.tableRows; row++)
        {
            for (var col = 0; col < this.tableCols; col++)
            {
                if (this._findSiblings(this._grid[row][col], grid).length > 0)
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
            for (var col = 0; col < this.tableCols; col++)
            {
                var block = this._grid[row][col];

                if (block)
                {
                    if ( Math.floor(block.node.position.x) != col * this.tileSize || Math.floor(block.node.position.y / this.tileSize) != - row * this.tileSize)
                    {
                        return false;
                    }
                }
            }
        }

        return true;
    },

    shuffle()
    {
        if (this._movesEnabled)
        {
            do
            {
                this._disableTimeout(50);
                this._shuffleGrid();
            }
            while(!this.hasMoves());
            
            this._disableTimeout(this.msToEnable);
            this._updateGridView();
        }
    },

    _shuffleGrid()
    {
        for (var row = 0; row < this.tableRows; row++)
        {
            for (var col = 0; col < this.tableCols; col++)
            {  
                
                var block = this._grid[row][col];

                if (block)
                {
                    var sX = this.getRandomInt(this.tableCols);
                    var sY = this.getRandomInt(this.tableRows);
                    var targetBlock = this._grid[sY][sX];
                    
                    if (targetBlock)
                    {
                        this._grid[sY][sX] = block;
                        this._grid[row][col] = targetBlock;
                        block.updatePosition(sX, sY);
                        targetBlock.updatePosition(col, row);
                    }
                }
            }
        }
    },

    _updateGridView()
    {
        for (var row = 0; row < this.tableRows; row++)
        {
            for (var col = 0; col < this.tableCols; col++)
            {  
                var block = this._grid[row][col];

                if (block)
                {
                    block.node.runAction(new cc.moveTo(0.2, col * this.tileSize, - row * this.tileSize));
                    //block.node.setPosition(col * this.tileSize, -row  * this.tileSize); 
                }
            }
        }
    },

    //max not included
    getRandomInt(max)
    {
        return Math.floor(Math.random() * Math.floor(max));
    },

    _disableTimeout(ms)
    {
        var enableTime = (new Date()).getTime() + ms;

        this._movesEnabled = false;

        if (enableTime > this._enableTime)
        {
            this._enableTime = enableTime;
        }
    }
});
