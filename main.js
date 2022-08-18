//----------Constants----------//
const UPADTE_SPEED = 10

const GridColors = {
    black: 0,
    green: 1,
    redSource: 2,
    redTarget: 3,
    empty: 4,
    playerinput: 5
}

//--------------letiables--------------//
let GRID_SIZE = 40

let canvas = document.querySelector(".algGrid")
let context = canvas.getContext("2d")
topSize = document.querySelector("header").offsetHeight

let gridWidth = window.innerWidth
let gridHeight = window.innerHeight-topSize
let pressingRIght = false
let pressingLeft = false
let moveRedSource = false
let moveRedTarget = false
let gameStarted = false
let gameOver = false
let algRunning = false

let arrWidth = Math.ceil(gridWidth/GRID_SIZE)
if ((gridWidth%GRID_SIZE) <= 2 && (gridWidth%GRID_SIZE) != 0) --arrWidth
let arrHeight = Math.ceil(gridHeight/GRID_SIZE)
if ((gridHeight%GRID_SIZE) <= 2 && (gridHeight%GRID_SIZE) != 0) --arrHeight

let matrix = []

//--------------Functions--------------//

function emptyMatrix(){
    for (let i = 0; i < arrWidth; i++){
        matrix[i] = []
        for (let j = 0; j < arrHeight; j++)
        matrix[i][j] = GridColors.empty
    }
}

function closestCord(cord){
    return cord-cord%GRID_SIZE+1
}

