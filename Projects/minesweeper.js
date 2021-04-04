(function() {

    function InitGame(rootId){
        //Setup and Get Data from API
        var scopeGame = {
            width: 10,
            height: 10,
            minesPosition: [9, 15, 33, 62, 70, 79, 80],
            redFlagsPosition: [],
            questionMarksPosition: [],
            bombsPosition: [],
            IsGameOver: IsGameOver,
            cellSize: 50,
            offsetSpace: 12,
            STATUS_CELL: {
                NORMAL: 'normal',
                RED_FLAG: 'flag',
                QUESTION_MARK: 'qmark',
                BOMB: 'bomb'
            }
        }

        //Create the puzzle
        var cells = CreateCells(scopeGame.width, scopeGame.height, scopeGame.cellSize, scopeGame.minesPosition, scopeGame.redFlagsPosition, scopeGame.questionMarksPosition, scopeGame.bombsPosition);

        //Render puzzle HTML
        RenderPuzzle(scopeGame.width, scopeGame.height, cells, scopeGame.cellSize, scopeGame.offsetSpace, rootId);


        function playCell(cell)
        {
            cell.isOpened = true;

            if(cell.hasMine)
            {
                cell.updateStatus(cell.status, scopeGame.STATUS_CELL.BOMB)
                scopeGame.bombsPosition.push(cell.index);
            }else{
                cell.updateStatus(cell.status, 'cellPlayed')
            }
        }

        function OnclickListener(cell, isRightClick) {
            console.log(cell.index);
            if(cell.isOpened || scopeGame.IsGameOver())
                return;

            if(isRightClick)
            {
                //change cell status
                cell.toggleStatus();
            }else if(cell.status != scopeGame.STATUS_CELL.RED_FLAG){
                //Check if is not Bomb then, open contiguos cells
                playCell(cell);
            }
        }

        function IsGameOver()
        {
            return scopeGame.bombsPosition.length > 0;
        }

        function RenderPuzzle(w, h, cells, cellSize, offsetSpace, rootId){
            var containerElement = document.createElement('div');
            containerElement.oncontextmenu = function() {return false;}
            containerElement.className = 'gameContainer';
            containerElement.style.width = (w * cellSize) + (offsetSpace * w) + offsetSpace + 'px';
            containerElement.style.height = (h * cellSize) + (offsetSpace * h) + offsetSpace + 'px';

            for(var j = 0; j < h; j++)
            {
                for(var i = 0; i < w; i++)
                {
                    var index = w * j + i;
                    var cell = cells[index];
                    var cellDiv = cell.createHTML(i, j, offsetSpace, OnclickListener);
                    containerElement.appendChild(cellDiv);
                }
            }

            var rootElement = document.getElementById(rootId);
            while (rootElement.firstChild != null) {
                rootElement.removeChild(rootElement.firstChild);
            }
            rootElement.appendChild(containerElement);
        }

        function CreateCells(w, h, cellSize, minesPosition, redFlagsPosition, questionMarksPosition, bombsPosition){
            var cellsArray = new Array();
            for(var i = 0; i < w*h; i++)
            {
                var cell = new Cell(i, cellSize);
                if(minesPosition.indexOf(i) >= 0){
                    cell.hasMine = true;
                }

                if(redFlagsPosition.indexOf(i) >= 0){
                    cell.status = scopeGame.STATUS_CELL.RED_FLAG;
                }

                if(questionMarksPosition.indexOf(i) >= 0){
                    cell.status = scopeGame.STATUS_CELL.QUESTION_MARK;
                }

                if(bombsPosition.indexOf(i) >= 0){
                    cell.status = scopeGame.STATUS_CELL.BOMB;
                }

                cellsArray[i] = cell;
            }
            return cellsArray;
        }

        function Cell(_index, _size){
            var scopeCell = {
                index: _index,
                xPos: 0,
                yPos: 0,
                hasMine: false,
                isOpened: false,
                size: _size,
                status: scopeGame.STATUS_CELL.NORMAL,
                html: null,
                createHTML: CreateHTML,
                toggleStatus: ToggleStatus,
                updateStatus: UpdateStatus
            }
            return scopeCell;

            function CreateHTML(x, y, offset, onclickListener){
                scopeCell.xPos = x;
                scopeCell.yPos = y;
                var div = document.createElement('div');
                scopeCell.html = div;
                if(scopeCell.hasMine){
                    div.innerHTML = '+'+scopeCell.index;
                }
                div.classList.add('cell', scopeGame.STATUS_CELL.NORMAL);
                div.style.cursor = 'pointer';
                div.oncontextmenu = function(e) {
                    onclickListener(scopeCell, true);
                    return false;
                }
                div.onclick = function(e){
                    onclickListener(scopeCell, false);
                };
                div.style.width = div.style.height = scopeCell.size + 'px';
                div.style.left = (scopeCell.size + offset) * scopeCell.xPos + offset + 'px';
                div.style.top = (scopeCell.size + offset) * scopeCell.yPos + offset + 'px';
                UpdateStatus(null, scopeCell.status);

                return div;
            }

            function ToggleStatus(){
                var previousState = scopeCell.status;
                var newState = null;
                switch(scopeCell.status)
                {
                    case scopeGame.STATUS_CELL.NORMAL:
                        newState = scopeGame.STATUS_CELL.RED_FLAG;
                        break;
                    case scopeGame.STATUS_CELL.RED_FLAG:
                        newState = scopeGame.STATUS_CELL.QUESTION_MARK;
                        break;
                    case scopeGame.STATUS_CELL.QUESTION_MARK:
                        newState = scopeGame.STATUS_CELL.NORMAL;
                        break;
                    default:
                        previousState = '';
                }
                UpdateStatus(previousState, newState);
            }

            function UpdateStatus(previousState, newState)
            {
                if(previousState != null){
                    scopeCell.html.classList.remove(previousState);
                }
                scopeCell.html.classList.add(newState);
                scopeCell.status = newState;
            }
        }
    }
    window.onload = function(){ InitGame("game"); }
})();