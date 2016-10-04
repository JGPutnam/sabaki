const {ipcRenderer, clipboard, shell} = require('electron')
const view = require('./view')
const setting = require('../modules/setting')

let menudata = {
    newfile: () => sabaki.newFile(true),
    newwindow: () => ipcRenderer.send('new-window'),
    loadfile: () => sabaki.loadFile(),
    savefile: () => sabaki.saveFile(view.getRepresentedFilename()),
    saveas: () => sabaki.saveFile(),
    loadclipboard: () => sabaki.loadFileFromSgf(
        clipboard.readText(),
        false,
        () => view.setRepresentedFilename(null)
    ),
    copytoclipboard: () => clipboard.writeText(sabaki.saveFileToSgf()),
    copyascii: () => clipboard.writeText(sabaki.getBoard().generateAscii()),
    managegames: () => view.showGameChooser(),
    score: () => view.setScoringMode(true),
    estimate: () => view.setEstimatorMode(true),
    gameinfo: () => view.showGameInfo(),
    preferences: () => view.showPreferences(),

    editmode: () => view.setEditMode(!view.getEditMode()),
    clearmarkup: () => sabaki.clearMarkup(),
    stonetool: () => sabaki.setSelectedTool('stone'),
    crosstool: () => sabaki.setSelectedTool('cross'),
    triangletool: () => sabaki.setSelectedTool('triangle'),
    squaretool: () => sabaki.setSelectedTool('square'),
    circletool: () => sabaki.setSelectedTool('circle'),
    linetool: () => sabaki.setSelectedTool('line'),
    labeltool: () => sabaki.setSelectedTool('label'),
    numbertool: () => sabaki.setSelectedTool('number'),
    pass: () => sabaki.makeMove([-1, -1]),
    resign: () => sabaki.makeResign(),
    removenode: () => sabaki.removeNode(...sabaki.getCurrentTreePosition()),
    makemainvariation: () => sabaki.makeMainVariation(...sabaki.getCurrentTreePosition()),

    findmode: () => view.setFindMode(!view.getFindMode()),
    findnext: () => {
        view.setFindMode(true)
        sabaki.findMove(view.getIndicatorVertex(), view.getFindText(), 1)
    },
    findprevious: () => {
        view.setFindMode(true)
        sabaki.findMove(view.getIndicatorVertex(), view.getFindText(), -1)
    },
    togglehotspot: () => sabaki.setHotspot(!sabaki.getHotspot()),
    nexthotspot: () => sabaki.findBookmark(1),
    previoushotspot: () => sabaki.findBookmark(-1),

    goback: () => sabaki.goBack(),
    goforward: () => sabaki.goForward(),
    gotopreviousfork: () => sabaki.goToPreviousFork(),
    gotonextfork: () => sabaki.goToNextFork(),
    nextcomment: () => sabaki.goToComment(1),
    previouscomment: () => sabaki.goToComment(-1),
    gotobeginning: () => sabaki.goToBeginning(),
    gotoend: () => sabaki.goToEnd(),
    gotonextvariation: () => sabaki.goToNextVariation(),
    gotopreviousvariation: () => sabaki.goToPreviousVariation(),
    gotomainvariation: () => sabaki.goToMainVariation(),

    manageengines: () => {
        view.showPreferences()
        view.setPreferencesTab('engines')
    },
    detachengine: () => sabaki.detachEngine(),
    generatemove: () => sabaki.generateMove(),
    gtpconsole: () => view.setShowLeftSidebar(!view.getShowLeftSidebar()),
    clearconsole: () => view.clearConsole(),

    togglecoordinates: () => view.setShowCoordinates(!view.getShowCoordinates()),
    toggleguessmode: () => view.setGuessMode(!view.getGuessMode()),
    toggleautoplaymode: () => view.setAutoplayMode(!view.getAutoplayMode()),
    toggleshownextmoves: () => view.setShowNextMoves(!view.getShowNextMoves()),
    toggleshowsiblings: () => view.setShowSiblings(!view.getShowSiblings()),
    togglegamegraph: () => view.setSidebarArrangement(!view.getShowGraph(), view.getShowComment()),
    togglecomments: () => view.setSidebarArrangement(view.getShowGraph(), !view.getShowComment()),
    togglefullscreen: () => view.setFullScreen(!view.getFullScreen()),

    checkforupdates: () => ipcRenderer.send('check-for-updates', true),
    github: () => shell.openExternal('https://github.com/yishn/' + app.getName()),
    reportissue: () => shell.openExternal('https://github.com/yishn/' + app.getName() + '/issues')
}

ipcRenderer.on('menu-click', (e, action) => menudata[action]())
ipcRenderer.on('attach-engine', (e, path, args) => sabaki.attachEngine(path, args))

ipcRenderer.on('load-file', (e, path) => {
    setTimeout(() => sabaki.loadFile(path), setting.get('app.loadgame_delay'))
})