function toMatrixCords(cord){
    return Math.floor(cord/GRID_SIZE)
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function gcToCollorCodes(gc){
    switch(gc){
        case 0:
            return 'black'
        case 1:
            return 'green'
        case 2:
        case 3:
            return 'red'
        case 4:
            return 'white'
    }
}

async function drawMatrix(){
    sleep(10)
    for (let i = 0; i < arrWidth; i++)
        for(let j = 0; j < arrHeight; j++){
            context.beginPath()
            context.fillStyle = gcToCollorCodes(matrix[i][j]);
            context.rect(i*GRID_SIZE+1, j*GRID_SIZE+1, GRID_SIZE-1, GRID_SIZE-1)
            context.fill()

            if (matrix[i][j] == GridColors.redSource || matrix[i][j] == GridColors.redTarget){
                context.fillStyle = "black"
                context.font = GRID_SIZE + "px Arial"
                context.fillText(matrix[i][j] == GridColors.redSource? "S" : "T", i*GRID_SIZE+GRID_SIZE/6+1, j*GRID_SIZE+GRID_SIZE-GRID_SIZE/7+1)
            }
        }
}

function drawSquareEv(event) {
    let mx = toMatrixCords(event.clientX), my = toMatrixCords(event.clientY-topSize)
    if (matrix[mx][my] == GridColors.empty){
        context.beginPath()
        context.fillStyle = "black"
        matrix[mx][my] = GridColors.black
        context.rect(closestCord(event.clientX), closestCord(event.clientY-topSize), GRID_SIZE-1, GRID_SIZE-1)
        context.fill()
    }
}

function removeSquareEv(event) {
    let mx = toMatrixCords(event.clientX), my = toMatrixCords(event.clientY-topSize)
    if (matrix[mx][my] == GridColors.black){
        context.beginPath()
        context.fillStyle = "white"
        matrix[mx][my] = GridColors.empty
        context.rect(closestCord(event.clientX), closestCord(event.clientY-topSize), GRID_SIZE-1, GRID_SIZE-1)
        context.fill()
    }
}

function drawBoard(){
    let p = 0;
    for (let x = 0; x <= gridWidth; x += GRID_SIZE) {
        context.moveTo(0.5 + x + p, p)
        context.lineTo(0.5 + x + p, gridHeight + p)
    }
    for (let x = 0; x <= gridHeight; x += GRID_SIZE) {
        context.moveTo(p, 0.5 + x + p)
        context.lineTo(gridWidth + p, 0.5 + x + p)
    }
    context.strokeStyle = "black"
    context.stroke()
}

function moveRedEv(event, isSource){
    drawBoard()
    drawMatrix()
    context.beginPath()
    context.fillStyle = "red"
    context.rect(event.clientX, event.clientY-topSize, GRID_SIZE-1, GRID_SIZE-1)
    context.fill()

    context.fillStyle = "black"
    context.font = GRID_SIZE + "px Arial"
    context.fillText(isSource? "S" : "T" , event.clientX+GRID_SIZE/6,event.clientY+GRID_SIZE-GRID_SIZE/7-topSize)
}

function drawSquare(posx, posy, color = "black", greenVal){
    let mx = toMatrixCords(posx), my = toMatrixCords(posy)
    if (matrix[mx][my] != GridColors.redTarget && matrix[mx][my] != GridColors.redSource){
        context.beginPath()
        context.fillStyle = color;
        if (color == "black") matrix[mx][my] = GridColors.black
        if (color == "green") matrix[mx][my] = greenVal
        if (color == "white") matrix[mx][my] = GridColors.empty
        context.rect(closestCord(posx), closestCord(posy), GRID_SIZE-1, GRID_SIZE-1)
        context.fill()
    }
}

function resizeEvent(){
    returnHeader()
    context.clearRect(0, 0, canvas.width, canvas.height)
    canvas.height = 0
    topSize = document.querySelector("header").offsetHeight

    gridWidth = window.innerWidth
    gridHeight = window.innerHeight-topSize
    canvas.width = gridWidth
    canvas.height = gridHeight
    arrWidth = Math.ceil(gridWidth/GRID_SIZE)
    if ((gridWidth%GRID_SIZE) <= 2 && (gridWidth%GRID_SIZE) != 0) --arrWidth
    arrHeight = Math.ceil(gridHeight/GRID_SIZE)
    if ((gridHeight%GRID_SIZE) <= 2 && (gridHeight%GRID_SIZE) != 0) --arrHeight
    emptyMatrix()
    cleanBoard()
    closeOverlay()
}

async function drawShortestPath(targetcords){
    const dl = [-1, 0, 1, 0]
    const dc = [ 0, 1, 0,-1]
    let i = targetcords.x , j =targetcords.y, smallest = 100000
    let i1 = 0, j1 = 0
    while(matrix[i][j] != GridColors.redSource){
        for(let k = 0; k < 4; ++k){
            if( (i+dl[k]) < arrWidth && (j+dc[k]) < arrHeight && (j+dc[k]) >= 0 && (i+dl[k]) >= 0)
                if(smallest > matrix[i+dl[k]][j+dc[k]] && matrix[i+dl[k]][j+dc[k]] > 5 || matrix[i+dl[k]][j+dc[k]] == GridColors.redSource){
                smallest = matrix[i+dl[k]][j+dc[k]]
                i1 = i+dl[k]
                j1 = j+dc[k]
            }
        }
        i=i1
        j=j1
        await sleep(UPADTE_SPEED)
        drawSquare(i*GRID_SIZE, j*GRID_SIZE, "#FFBF46")
    }
}

async function LaunchAlg(){
    algRunning = true
    let playerLength = 0
    if (gameOver)  {
        playerLength = countPlayerPath()
    }
    let targetCords
    let q
    for (let i = 0; i < arrWidth; i++)
        for (let j = 0; j < arrHeight; j++){
            if (matrix[i][j] == GridColors.redSource) q = [{x: i,y: j, dist: 0}]
            if (matrix[i][j] == GridColors.redTarget) targetCords = {x: i, y: j}
        }
    const dl = [-1, 0, 1, 0]
    const dc = [ 0, 1, 0,-1]

    let node
    while(!(q.length === 0)){
        node = q[0]
        q.shift()
        if (node.x == targetCords.x && node.y == targetCords.y){
            drawShortestPath(targetCords)
            if (gameOver) {
                document.querySelector(".overlayText").addEventListener("click", endGame)
                document.querySelector(".grayBG").addEventListener("click", endGame)
                playerLength++
                if (node.dist < playerLength) poupMessage("you lost!<br>found lenght: " + node.dist + "<br>playerLength: " + playerLength)
                else poupMessage("you win!<br>found lenght: "+ node.dist + "<br>player length: " + playerLength)
            }
            else {
                poupMessage("minimal Distance: " + node.dist)
                document.querySelector(".overlayText").addEventListener("click", cleanBoard)
                document.querySelector(".grayBG").addEventListener("click", cleanBoard)
            }
            algRunning = false
            return
        }
        for (let i = 0; i < 4; i++){
            let row = node.x+dl[i]
            let col = node.y+dc[i]
            if (row >= 0 && col >= 0 && row < arrWidth && col < arrHeight && matrix[row][col] > GridColors.green && matrix[row][col] < 6){
                await sleep(UPADTE_SPEED)
                drawSquare(row*GRID_SIZE ,col*GRID_SIZE , "green", node.dist+6)
                q.push({x: row, y: col, dist: (node.dist+1)})
            }
        }
    }
    poupMessage("Path not found")
    document.querySelector(".overlayText").addEventListener("click", cleanBoard)
    document.querySelector(".grayBG").addEventListener("click", cleanBoard)
    algRunning = false
}

function endGame(){
    returnHeader()
    resizeEvent()
    gameOver = false
    gameStarted = false
    pressingLeft = false
    pressingRIght = false
    document.querySelector(".overlayText").removeEventListener("click",endGame)
    document.querySelector(".grayBG").removeEventListener("click",endGame)
}

function poupMessage(text){
    let p = document.querySelector(".overlayText")
    p.classList.remove("hidden")
    p.innerHTML = text
    document.querySelector(".grayBG").classList.remove("hidden")
}

function drawRed(posX, posY, SorT){
    let mx = toMatrixCords(posX), my = toMatrixCords(posY)
    while (matrix[mx][my] == GridColors.redSource || matrix[mx][my] == GridColors.redTarget){
        if (posX+GRID_SIZE < gridWidth) ++mx
        else if(posY+GRID_SIZE < gridHeight) ++my
        else if(posX+GRID_SIZE > gridWidth) --mx
    }
    matrix[mx][my] = SorT
    context.beginPath()
    context.fillStyle = "red"
    context.rect(closestCord(posX), closestCord(posY), GRID_SIZE-1, GRID_SIZE-1)
    context.fill()
    
    context.fillStyle = "black"
    context.font = GRID_SIZE + "px Arial"
    context.fillText(SorT == GridColors.redSource? "S" : "T", closestCord(posX)+GRID_SIZE/6, closestCord(posY)+GRID_SIZE-GRID_SIZE/7)
}

function cleanBoard(){
    emptyMatrix()
    context.clearRect(0, 0, canvas.width, canvas.height)
    drawBoard()
    drawRed(gridWidth/2, gridHeight/2-topSize, GridColors.redTarget)
    drawRed(0,0, GridColors.redSource)

    //meh
    document.querySelector(".overlayText").removeEventListener("click",cleanBoard)
    document.querySelector(".grayBG").removeEventListener("click",cleanBoard)
}

function dificultySelector(){
    document.querySelector(".GameMessage").classList.remove("hidden")
    document.querySelector(".grayBG").classList.remove("hidden")
}

function closeOverlay(){
    el = document.getElementsByClassName("overlayEl")
    for (let i = 0; i < el.length; ++i)
        el[i].classList.add("hidden")
}

function removeHeader(){
    topSize = 0;
    document.querySelector("header").classList.add("hidden")
    document.querySelector("a.menu__icon").classList.add("hidden")
}

function returnHeader(){
    topSize = document.querySelector("header").offsetHeight
    document.querySelector("header").classList.remove("hidden")
    document.querySelector("a.menu__icon").classList.remove("hidden")
}

async function addInnerWalls(h, minX, maxX, minY, maxY) {
    if (h) {
        if (maxX - minX < 2)  return
        
        let y = Math.floor(randomNumber(minY, maxY)/2)*2
        if (!gameStarted) await sleep(UPADTE_SPEED*4)
        addHWall(minX, maxX, y)

        addInnerWalls(!h, minX, maxX, minY, y-1)
        addInnerWalls(!h, minX, maxX, y + 1, maxY)
    } else {
        if (maxY - minY < 2) return
        
        let x = Math.floor(randomNumber(minX, maxX)/2)*2
        if (!gameStarted) await sleep(UPADTE_SPEED*4)
        addVWall(minY, maxY, x)

        addInnerWalls(!h, minX, x-1, minY, maxY)
        addInnerWalls(!h, x + 1, maxX, minY, maxY)
    }
}

function addHWall(minX, maxX, y) {
    let hole = Math.floor(randomNumber(minX, maxX)/2)*2+1
    for (let i = minX; i <= maxX; i++) {
        if (i == hole) drawSquare(y*GRID_SIZE,i*GRID_SIZE, "white")
        else drawSquare(y*GRID_SIZE,i*GRID_SIZE, "black")
    }
}

function addVWall(minY, maxY, x) {
    let hole = Math.floor(randomNumber(minY, maxY)/2)*2+1
    for (let i = minY; i <= maxY; i++) {
        if (i == hole) drawSquare(i*GRID_SIZE,x*GRID_SIZE, "white")
        else drawSquare(i*GRID_SIZE,x*GRID_SIZE, "black")
    }
}

function randomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
}

function hasAdjiecentPath(x ,y , gcol){
    const dl = [-1, 0, 1, 0]
    const dc = [ 0, 1, 0,-1]
    for (let i = 0; i < 4; ++i)
        if (x+dl[i] < arrWidth && x+dl[i] >= 0 && y+dc[i] < arrHeight && y+dc[i] >= 0)
            if(matrix[x+dl[i]][y+dc[i]] == gcol || matrix[x+dl[i]][y+dc[i]] == GridColors.redSource) 
                return true
    return false
}

function countPlayerPath(){
    let count = 0
    for(let i = 0; i < arrWidth; ++i)
        for(let j = 0; j < arrHeight; ++j)
            if(matrix[i][j] == GridColors.playerinput) 
                ++count
    return count
}

function generateLabirint(){
    emptyMatrix()
    context.clearRect(0, 0, canvas.width, canvas.height)
    drawBoard()
    addInnerWalls(true , 0 , arrHeight-1, 0 , arrWidth-1)

    drawRed(gridWidth-GRID_SIZE-2, gridHeight-GRID_SIZE-2, GridColors.redTarget)
    drawRed(GRID_SIZE+2, 1, GridColors.redSource)
}

function startGame(){
    gameStarted = true
    topSize = 0
    closeOverlay()
    poupMessage("Please draw the shortest path")
    removeHeader()
    switch(document.querySelector("select").value){
    case "easy":
        $(".slider")[0].value = '80'
        $(".slider")[1].value = '80'
        GRID_SIZE = 80
        break
    case "medium":
        $(".slider")[0].value = '60'
        $(".slider")[1].value = '60'
        GRID_SIZE = 60
        break
    case "hard":
        $(".slider")[0].value = '40'
        $(".slider")[1].value = '40'
        GRID_SIZE = 40
        break
    }

    gridWidth = window.innerWidth
    gridHeight = window.innerHeight
    canvas.width = gridWidth
    canvas.height = gridHeight
    arrWidth = Math.ceil(gridWidth/GRID_SIZE)
    if ((gridWidth%GRID_SIZE) <= 2 && (gridWidth%GRID_SIZE) != 0) --arrWidth
    arrHeight = Math.ceil(gridHeight/GRID_SIZE)
    if ((gridHeight%GRID_SIZE) <= 2 && (gridHeight%GRID_SIZE) != 0) --arrHeight
    
    generateLabirint()
}

function drawPlayerPathEv(event){
    let mx = toMatrixCords(event.clientX), my = toMatrixCords(event.clientY)
    if (hasAdjiecentPath(mx, my, GridColors.playerinput)){
        if (matrix[mx][my] == GridColors.redTarget){
            gameOver = true
            LaunchAlg()
        } else if (matrix[mx][my] == GridColors.empty){
            context.beginPath()
            context.fillStyle = "#FFBF46"
            matrix[mx][my] = GridColors.playerinput
            context.rect(closestCord(event.clientX), closestCord(event.clientY), GRID_SIZE-1, GRID_SIZE-1)
            context.fill()
        }
    }
}

function inv(val){
    return val == -1? 1: val == 1? -1 : 2 
}

async function recursiveRRP(x, y, prevDirX, prevDirY){
    const dl = [-1, 0, 1, 0]
    const dc = [ 0, 1, 0,-1]
    let adjCount = 0
    for (let i = 0; i < 4; ++i){
        if ((dc[i] != inv(prevDirX) && dl[i] != inv(prevDirY)) && matrix[dc[i]+x][dl[i]+y] == GridColors.playerinput) recursiveRRP(dc[i]+x, dl[i]+y, dc[i], dl[i])    
        if (matrix[dc[i]+x][dl[i]+y] == GridColors.playerinput || matrix[dc[i]+x][dl[i]+y] == GridColors.redSource) ++adjCount
    }
    if (adjCount == 1) drawSquare(x*GRID_SIZE,y*GRID_SIZE, "white")
}

function removePlayerPath(x, y){
    const dl = [-1, 0, 1, 0]
    const dc = [ 0, 1, 0,-1]
    for (let i = 0; i < 4; ++i)
        if(matrix[dc[i]+x][dl[i]+y] == GridColors.playerinput)
            recursiveRRP(dc[i]+x, dl[i]+y, dc[i], dl[i])
    drawSquare(x*GRID_SIZE,y*GRID_SIZE, "white")
}

function displayInfo(){
    document.querySelector(".infoTab").classList.remove("hidden")
    document.querySelector(".grayBG").classList.remove("hidden")
}

//------------event Listeners------------//

$(document).ready(function(){
    $(window).scrollTop(0);
})

window.onbeforeunload = function(){
    resizeEvent()
}

$(".slider")[0].oninput = function(){
    GRID_SIZE = Math.ceil(this.value)
    arrWidth = Math.ceil(gridWidth/GRID_SIZE)
    if ((gridWidth%GRID_SIZE) <= 2 && (gridWidth%GRID_SIZE) != 0) --arrWidth
    arrHeight = Math.ceil(gridHeight/GRID_SIZE)
    if ((gridHeight%GRID_SIZE) <= 2 && (gridHeight%GRID_SIZE) != 0) --arrHeight
    cleanBoard()
}

$(".slider")[1].oninput = function(){
    GRID_SIZE = Math.ceil(this.value)
    arrWidth = Math.ceil(gridWidth/GRID_SIZE)
    if ((gridWidth%GRID_SIZE) <= 2 && (gridWidth%GRID_SIZE) != 0) --arrWidth
    arrHeight = Math.ceil(gridHeight/GRID_SIZE)
    if ((gridHeight%GRID_SIZE) <= 2 && (gridHeight%GRID_SIZE) != 0) --arrHeight
    cleanBoard()
}

document.addEventListener('contextmenu', function(e){
    e.preventDefault();
}, false);

canvas.addEventListener("mouseup", function stop(event){
    pressingRIght = false
    pressingLeft = false
    if (moveRedSource){
        drawRed(event.clientX , event.clientY-topSize ,GridColors.redSource)
        drawBoard()
        drawMatrix()
        moveRedSource = false
    }
    if (moveRedTarget){
        drawRed(event.clientX , event.clientY-topSize ,GridColors.redTarget)
        drawBoard()
        drawMatrix()
        moveRedTarget = false
    }
}, false)

$('.algGrid').mousedown(function(event) {
    let mx = toMatrixCords(event.clientX)
    if (!gameStarted){
        let my = toMatrixCords(event.clientY-topSize)
        switch(event.which) {
            case 1:
                switch (matrix[mx][my]){
                case GridColors.redSource:
                    if (!algRunning){
                        matrix[mx][my] = GridColors.empty
                        moveRedSource = true
                    }
                    break
                case GridColors.redTarget:
                    if (!algRunning){
                        matrix[mx][my] = GridColors.empty
                        moveRedTarget = true
                    }
                    break
                default:
                    drawSquareEv(event)
                    pressingRIght = true
                    break
                }
                break
            case 3:
                removeSquareEv(event)
                pressingLeft = true
            break
        }
    }
    else{
        if (!gameOver){
            let  my = toMatrixCords(event.clientY+1.5)
            switch(event.which) {
                case 1:
                    switch(matrix[mx][my]){
                        case GridColors.empty:
                        case GridColors.redTarget:
                        case GridColors.playerinput:
                            drawPlayerPathEv(event)
                            pressingRIght = true
                        break
                    }
                    break
                case 3:
                    if (matrix[mx][my] == GridColors.playerinput) {
                        removePlayerPath(mx, my)
                        pressingLeft = true
                    }
                    break
            }
        }
    }
});

window.onresize = resizeEvent

canvas.addEventListener("mousemove", function (event) {
    if (!gameStarted){
        if (pressingRIght) drawSquareEv(event)
        if (pressingLeft) removeSquareEv(event)
        if (moveRedSource) moveRedEv(event, true)
        if (moveRedTarget) moveRedEv(event, false)
    }
    else{
        if(!gameOver){
            if(pressingRIght) drawPlayerPathEv(event)
            if(pressingLeft){
                let mx = toMatrixCords(event.clientX), my = toMatrixCords(event.clientY)
                if (matrix[mx][my] == GridColors.playerinput) removePlayerPath(mx, my)
            }
        }
    }
},false)

//------------------------------------------

$(document).ready(function() {
    $('.menu__icon').click(function(){
        $('body').toggleClass('menu_shown')
        closeOverlay()
    })

    $('.LaunchAlg').click(function(){
        $('body').toggleClass('menu_shown')
        LaunchAlg()
    })

    $('.genLab').click(function(){
        $('body').toggleClass('menu_shown')
        generateLabirint()
    })

    $('.clBd').click(function(){
        $('body').toggleClass('menu_shown')
        cleanBoard()
    })

    $('.startDaGAME').click(function(){
        $('body').toggleClass('menu_shown')
        dificultySelector()
    })

    $('.dispInfo').click(function(){
        displayInfo()
    })

    canvas.height = 0
    topSize = document.querySelector("header").offsetHeight
    gridHeight = window.innerHeight-topSize

    $(".slider")[0].value = '40'
    $(".slider")[1].value = '40'
    canvas.width = gridWidth
    canvas.height = gridHeight
    drawBoard()
    emptyMatrix()
    returnHeader()
    $(window).scrollTop(0);
    
    drawRed(gridWidth/2, gridHeight/2-topSize, GridColors.redTarget)
    drawRed(0, 0, GridColors.redSource)
})