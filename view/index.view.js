/**
 * Getter & setter
 */

var busyTimeout = null

function getIsBusy() {
    return $('body').data('busy')
}

function setIsBusy(busy) {
    $('body').data('busy', busy)
    clearTimeout(busyTimeout)

    if (busy) {
        $('body').addClass('busy')
        return
    }

    busyTimeout = setTimeout(function() {
        $('body').removeClass('busy')
    }, setting.get('app.hide_busy_delay'))
}

function setProgressIndicator(progress, win) {
    if (win) win.setProgressBar(progress)
}

function getShowNextMoves() {
    return $('#goban').hasClass('variations')
}

function setShowNextMoves(show) {
    $('#goban').toggleClass('variations', show)
    setting.set('view.show_next_moves', show)
}

function getShowSiblings() {
    return $('#goban').hasClass('siblings')
}

function setShowSiblings(show) {
    $('#goban').toggleClass('siblings', show)
    setting.set('view.show_siblings', show)
}

function getFuzzyStonePlacement() {
    return $('#goban').hasClass('fuzzy')
}

function setFuzzyStonePlacement(fuzzy) {
    $('#goban').toggleClass('fuzzy', fuzzy)
    setting.set('view.fuzzy_stone_placement', fuzzy)
}

function getAnimatedStonePlacement() {
    return $('#goban').hasClass('animation')
}

function setAnimatedStonePlacement(animate) {
    $('#goban').toggleClass('animation', animate)
    setting.set('view.animate_stone_placement', animate)
}

function getShowCoordinates() {
    return $('#goban').hasClass('coordinates')
}

function setShowCoordinates(show) {
    $('#goban').toggleClass('coordinates', show)
    setting.set('view.show_coordinates', show)
    resizeBoard()
}

function getShowLeftSidebar() {
    return $('body').hasClass('leftsidebar')
}

function setShowLeftSidebar(show) {
    if (getShowLeftSidebar() == show) return

    // Resize window
    var win = remote.getCurrentWindow()
    if (win) {
        var size = win.getContentSize()

        if (!win.isMaximized())
            win.setContentSize(size[0] + (show ? 1 : -1) * setting.get('view.leftsidebar_width'), size[1])
    }

    $('body').toggleClass('leftsidebar', show)

    $('#leftsidebar').css('width', setting.get('view.leftsidebar_width'))
    $('#main').css('left', show ? setting.get('view.leftsidebar_width') : 0)

    resizeBoard()
    setting.set('view.show_leftsidebar', show)

    // Update scrollbars
    var $view = $('#console .gm-scroll-view')
    $view.scrollTop($view.get(0).scrollHeight)
    $view.find('form:last-child input').get(0).focus()
    $('#console').data('scrollbar').update()
}

function setLeftSidebarWidth(width) {
    if (!getShowLeftSidebar()) return
    $('#leftsidebar').css('width', width)
    $('#main').css('left', width)
}

function getLeftSidebarWidth() {
    return parseFloat($('#leftsidebar').css('width'))
}

function getShowSidebar() {
    return $('body').hasClass('sidebar')
}

function setShowSidebar(show) {
    if (getShowSidebar() == show) return

    // Resize window
    var win = remote.getCurrentWindow()
    if (win) {
        var size = win.getContentSize()

        if (!win.isMaximized())
            win.setContentSize(size[0] + (show ? 1 : -1) * setting.get('view.sidebar_width'), size[1])
    }

    $('body').toggleClass('sidebar', show)

    $('#sidebar').css('width', setting.get('view.sidebar_width'))
    $('#main').css('right', show ? setting.get('view.sidebar_width') : 0)

    if (show) {
        updateGraph()
        updateSlider()
        updateCommentText();
    } else {
        // Clear game graph
        var sigma = $('#graph').data('sigma')

        if (sigma) {
            sigma.graph.clear()
            sigma.refresh()
        }
    }

    resizeBoard()
}

function getSidebarArrangement() {
    return [
        getShowSidebar() && getPropertiesHeight() != 100,
        getShowSidebar() && getPropertiesHeight() != 0
    ]
}

function setSidebarArrangement(graph, comment, updateLayout) {
    if (updateLayout == null || updateLayout) updateSidebarLayout()

    if (!graph && !comment) setShowSidebar(false)
    else {
        if (!graph && comment) setPropertiesHeight(100)
        else if (comment) setPropertiesHeight(setting.get('view.properties_height'))
        else if (!comment) setPropertiesHeight(0)
        setShowSidebar(true)
    }

    setting.set('view.show_graph', graph)
    setting.set('view.show_comments', comment)
}

function getShowGraph() {
    return getSidebarArrangement()[0]
}

function getShowComment() {
    return getSidebarArrangement()[1]
}

function getSidebarWidth() {
    return parseFloat($('#sidebar').css('width'))
}

function setSidebarWidth(width) {
    if (!getShowSidebar()) return
    $('#sidebar').css('width', width)
    $('.sidebar #main').css('right', width)
}

function getPropertiesHeight() {
    return $('#properties').height() * 100 / $('#sidebar').height()
}

function setPropertiesHeight(height) {
    $('#graph').css('height', (100 - height) + '%')
    $('#properties').css('height', height + '%')
    setSliderValue.apply(null, getSliderValue())
}

function getPlayerName(sign) {
    var $el = $('#player_' + sign + ' .name')
    return [$el.text(), $el.attr('title')]
}

function setPlayerName(sign, name, tooltip) {
    if (name.trim() == '') name = sign > 0 ? 'Black' : 'White'
    $('#player_' + sign + ' .name').text(name).attr('title', tooltip)
}

function getShowHotspot() {
    return $('body').hasClass('bookmark')
}

function setShowHotspot(bookmark) {
    $('body').toggleClass('bookmark', bookmark)
}

function getCaptures() {
    return {
        '-1': +$('#player_-1 .captures').text(),
        '1': +$('#player_1 .captures').text()
    }
}

function setCaptures(captures) {
    $('#player_-1 .captures')
        .text(captures['-1'])
        .css('opacity', captures['-1'] == 0 ? 0 : .7)
    $('#player_1 .captures')
        .text(captures['1'])
        .css('opacity', captures['1'] == 0 ? 0 : .7)
}

function getCurrentPlayer() {
    return $('.currentplayer').attr('src') == '../img/ui/blacktoplay.svg' ? 1 : -1
}

function setCurrentPlayer(sign) {
    $('.currentplayer').attr('src', sign > 0 ? '../img/ui/blacktoplay.svg' : '../img/ui/whitetoplay.svg')
}

function getCommentText() {
    return $('#properties textarea').val()
}

function setCommentText(text) {
    var html = helper.markdown(text)
    var $container = $('#properties .inner .comment')
    var $textarea = $('#properties textarea')

    if ($textarea.val() != text) $textarea.val(text)
    $container.html(html)
    wireLinks($container)
}

function getCommentTitle() {
    return $('#properties .edit .header input').val()
}

function setCommentTitle(text) {
    var $input = $('#properties .edit .header input')

    $('#properties .inner .header span').text(text.trim() != '' ? text : getCurrentMoveInterpretation())
    if ($input.val() != text) $input.val(text)
}

function setAnnotations(posstatus, posvalue, movestatus, movevalue) {
    var $header = $('#properties .inner .header')
    var $img = $header.find('img:nth-child(2)')

    // Set move status

    if (movestatus == null) $header.removeClass('movestatus')
    else $header.addClass('movestatus')

    if (movestatus == -1)
        $img.attr('src', '../img/ui/badmove.svg')
            .attr('alt', 'Bad move')
    else if (movestatus == 0)
        $img.attr('src', '../img/ui/doubtfulmove.svg')
            .attr('alt', 'Doubtful move')
    else if (movestatus == 1)
        $img.attr('src', '../img/ui/interestingmove.svg')
            .attr('alt', 'Interesting move')
    else if (movestatus == 2)
        $img.attr('src', '../img/ui/goodmove.svg')
            .attr('alt', 'Good move')

    if (movevalue == 2) $img.attr('alt', 'Very ' + $img.attr('alt').toLowerCase())
    $img.attr('title', $img.attr('alt'))

    // Set positional status

    $img = $header.find('img:nth-child(1)')

    if (posstatus == null) $header.removeClass('positionstatus')
    else $header.addClass('positionstatus')

    if (posstatus == -1)
        $img.attr('src', '../img/ui/white.svg')
            .attr('alt', 'Good for white')
    else if (posstatus == 0)
        $img.attr('src', '../img/ui/balance.svg')
            .attr('alt', 'Even position')
    else if (posstatus == 1)
        $img.attr('src', '../img/ui/black.svg')
            .attr('alt', 'Good for black')
    else if (posstatus == -2)
        $img.attr('src', '../img/ui/unclear.svg')
            .attr('alt', 'Unclear position')

    if (posvalue == 2) $img.attr('alt', 'Very ' + $img.attr('alt').toLowerCase())
    $img.attr('title', $img.attr('alt'))
}

function getSliderValue() {
    var $span = $('#sidebar .slider .inner span').eq(0)
    var value = parseFloat($span.get(0).style.top)
    var label = $span.text()

    return [value, label]
}

function setSliderValue(value, label) {
    $('#sidebar .slider .inner span').css('top', value + '%').text(label)
}

function getFindMode() {
    return $('body').hasClass('find')
}

function setFindMode(pickMode) {
    if (pickMode) {
        if (pickMode != getFindMode()) closeDrawers()
        $('body').addClass('find')

        var input = $('#find input').get(0)
        input.focus()
        input.select()
    } else {
        hideIndicator()
        $('body').removeClass('find')
        document.activeElement.blur()
    }
}

function getFindText() {
    return $('#find input').val()
}

function setFindText(text) {
    $('#find input').val(text)
}

function getEditMode() {
    return $('body').hasClass('edit')
}

function setEditMode(editMode) {
    if (editMode) {
        closeDrawers()
        $('body').addClass('edit')

        $('#properties textarea').eq(0).scrollTop(0)
    } else {
        $('#goban').data('edittool-data', null)
        $('body').removeClass('edit')
    }
}

function getGuessMode() {
    return $('body').hasClass('guess')
}

function setGuessMode(guessMode) {
    if (guessMode) {
        closeDrawers()
        $('body').addClass('guess')
    } else {
        $('body').removeClass('guess')
        setCurrentTreePosition.apply(null, getCurrentTreePosition())
    }
}

function getScoringMode() {
    return $('body').hasClass('scoring')
}

function setScoringMode(mode, estimator) {
    var type = estimator ? 'estimator' : 'scoring'

    if (mode) {
        // Clean board
        $('#goban .row li')
        .removeClass('area_-1')
        .removeClass('area_0')
        .removeClass('area_1')
        .removeClass('dead')

        closeDrawers()
        $('body').addClass(type)

        var deadstones = estimator ? getBoard().guessDeadStones() : getBoard().determineDeadStones()
        deadstones.forEach(function(v) {
            $('#goban .pos_' + v.join('-')).addClass('dead')
        })

        updateAreaMap(estimator)
    } else {
        $('body').removeClass(type)
    }
}

function getEstimatorMode() {
    return $('body').hasClass('estimator')
}

function setEstimatorMode(mode) {
    setScoringMode(mode, true)
}

function getIndicatorVertex() {
    return $('#indicator').data('vertex')
}

function setIndicatorVertex(vertex) {
    if (vertex) showIndicator(vertex)
    else hideIndicator()
}

function setPreferencesTab(tab) {
    $('#preferences .tabs')
        .find('.current')
        .removeClass('current')
        .parent()
        .find('.' + tab)
        .parent()
        .addClass('current')

    var $form = $('#preferences form')
    $form.attr('class', tab)

    if (tab == 'engines')
        $('#preferences .engines-list').data('scrollbar').update()
}

function getRepresentedFilename() {
    return $('body').data('representedfilename')
}

function setRepresentedFilename(filename) {
    $('body').data('representedfilename', filename)
    updateTitle()
}

function getShapes() {
    return [{"name":"Low Chinese opening","points":[[3,3,1],[10,2,1],[16,3,1],[0,0,0],[0,1,0],[0,2,0],[0,3,0],[0,4,0],[1,0,0],[1,1,0],[1,2,0],[1,3,0],[1,4,0],[2,0,0],[2,1,0],[2,2,0],[2,3,0],[2,4,0],[3,0,0],[3,1,0],[3,2,0],[3,4,0],[4,0,0],[4,1,0],[4,2,0],[4,3,0],[4,4,0],[5,0,0],[5,1,0],[5,2,0],[5,3,0],[5,4,0],[6,0,0],[6,1,0],[6,2,0],[6,3,0],[6,4,0],[7,0,0],[7,1,0],[7,2,0],[7,3,0],[7,4,0],[8,0,0],[8,1,0],[8,2,0],[8,3,0],[8,4,0],[9,0,0],[9,1,0],[9,2,0],[9,3,0],[9,4,0],[10,0,0],[10,1,0],[10,3,0],[10,4,0],[11,0,0],[11,1,0],[11,2,0],[11,3,0],[11,4,0],[12,0,0],[12,1,0],[12,2,0],[12,3,0],[12,4,0],[13,0,0],[13,1,0],[13,2,0],[13,3,0],[13,4,0],[14,0,0],[14,1,0],[14,2,0],[14,3,0],[14,4,0],[15,0,0],[15,1,0],[15,2,0],[15,3,0],[15,4,0],[16,0,0],[16,1,0],[16,2,0],[16,4,0],[17,0,0],[17,1,0],[17,2,0],[17,3,0],[17,4,0],[18,0,0],[18,1,0],[18,2,0],[18,3,0],[18,4,0],[0,18,0]],"candidates":[[3,3],[10,2],[16,3]]},{"name":"High Chinese opening","points":[[3,3,1],[10,3,1],[16,3,1],[0,0,0],[0,1,0],[0,2,0],[0,3,0],[0,4,0],[1,0,0],[1,1,0],[1,2,0],[1,3,0],[1,4,0],[2,0,0],[2,1,0],[2,2,0],[2,3,0],[2,4,0],[3,0,0],[3,1,0],[3,2,0],[3,4,0],[4,0,0],[4,1,0],[4,2,0],[4,3,0],[4,4,0],[5,0,0],[5,1,0],[5,2,0],[5,3,0],[5,4,0],[6,0,0],[6,1,0],[6,2,0],[6,3,0],[6,4,0],[7,0,0],[7,1,0],[7,2,0],[7,3,0],[7,4,0],[8,0,0],[8,1,0],[8,2,0],[8,3,0],[8,4,0],[9,0,0],[9,1,0],[9,2,0],[9,3,0],[9,4,0],[10,0,0],[10,1,0],[10,2,0],[10,4,0],[11,0,0],[11,1,0],[11,2,0],[11,3,0],[11,4,0],[12,0,0],[12,1,0],[12,2,0],[12,3,0],[12,4,0],[13,0,0],[13,1,0],[13,2,0],[13,3,0],[13,4,0],[14,0,0],[14,1,0],[14,2,0],[14,3,0],[14,4,0],[15,0,0],[15,1,0],[15,2,0],[15,3,0],[15,4,0],[16,0,0],[16,1,0],[16,2,0],[16,4,0],[17,0,0],[17,1,0],[17,2,0],[17,3,0],[17,4,0],[18,0,0],[18,1,0],[18,2,0],[18,3,0],[18,4,0],[0,18,0]],"candidates":[[3,3],[10,3],[16,3]]},{"name":"Orthodox opening","points":[[3,3,1],[15,2,1],[16,4,1],[0,0,0],[0,1,0],[0,2,0],[0,3,0],[0,4,0],[0,5,0],[1,0,0],[1,1,0],[1,2,0],[1,3,0],[1,4,0],[1,5,0],[2,0,0],[2,1,0],[2,2,0],[2,3,0],[2,4,0],[2,5,0],[3,0,0],[3,1,0],[3,2,0],[3,4,0],[3,5,0],[4,0,0],[4,1,0],[4,2,0],[4,3,0],[4,4,0],[4,5,0],[5,0,0],[5,1,0],[5,2,0],[5,3,0],[5,4,0],[5,5,0],[6,0,0],[6,1,0],[6,2,0],[6,3,0],[6,4,0],[6,5,0],[7,0,0],[7,1,0],[7,2,0],[7,3,0],[7,4,0],[7,5,0],[8,0,0],[8,1,0],[8,2,0],[8,3,0],[8,4,0],[8,5,0],[9,0,0],[9,1,0],[9,2,0],[9,3,0],[9,4,0],[9,5,0],[10,0,0],[10,1,0],[10,2,0],[10,3,0],[10,4,0],[10,5,0],[11,0,0],[11,1,0],[11,2,0],[11,3,0],[11,4,0],[11,5,0],[12,0,0],[12,1,0],[12,2,0],[12,3,0],[12,4,0],[12,5,0],[13,0,0],[13,1,0],[13,2,0],[13,3,0],[13,4,0],[13,5,0],[14,0,0],[14,1,0],[14,2,0],[14,3,0],[14,4,0],[14,5,0],[15,0,0],[15,1,0],[15,3,0],[15,4,0],[15,5,0],[16,0,0],[16,1,0],[16,2,0],[16,3,0],[16,5,0],[17,0,0],[17,1,0],[17,2,0],[17,3,0],[17,4,0],[17,5,0],[18,0,0],[18,1,0],[18,2,0],[18,3,0],[18,4,0],[18,5,0],[0,18,0]],"candidates":[[3,3],[15,2],[16,4]]},{"name":"Orthodox opening","points":[[2,3,1],[15,2,1],[16,4,1],[0,0,0],[0,1,0],[0,2,0],[0,3,0],[0,4,0],[0,5,0],[1,0,0],[1,1,0],[1,2,0],[1,3,0],[1,4,0],[1,5,0],[2,0,0],[2,1,0],[2,2,0],[2,4,0],[2,5,0],[3,0,0],[3,1,0],[3,2,0],[3,3,0],[3,4,0],[3,5,0],[4,0,0],[4,1,0],[4,2,0],[4,3,0],[4,4,0],[4,5,0],[5,0,0],[5,1,0],[5,2,0],[5,3,0],[5,4,0],[5,5,0],[6,0,0],[6,1,0],[6,2,0],[6,3,0],[6,4,0],[6,5,0],[7,0,0],[7,1,0],[7,2,0],[7,3,0],[7,4,0],[7,5,0],[8,0,0],[8,1,0],[8,2,0],[8,3,0],[8,4,0],[8,5,0],[9,0,0],[9,1,0],[9,2,0],[9,3,0],[9,4,0],[9,5,0],[10,0,0],[10,1,0],[10,2,0],[10,3,0],[10,4,0],[10,5,0],[11,0,0],[11,1,0],[11,2,0],[11,3,0],[11,4,0],[11,5,0],[12,0,0],[12,1,0],[12,2,0],[12,3,0],[12,4,0],[12,5,0],[13,0,0],[13,1,0],[13,2,0],[13,3,0],[13,4,0],[13,5,0],[14,0,0],[14,1,0],[14,2,0],[14,3,0],[14,4,0],[14,5,0],[15,0,0],[15,1,0],[15,3,0],[15,4,0],[15,5,0],[16,0,0],[16,1,0],[16,2,0],[16,3,0],[16,5,0],[17,0,0],[17,1,0],[17,2,0],[17,3,0],[17,4,0],[17,5,0],[18,0,0],[18,1,0],[18,2,0],[18,3,0],[18,4,0],[18,5,0],[0,18,0]],"candidates":[[2,3],[15,2],[16,4]]},{"name":"Kobayashi opening","points":[[3,2,1],[13,2,1],[9,3,1],[15,3,-1],[0,0,0],[0,1,0],[0,2,0],[0,3,0],[0,4,0],[1,0,0],[1,1,0],[1,2,0],[1,3,0],[1,4,0],[2,0,0],[2,1,0],[2,2,0],[2,3,0],[2,4,0],[3,0,0],[3,1,0],[3,3,0],[3,4,0],[4,0,0],[4,1,0],[4,2,0],[4,3,0],[4,4,0],[5,0,0],[5,1,0],[5,2,0],[5,3,0],[5,4,0],[6,0,0],[6,1,0],[6,2,0],[6,3,0],[6,4,0],[7,0,0],[7,1,0],[7,2,0],[7,3,0],[7,4,0],[8,0,0],[8,1,0],[8,2,0],[8,3,0],[8,4,0],[9,0,0],[9,1,0],[9,2,0],[9,4,0],[10,0,0],[10,1,0],[10,2,0],[10,3,0],[10,4,0],[11,0,0],[11,1,0],[11,2,0],[11,3,0],[11,4,0],[12,0,0],[12,1,0],[12,2,0],[12,3,0],[12,4,0],[13,0,0],[13,1,0],[13,3,0],[13,4,0],[14,0,0],[14,1,0],[14,2,0],[14,3,0],[14,4,0],[15,0,0],[15,1,0],[15,2,0],[15,4,0],[16,0,0],[16,1,0],[16,2,0],[16,3,0],[16,4,0],[17,0,0],[17,1,0],[17,2,0],[17,3,0],[17,4,0],[18,0,0],[18,1,0],[18,2,0],[18,3,0],[18,4,0],[0,18,0]],"candidates":[[3,2],[13,2],[9,3]]},{"name":"Small Chinese opening","points":[[2,3,1],[13,2,1],[8,2,1],[15,3,-1],[0,0,0],[0,1,0],[0,2,0],[0,3,0],[0,4,0],[1,0,0],[1,1,0],[1,2,0],[1,3,0],[1,4,0],[2,0,0],[2,1,0],[2,2,0],[2,4,0],[3,0,0],[3,1,0],[3,2,0],[3,3,0],[3,4,0],[4,0,0],[4,1,0],[4,2,0],[4,3,0],[4,4,0],[5,0,0],[5,1,0],[5,2,0],[5,3,0],[5,4,0],[6,0,0],[6,1,0],[6,2,0],[6,3,0],[6,4,0],[7,0,0],[7,1,0],[7,2,0],[7,3,0],[7,4,0],[8,0,0],[8,1,0],[8,3,0],[8,4,0],[9,0,0],[9,1,0],[9,2,0],[9,3,0],[9,4,0],[10,0,0],[10,1,0],[10,2,0],[10,3,0],[10,4,0],[11,0,0],[11,1,0],[11,2,0],[11,3,0],[11,4,0],[12,0,0],[12,1,0],[12,2,0],[12,3,0],[12,4,0],[13,0,0],[13,1,0],[13,3,0],[13,4,0],[14,0,0],[14,1,0],[14,2,0],[14,3,0],[14,4,0],[15,0,0],[15,1,0],[15,2,0],[15,4,0],[16,0,0],[16,1,0],[16,2,0],[16,3,0],[16,4,0],[17,0,0],[17,1,0],[17,2,0],[17,3,0],[17,4,0],[18,0,0],[18,1,0],[18,2,0],[18,3,0],[18,4,0],[0,18,0]],"candidates":[[2,3],[13,2],[8,2]]},{"name":"Micro Chinese opening","points":[[2,3,1],[7,2,1],[13,2,1],[15,3,-1],[0,0,0],[0,1,0],[0,2,0],[0,3,0],[0,4,0],[1,0,0],[1,1,0],[1,2,0],[1,3,0],[1,4,0],[2,0,0],[2,1,0],[2,2,0],[2,4,0],[3,0,0],[3,1,0],[3,2,0],[3,3,0],[3,4,0],[4,0,0],[4,1,0],[4,2,0],[4,3,0],[4,4,0],[5,0,0],[5,1,0],[5,2,0],[5,3,0],[5,4,0],[6,0,0],[6,1,0],[6,2,0],[6,3,0],[6,4,0],[7,0,0],[7,1,0],[7,3,0],[7,4,0],[8,0,0],[8,1,0],[8,2,0],[8,3,0],[8,4,0],[9,0,0],[9,1,0],[9,2,0],[9,3,0],[9,4,0],[10,0,0],[10,1,0],[10,2,0],[10,3,0],[10,4,0],[11,0,0],[11,1,0],[11,2,0],[11,3,0],[11,4,0],[12,0,0],[12,1,0],[12,2,0],[12,3,0],[12,4,0],[13,0,0],[13,1,0],[13,3,0],[13,4,0],[14,0,0],[14,1,0],[14,2,0],[14,3,0],[14,4,0],[15,0,0],[15,1,0],[15,2,0],[15,4,0],[16,0,0],[16,1,0],[16,2,0],[16,3,0],[16,4,0],[17,0,0],[17,1,0],[17,2,0],[17,3,0],[17,4,0],[18,0,0],[18,1,0],[18,2,0],[18,3,0],[18,4,0],[0,18,0]],"candidates":[[2,3],[7,2],[13,2]]},{"name":"Sanrensei opening","points":[[15,3,1],[9,3,1],[3,3,1],[0,0,0],[0,1,0],[0,2,0],[0,3,0],[0,4,0],[1,0,0],[1,1,0],[1,2,0],[1,3,0],[1,4,0],[2,0,0],[2,1,0],[2,2,0],[2,3,0],[2,4,0],[3,0,0],[3,1,0],[3,2,0],[3,4,0],[4,0,0],[4,1,0],[4,2,0],[4,3,0],[4,4,0],[5,0,0],[5,1,0],[5,2,0],[5,3,0],[5,4,0],[6,0,0],[6,1,0],[6,2,0],[6,3,0],[6,4,0],[7,0,0],[7,1,0],[7,2,0],[7,3,0],[7,4,0],[8,0,0],[8,1,0],[8,2,0],[8,3,0],[8,4,0],[9,0,0],[9,1,0],[9,2,0],[9,4,0],[10,0,0],[10,1,0],[10,2,0],[10,3,0],[10,4,0],[11,0,0],[11,1,0],[11,2,0],[11,3,0],[11,4,0],[12,0,0],[12,1,0],[12,2,0],[12,3,0],[12,4,0],[13,0,0],[13,1,0],[13,2,0],[13,3,0],[13,4,0],[14,0,0],[14,1,0],[14,2,0],[14,3,0],[14,4,0],[15,0,0],[15,1,0],[15,2,0],[15,4,0],[16,0,0],[16,1,0],[16,2,0],[16,3,0],[16,4,0],[17,0,0],[17,1,0],[17,2,0],[17,3,0],[17,4,0],[18,0,0],[18,1,0],[18,2,0],[18,3,0],[18,4,0],[0,18,0]],"candidates":[[15,3],[9,3],[3,3]]},{"name":"Nirensei opening","points":[[3,3,1],[15,3,1],[0,0,0],[0,1,0],[0,2,0],[0,3,0],[0,4,0],[1,0,0],[1,1,0],[1,2,0],[1,3,0],[1,4,0],[2,0,0],[2,1,0],[2,2,0],[2,3,0],[2,4,0],[3,0,0],[3,1,0],[3,2,0],[3,4,0],[4,0,0],[4,1,0],[4,2,0],[4,3,0],[4,4,0],[5,0,0],[5,1,0],[5,2,0],[5,3,0],[5,4,0],[6,0,0],[6,1,0],[6,2,0],[6,3,0],[6,4,0],[7,0,0],[7,1,0],[7,2,0],[7,3,0],[7,4,0],[8,0,0],[8,1,0],[8,2,0],[8,3,0],[8,4,0],[9,0,0],[9,1,0],[9,2,0],[9,3,0],[9,4,0],[10,0,0],[10,1,0],[10,2,0],[10,3,0],[10,4,0],[11,0,0],[11,1,0],[11,2,0],[11,3,0],[11,4,0],[12,0,0],[12,1,0],[12,2,0],[12,3,0],[12,4,0],[13,0,0],[13,1,0],[13,2,0],[13,3,0],[13,4,0],[14,0,0],[14,1,0],[14,2,0],[14,3,0],[14,4,0],[15,0,0],[15,1,0],[15,2,0],[15,4,0],[16,0,0],[16,1,0],[16,2,0],[16,3,0],[16,4,0],[17,0,0],[17,1,0],[17,2,0],[17,3,0],[17,4,0],[18,0,0],[18,1,0],[18,2,0],[18,3,0],[18,4,0],[0,18,0]],"candidates":[[3,3],[15,3]]},{"name":"Shūsaku opening","points":[[16,3,1],[15,16,1],[2,15,1],[15,4,1],[3,2,-1],[14,2,-1],[16,14,-1],[0,0,0],[0,1,0],[0,2,0],[0,3,0],[0,4,0],[0,5,0],[0,6,0],[0,7,0],[0,8,0],[0,9,0],[0,10,0],[0,11,0],[0,12,0],[0,13,0],[0,14,0],[0,15,0],[0,16,0],[0,17,0],[0,18,0],[1,0,0],[1,1,0],[1,2,0],[1,3,0],[1,4,0],[1,5,0],[1,6,0],[1,7,0],[1,8,0],[1,9,0],[1,10,0],[1,11,0],[1,12,0],[1,13,0],[1,14,0],[1,15,0],[1,16,0],[1,17,0],[1,18,0],[2,0,0],[2,1,0],[2,2,0],[2,3,0],[2,4,0],[2,5,0],[2,6,0],[2,7,0],[2,8,0],[2,9,0],[2,10,0],[2,11,0],[2,12,0],[2,13,0],[2,14,0],[2,16,0],[2,17,0],[2,18,0],[3,0,0],[3,1,0],[3,3,0],[3,4,0],[3,5,0],[3,6,0],[3,7,0],[3,8,0],[3,9,0],[3,10,0],[3,11,0],[3,12,0],[3,13,0],[3,14,0],[3,15,0],[3,16,0],[3,17,0],[3,18,0],[4,0,0],[4,1,0],[4,2,0],[4,3,0],[4,4,0],[4,5,0],[4,6,0],[4,7,0],[4,8,0],[4,9,0],[4,10,0],[4,11,0],[4,12,0],[4,13,0],[4,14,0],[4,15,0],[4,16,0],[4,17,0],[4,18,0],[5,0,0],[5,1,0],[5,2,0],[5,3,0],[5,4,0],[5,5,0],[5,6,0],[5,7,0],[5,8,0],[5,9,0],[5,10,0],[5,11,0],[5,12,0],[5,13,0],[5,14,0],[5,15,0],[5,16,0],[5,17,0],[5,18,0],[6,0,0],[6,1,0],[6,2,0],[6,3,0],[6,4,0],[6,5,0],[6,6,0],[6,7,0],[6,8,0],[6,9,0],[6,10,0],[6,11,0],[6,12,0],[6,13,0],[6,14,0],[6,15,0],[6,16,0],[6,17,0],[6,18,0],[7,0,0],[7,1,0],[7,2,0],[7,3,0],[7,4,0],[7,5,0],[7,6,0],[7,7,0],[7,8,0],[7,9,0],[7,10,0],[7,11,0],[7,12,0],[7,13,0],[7,14,0],[7,15,0],[7,16,0],[7,17,0],[7,18,0],[8,0,0],[8,1,0],[8,2,0],[8,3,0],[8,4,0],[8,5,0],[8,6,0],[8,7,0],[8,8,0],[8,9,0],[8,10,0],[8,11,0],[8,12,0],[8,13,0],[8,14,0],[8,15,0],[8,16,0],[8,17,0],[8,18,0],[9,0,0],[9,1,0],[9,2,0],[9,3,0],[9,4,0],[9,5,0],[9,6,0],[9,7,0],[9,8,0],[9,9,0],[9,10,0],[9,11,0],[9,12,0],[9,13,0],[9,14,0],[9,15,0],[9,16,0],[9,17,0],[9,18,0],[10,0,0],[10,1,0],[10,2,0],[10,3,0],[10,4,0],[10,5,0],[10,6,0],[10,7,0],[10,8,0],[10,9,0],[10,10,0],[10,11,0],[10,12,0],[10,13,0],[10,14,0],[10,15,0],[10,16,0],[10,17,0],[10,18,0],[11,0,0],[11,1,0],[11,2,0],[11,3,0],[11,4,0],[11,5,0],[11,6,0],[11,7,0],[11,8,0],[11,9,0],[11,10,0],[11,11,0],[11,12,0],[11,13,0],[11,14,0],[11,15,0],[11,16,0],[11,17,0],[11,18,0],[12,0,0],[12,1,0],[12,2,0],[12,3,0],[12,4,0],[12,5,0],[12,6,0],[12,7,0],[12,8,0],[12,9,0],[12,10,0],[12,11,0],[12,12,0],[12,13,0],[12,14,0],[12,15,0],[12,16,0],[12,17,0],[12,18,0],[13,0,0],[13,1,0],[13,2,0],[13,3,0],[13,4,0],[13,5,0],[13,6,0],[13,7,0],[13,8,0],[13,9,0],[13,10,0],[13,11,0],[13,12,0],[13,13,0],[13,14,0],[13,15,0],[13,16,0],[13,17,0],[13,18,0],[14,0,0],[14,1,0],[14,3,0],[14,4,0],[14,5,0],[14,6,0],[14,7,0],[14,8,0],[14,9,0],[14,10,0],[14,11,0],[14,12,0],[14,13,0],[14,14,0],[14,15,0],[14,16,0],[14,17,0],[14,18,0],[15,0,0],[15,1,0],[15,2,0],[15,3,0],[15,5,0],[15,6,0],[15,7,0],[15,8,0],[15,9,0],[15,10,0],[15,11,0],[15,12,0],[15,13,0],[15,14,0],[15,15,0],[15,17,0],[15,18,0],[16,0,0],[16,1,0],[16,2,0],[16,4,0],[16,5,0],[16,6,0],[16,7,0],[16,8,0],[16,9,0],[16,10,0],[16,11,0],[16,12,0],[16,13,0],[16,15,0],[16,16,0],[16,17,0],[16,18,0],[17,0,0],[17,1,0],[17,2,0],[17,3,0],[17,4,0],[17,5,0],[17,6,0],[17,7,0],[17,8,0],[17,9,0],[17,10,0],[17,11,0],[17,12,0],[17,13,0],[17,14,0],[17,15,0],[17,16,0],[17,17,0],[17,18,0],[18,0,0],[18,1,0],[18,2,0],[18,3,0],[18,4,0],[18,5,0],[18,6,0],[18,7,0],[18,8,0],[18,9,0],[18,10,0],[18,11,0],[18,12,0],[18,13,0],[18,14,0],[18,15,0],[18,16,0],[18,17,0],[18,18,0]],"candidates":[[16,3],[15,16],[2,15],[15,4]]},{"name":"Low approach","points":[[14,2,1],[16,3,-1],[1,0,0],[18,18,0],[13,0,0],[13,1,0],[13,2,0],[13,3,0],[13,4,0],[14,0,0],[14,1,0],[14,3,0],[14,4,0],[15,0,0],[15,1,0],[15,2,0],[15,3,0],[15,4,0],[16,0,0],[16,1,0],[16,2,0],[16,4,0],[17,0,0],[17,1,0],[17,2,0],[17,3,0],[17,4,0],[18,0,0],[18,1,0],[18,2,0],[18,3,0],[18,4,0]],"candidates":[[14,2]]},{"name":"High approach","points":[[14,3,1],[16,3,-1],[1,0,0],[18,18,0],[13,0,0],[13,1,0],[13,2,0],[13,3,0],[13,4,0],[14,0,0],[14,1,0],[14,2,0],[14,4,0],[15,0,0],[15,1,0],[15,2,0],[15,3,0],[15,4,0],[16,0,0],[16,1,0],[16,2,0],[16,4,0],[17,0,0],[17,1,0],[17,2,0],[17,3,0],[17,4,0],[18,0,0],[18,1,0],[18,2,0],[18,3,0],[18,4,0]],"candidates":[[14,3]]},{"name":"Low enclosure","points":[[14,2,1],[16,3,1],[1,0,0],[18,18,0],[13,0,0],[13,1,0],[13,2,0],[13,3,0],[13,4,0],[14,0,0],[14,1,0],[14,3,0],[14,4,0],[15,0,0],[15,1,0],[15,2,0],[15,3,0],[15,4,0],[16,0,0],[16,1,0],[16,2,0],[16,4,0],[17,0,0],[17,1,0],[17,2,0],[17,3,0],[17,4,0],[18,0,0],[18,1,0],[18,2,0],[18,3,0],[18,4,0]],"candidates":[[14,2],[16,3]]},{"name":"High enclosure","points":[[14,3,1],[16,3,1],[1,0,0],[18,18,0],[13,0,0],[13,1,0],[13,2,0],[13,3,0],[13,4,0],[14,0,0],[14,1,0],[14,2,0],[14,4,0],[15,0,0],[15,1,0],[15,2,0],[15,3,0],[15,4,0],[16,0,0],[16,1,0],[16,2,0],[16,4,0],[17,0,0],[17,1,0],[17,2,0],[17,3,0],[17,4,0],[18,0,0],[18,1,0],[18,2,0],[18,3,0],[18,4,0]],"candidates":[[14,3],[16,3]]},{"name":"Low enclosure","points":[[13,2,1],[16,3,1],[1,0,0],[18,18,0],[12,0,0],[12,1,0],[12,2,0],[12,3,0],[12,4,0],[13,0,0],[13,1,0],[13,3,0],[13,4,0],[14,0,0],[14,1,0],[14,2,0],[14,3,0],[14,4,0],[15,0,0],[15,1,0],[15,2,0],[15,3,0],[15,4,0],[16,0,0],[16,1,0],[16,2,0],[16,4,0],[17,0,0],[17,1,0],[17,2,0],[17,3,0],[17,4,0],[18,0,0],[18,1,0],[18,2,0],[18,3,0],[18,4,0]],"candidates":[[13,2],[16,3]]},{"name":"High enclosure","points":[[13,3,1],[16,3,1],[1,0,0],[18,18,0],[12,0,0],[12,1,0],[12,2,0],[12,3,0],[12,4,0],[13,0,0],[13,1,0],[13,2,0],[13,4,0],[14,0,0],[14,1,0],[14,2,0],[14,3,0],[14,4,0],[15,0,0],[15,1,0],[15,2,0],[15,3,0],[15,4,0],[16,0,0],[16,1,0],[16,2,0],[16,4,0],[17,0,0],[17,1,0],[17,2,0],[17,3,0],[17,4,0],[18,0,0],[18,1,0],[18,2,0],[18,3,0],[18,4,0]],"candidates":[[13,3],[16,3]]},{"name":"Mouth shape","points":[[3,3,1],[3,4,1],[4,5,1],[5,5,1],[5,3,1],[4,2,0],[4,3,0],[5,4,0],[6,4,0]],"candidates":[[3,3],[3,4],[4,5],[5,5],[5,3]]},{"name":"Table shape","points":[[3,3,1],[3,4,1],[5,3,1],[5,5,1],[4,3,0],[4,4,0],[5,4,0],[6,4,0]],"candidates":[[3,3],[3,4],[5,3],[5,5]]},{"name":"Tippy table","points":[[3,3,1],[4,3,1],[3,5,1],[5,6,1],[3,4,0],[4,4,0],[4,5,0],[5,5,0]],"candidates":[[3,3],[4,3],[3,5],[5,6]]},{"name":"Bamboo joint","points":[[3,3,1],[4,3,1],[3,5,1],[4,5,1],[3,4,0],[4,4,0]],"candidates":[[3,3],[4,3],[3,5],[4,5]]},{"name":"Trapezium","points":[[3,3,1],[3,4,1],[5,3,1],[6,4,1],[4,3,0],[6,3,0],[4,4,0],[5,4,0],[5,5,0]],"candidates":[[3,3],[3,4],[5,3],[6,4]]},{"name":"Diamond","points":[[3,3,1],[2,4,1],[4,4,1],[3,5,1],[3,4,0]],"candidates":[[3,3],[2,4],[4,4],[3,5]]},{"name":"Tiger’s mouth","points":[[3,3,1],[4,4,1],[5,3,1],[4,2,0],[4,3,0]],"candidates":[[3,3],[4,4],[5,3]]},{"name":"Empty triangle","points":[[3,3,1],[3,4,1],[4,3,1],[4,4,0]],"candidates":[[3,3],[3,4],[4,3]]},{"name":"Stretch","points":[[3,3,1],[3,4,1]],"candidates":[[3,3],[3,4]]},{"name":"Diagonal","points":[[3,3,1],[4,4,1],[4,3,0],[3,4,0]],"candidates":[[3,3],[4,4]]},{"name":"Wedge","points":[[3,3,1],[4,3,-1],[2,3,-1],[3,2,0],[3,4,0]],"candidates":[[3,3]]},{"name":"Hane","points":[[3,3,1],[4,4,1],[4,3,-1],[3,4,0]],"candidates":[[3,3],[4,4]]},{"name":"Cut","points":[[3,3,1],[4,4,1],[4,3,-1],[3,4,-1]],"candidates":[[3,3],[4,4]]},{"name":"Square","points":[[3,3,1],[5,3,1],[5,5,1],[3,5,1],[4,4,0]],"candidates":[[3,3],[5,3],[5,5],[3,5]]},{"name":"Parallelogram","points":[[3,3,1],[5,4,1],[3,5,1],[5,6,1],[4,4,0],[4,5,0]],"candidates":[[3,3],[5,4],[3,5],[5,6]]},{"name":"Dog’s head","points":[[3,3,1],[3,5,1],[5,4,1],[4,3,0],[3,4,0],[4,4,0],[4,5,0]],"candidates":[[3,3],[3,5],[5,4]]},{"name":"Horse’s head","points":[[3,3,1],[3,5,1],[6,4,1],[4,3,0],[3,4,0],[4,4,0],[5,4,0],[4,5,0]],"candidates":[[3,3],[3,5],[6,4]]},{"name":"Attachment","points":[[3,3,1],[4,3,-1],[3,2,0],[4,2,0],[3,4,0],[4,4,0]],"candidates":[[3,3]]},{"name":"One-point jump","points":[[3,3,1],[5,3,1],[4,3,0]],"candidates":[[3,3],[5,3]]},{"name":"Big bulge","points":[[3,3,1],[5,4,1],[4,6,1],[4,4,0],[4,5,0]],"candidates":[[3,3],[5,4],[4,6]]},{"name":"Small knight","points":[[3,3,1],[5,4,1],[4,3,0],[4,4,0]],"candidates":[[3,3],[5,4]]},{"name":"Two-point jump","points":[[3,3,1],[6,3,1],[4,3,0],[5,3,0]],"candidates":[[3,3],[6,3]]},{"name":"Large knight","points":[[3,3,1],[6,4,1],[4,3,0],[5,3,0],[4,4,0],[5,4,0]],"candidates":[[3,3],[6,4]]},{"name":"Shoulder hit","points":[[3,3,1],[4,4,-1],[2,2,0],[3,2,0],[4,2,0],[2,3,0],[4,3,0],[2,4,0],[3,4,0]],"candidates":[[3,3]]},{"name":"Diagonal jump","points":[[3,3,1],[5,5,1],[4,3,0],[3,4,0],[4,4,0],[5,4,0],[4,5,0]],"candidates":[[3,3],[5,5]]}]
}

function getCurrentMoveInterpretation() {
    var board = getBoard()
    var tp = getCurrentTreePosition()
    var node = tp[0].nodes[tp[1]]

    // Determine root node

    if (!tp[0].parent && tp[1] == 0) {
        var result = []

        if ('EV' in node) result.push(node.EV[0])
        if ('GN' in node) result.push(node.GN[0])

        result = result.filter(function(x) { return x.trim() != '' }).join(' — ')
        if (result != '')
            return result

        var today = new Date()
        if (today.getDate() == 25 && today.getMonth() == 3)
            return 'Happy Birthday, Sabaki!'
    }

    // Determine end of main variation

    if (gametree.onMainTrack(tp[0]) && !gametree.navigate(tp[0], tp[1], 1)) {
        var rootNode = getRootTree().nodes[0]

        if ('RE' in rootNode && rootNode.RE[0].trim() != '')
            return 'Result: ' + rootNode.RE[0]
    }

    // Determine capture

    var ptp = gametree.navigate(tp[0], tp[1], -1)

    if (ptp) {
        var prevBoard = ptp[0].nodes[ptp[1]].board

        if (!helper.equals(prevBoard.captures, board.captures))
            return 'Take'
    }

    // Get current vertex

    var vertex

    if ('B' in node && node.B[0] != '')
        vertex = sgf.point2vertex(node.B[0])
    else if ('W' in node && node.W[0] != '')
        vertex = sgf.point2vertex(node.W[0])
    else if ('W' in node || 'B' in node)
        return 'Pass'
    else
        return ''

    if (!board.hasVertex(vertex)) return 'Pass'

    var sign = board.arrangement[vertex]
    var neighbors = board.getNeighbors(vertex)

    // Check atari

    if (neighbors.some(function(v) {
        return board.arrangement[v] == -sign && board.getLiberties(v).length == 1
    })) return 'Atari'

    // Check connection

    var friendly = neighbors.filter(function(v) { return board.arrangement[v] == sign})
    if (friendly.length == neighbors.length) return 'Fill'
    if (friendly.length >= 2) return 'Connect'

    // Match shape

    var shapes = getShapes()

    for (var i = 0; i < shapes.length; i++) {
        if (boardmatcher.shapeMatch(shapes[i], board, vertex))
            return shapes[i].name
    }

    if (friendly.length == 1) return 'Stretch'

    // Determine position to edges

    if (vertex[0] == (board.width - 1) / 2 && vertex[1] == (board.height - 1) / 2)
        return 'Tengen'

    var diff = board.getCanonicalVertex(vertex).map(function(x) { return x + 1 })

    if ((diff[0] != 4 || diff[1] != 4) && board.getHandicapPlacement(9).some(function(v) {
        return v[0] == vertex[0] && v[1] == vertex[1]
    })) return 'Hoshi'

    if (diff[1] <= 6)
        return diff.join('-') + ' point'

    return ''
}

/**
 * Methods
 */

function prepareScrollbars() {
    $('#properties').data('scrollbar', new GeminiScrollbar({
        element: $('#properties').get(0),
        createElements: false
    }).create())

    $('#console').data('scrollbar', new GeminiScrollbar({
        element: $('#console').get(0),
        createElements: false
    }).create())

    var $enginesList = $('#preferences .engines-list')
    $enginesList.data('scrollbar', new GeminiScrollbar({
        element: $enginesList.get(0),
        createElements: false
    }).create())

    var $gamesList = $('#gamechooser .games-list')
    $gamesList.data('scrollbar', new GeminiScrollbar({
        element: $gamesList.get(0),
        createElements: false
    }).create())

    $(window).on('resize', function() {
        if (!$('#gamechooser').hasClass('show')) return

        var width = $('#gamechooser .games-list').width() - 20
        var $svgs = $('#gamechooser svg')

        if ($svgs.length == 0) return

        var liwidth = $svgs.eq(0).width() + 12 + 20
        var count = Math.floor(width / liwidth)

        $('#gamechooser li').css('width', Math.floor(width / count) - 20)
        $('#gamechooser .games-list').data('scrollbar').update()
    })
}

function prepareResizers() {
    $('.verticalresizer').on('mousedown', function(e) {
        if (e.button != 0) return
        $(this).parent().data('initposx', [e.screenX, parseFloat($(this).parent().css('width'))])
    })

    $('#sidebar .horizontalresizer').on('mousedown', function(e) {
        if (e.button != 0) return
        $('#sidebar').data('initposy', [e.screenY, getPropertiesHeight()])
        $('#properties').css('transition', 'none')
    })

    $('body').on('mouseup', function() {
        var sidebarInitPosX = $('#sidebar').data('initposx')
        var leftSidebarInitPosX = $('#leftsidebar').data('initposx')
        var initPosY = $('#sidebar').data('initposy')

        if (!sidebarInitPosX && !leftSidebarInitPosX && !initPosY) return

        if (sidebarInitPosX) {
            $('#sidebar').data('initposx', null)
            setting.set('view.sidebar_width', getSidebarWidth())
        } else if (leftSidebarInitPosX) {
            $('#leftsidebar').data('initposx', null)
            setting.set('view.leftsidebar_width', getLeftSidebarWidth())
            return
        } else if (initPosY) {
            $('#sidebar').data('initposy', null)
            $('#properties').css('transition', '')
            setting.set('view.properties_height', getPropertiesHeight())
            setSidebarArrangement(true, true, false)
        }

        if ($('#graph').data('sigma'))
            $('#graph').data('sigma').renderers[0].resize().render()
    }).on('mousemove', function(e) {
        var sidebarInitPosX = $('#sidebar').data('initposx')
        var leftSidebarInitPosX = $('#leftsidebar').data('initposx')
        var initPosY = $('#sidebar').data('initposy')

        if (!sidebarInitPosX && !leftSidebarInitPosX && !initPosY) return

        if (sidebarInitPosX) {
            var initX = sidebarInitPosX[0], initWidth = sidebarInitPosX[1]
            var newwidth = Math.max(initWidth - e.screenX + initX, setting.get('view.sidebar_minwidth'))

            setSidebarWidth(newwidth)
            resizeBoard()
        } else if (leftSidebarInitPosX) {
            var initX = leftSidebarInitPosX[0], initWidth = leftSidebarInitPosX[1]
            var newwidth = Math.max(initWidth + e.screenX - initX, setting.get('view.leftsidebar_minwidth'))

            setLeftSidebarWidth(newwidth)
            resizeBoard()

            $('#console').data('scrollbar').update()
            return
        } else if (initPosY) {
            var initY = initPosY[0], initHeight = initPosY[1]
            var newheight = Math.min(Math.max(
                initHeight + (initY - e.screenY) * 100 / $('#sidebar').height(),
                setting.get('view.properties_minheight')
            ), 100 - setting.get('view.properties_minheight'))

            setPropertiesHeight(newheight)
        }

        $('#properties').data('scrollbar').update()
    })
}

function prepareGameChooser() {
    $('#gamechooser > input').on('input', function() {
        var value = this.value

        $('#gamechooser .games-list li:not(.add)').get().forEach(function(li) {
            if ($(li).find('span').get().some(function(span) {
                return $(span).text().toLowerCase().indexOf(value.toLowerCase()) >= 0
            })) $(li).removeClass('hide')
            else $(li).addClass('hide')
        })

        var $gamesList = $('#gamechooser .games-list')
        $gamesList.data('scrollbar').update()
    })
}

function updateTitle() {
    var basename = function(x) { return x }
    var title = app.getName()
    var filename = getRepresentedFilename()

    if (filename) title = basename(filename)
    if (getGameTrees().length > 1) title += ' — Game ' + (getGameIndex() + 1)
    if (filename && process.platform != 'darwin') title += ' — ' + app.getName()

    document.title = title
}

function addEngineItem(name, path, args) {
    if (!name) name = ''
    if (!path) path = ''
    if (!args) args = ''

    var $ul = $('#preferences .engines-list ul').eq(0)
    var $li = $('<li/>').append(
        $('<h3/>')
        .append(
            $('<input/>')
            .attr('type', 'text')
            .attr('placeholder', '(Unnamed engine)')
            .val(name)
        )
    ).append(
        $('<p/>').append(
            $('<input/>')
            .attr('type', 'text')
            .attr('placeholder', 'Path')
            .val(path)
        ).append(
            $('<a class="browse"/>')
            .on('click', function() {
                setIsBusy(true)

                var result = dialog.showOpenDialog(remote.getCurrentWindow(), {
                    filters: [{ name: 'All Files', extensions: ['*'] }]
                })

                if (result) {
                    $(this).parents('li').eq(0)
                    .find('h3 + p input')
                    .val(result[0])
                    .get(0).focus()
                }

                setIsBusy(false)
            })
            .append(
                $('<img/>')
                .attr('src', '../node_modules/octicons/svg/file-directory.svg')
                .attr('title', 'Browse…')
                .attr('height', 14)
            )
        )
    ).append(
        $('<p/>').append(
            $('<input/>')
            .attr('type', 'text')
            .attr('placeholder', 'No arguments')
            .val(args)
        )
    ).append(
        $('<a class="remove"/>').on('click', function() {
            $(this).parents('li').eq(0).remove()
            $('#preferences .engines-list')[0].data('scrollbar').update()
        }).append(
            $('<img/>')
            .attr('src', '../node_modules/octicons/svg/x.svg')
            .attr('height', 14)
        )
    )

    $ul.append($li)
    $li.find('h3 input').get(0).focus()

    var enginesScrollbar = $('#preferences .engines-list').data('scrollbar')
    if (enginesScrollbar) enginesScrollbar.update()
}

function showMessageBox(message, type, buttons, cancelId) {
    var result = confirm(message)
    return result ? 0 : cancelId

    setIsBusy(true)

    if (!type) type = 'info'
    if (!buttons) buttons = ['OK']
    if (isNaN(cancelId)) cancelId = 0

    var result = dialog.showMessageBox(remote.getCurrentWindow(), {
        type: type,
        buttons: buttons,
        title: app.getName(),
        message: message,
        cancelId: cancelId,
        noLink: true
    })

    setIsBusy(false)
    return result
}

function readjustShifts(vertex) {
    var $li = $('#goban .pos_' + vertex.join('-'))
    var direction = $li.attr('class').split(' ').filter(function(x) {
        return x.indexOf('shift_') == 0
    }).map(function(x) {
        return +x.replace('shift_', '')
    })

    if (direction.length == 0) return
    direction = direction[0]

    var query, removeShifts

    if (direction == 1 || direction == 5 || direction == 8) {
        // Left
        query = (vertex[0] - 1) + '-' + vertex[1]
        removeShifts = [3, 7, 6]
    } else if (direction == 2 || direction == 5 || direction == 6) {
        // Top
        query = vertex[0] + '-' + (vertex[1] - 1)
        removeShifts = [4, 7, 8]
    } else if (direction == 3 || direction == 7 || direction == 6) {
        // Right
        query = (vertex[0] + 1) + '-' + vertex[1]
        removeShifts = [1, 5, 8]
    } else if (direction == 4 || direction == 7 || direction == 8) {
        // Bottom
        query = vertex[0] + '-' + (vertex[1] + 1)
        removeShifts = [2, 5, 6]
    }

    if (query && removeShifts) {
        var $el = $('#goban .pos_' + query)
        $el.addClass('animate')
        removeShifts.forEach(function(s) { $el.removeClass('shift_' + s) })
        setTimeout(function() { $el.removeClass('animate') }, 200)
    }
}

function updateSidebarLayout() {
    var $container = $('#properties .gm-scroll-view')
    $container.css('opacity', 0)

    setTimeout(function() {
        $('#graph').data('sigma').renderers[0].resize().render()
        $('#properties').data('scrollbar').update()
        $container.css('opacity', 1)
    }, 300)
}

function buildBoard() {
    var board = getBoard()
    var rows = []
    var hoshi = board.getHandicapPlacement(9)

    for (var y = 0; y < board.height; y++) {
        var $ol = $('<ol class="row"/>')

        for (var x = 0; x < board.width; x++) {
            var vertex = [x, y]
            var $img = $('<img/>').attr('src', '../img/goban/stone_0.svg')
            var $li = $('<li/>')
            .data('vertex', vertex)
            .addClass('pos_' + x + '-' + y)
            .addClass('shift_' + Math.floor(Math.random() * 9))
            .addClass('random_' + Math.floor(Math.random() * 5))

            if (hoshi.some(function(v) { return helper.equals(v, vertex) }))
                $li.addClass('hoshi')

            var getEndTargetVertex = function(e) {
                var endTarget = document.elementFromPoint(
                    e.touches[0].pageX,
                    e.touches[0].pageY
                )

                if (!endTarget) return null
                var v = $(endTarget).data('vertex')
                if (!v) endTarget = $(endTarget).parents('li').get(0)
                if (endTarget) v = $(endTarget).data('vertex')

                return v
            }

            $ol.append(
                $li.append(
                    $('<div class="stone"/>').append($img).append($('<span/>'))
                )
                .on('mouseup', function(e) {
                    if (!$('#goban').data('mousedown')) return

                    $('#goban').data('mousedown', false)
                    vertexClicked(this, e)
                }.bind(vertex))
                .on('touchend', function(e) {
                    if (!getEditMode() || ['line', 'arrow'].indexOf(getSelectedTool()) < 0)
                        return

                    e.preventDefault()
                    vertexClicked(null, { button: 0 })
                })
                .on('mousemove', function(e) {
                    if (!$('#goban').data('mousedown')) return
                    if (e.button != 0) return

                    drawLine(this)
                }.bind(vertex))
                .on('touchmove', function(e) {
                    e.preventDefault()
                    drawLine(getEndTargetVertex(e))
                })
                .on('mousedown', function() {
                    $('#goban').data('mousedown', true)
                })
                .append($('<div class="paint"/>'))
            )
        }

        rows.push($ol)
    }

    var alpha = 'ABCDEFGHJKLMNOPQRSTUVWXYZ'
    var $coordx = $('<ol class="coordx"/>')
    var $coordy = $('<ol class="coordy"/>')

    for (var i = 0; i < board.width; i++) {
        $coordx.append($('<li/>').text(alpha[i]))
    }

    for (var i = board.height; i > 0; i--) {
        $coordy.append($('<li/>').text(i))
    }

    var $goban = $('#goban div').eq(0)
    $goban.empty().append(rows).append($coordx).append($coordy)
    $goban.prepend($coordx.clone()).prepend($coordy.clone())

    resizeBoard()

    // Readjust shifts

    $('#goban .row li:not(.shift_0)').get().forEach(function(li) {
        readjustShifts($(li).data('vertex'))
    })
}

function updateBoardLines() {
    var tx = parseFloat($('#goban').css('border-left-width'))
    var ty = parseFloat($('#goban').css('border-top-width'))

    $('#goban hr').get().forEach(function(line) {
        var v1 = $(line).data('v1'), v2 = $(line).data('v2')
        var mirrored = v2[0] < v1[0]
        var $li1 = $('#goban .pos_' + v1.join('-'))
        var $li2 = $('#goban .pos_' + v2.join('-'))
        var pos1 = $li1.offset()
        var pos2 = $li2.offset()
        var dy = pos2.top - pos1.top, dx = pos2.left - pos1.left

        var angle = Math.atan(dy / dx) * 180 / Math.PI
        if (mirrored) angle += 180
        var length = Math.sqrt(dx * dx + dy * dy)

        $(line).css({
            top: (pos1.top + $li1.height() / 2 + pos2.top + $li2.height() / 2) / 2 + ty,
            left: (pos1.left + $li1.width() / 2 + pos2.left + $li2.width() / 2) / 2 + tx,
            marginLeft: -length / 2,
            width: length,
            transform: 'rotate(' + angle + 'deg)'
        })
    })
}

function resizeBoard() {
    var board = getBoard()
    if (!board) return

    var $main = $('main')
    var $goban = $('#goban')

    $main.css('width', '').css('height', '')
    var outerWidth = Math.round($main.width())
    var outerHeight = Math.round($main.height())

    if (outerWidth % 2 != 0) outerWidth++
    if (outerHeight % 2 != 0) outerHeight++
    $main.css('width', outerWidth).css('height', outerHeight)

    var boardWidth = board.width
    var boardHeight = board.height
    var width = helper.floorEven(outerWidth - parseFloat($goban.css('padding-left'))
        - parseFloat($goban.css('padding-right'))
        - parseFloat($goban.css('border-left-width'))
        - parseFloat($goban.css('border-right-width')))
    var height = helper.floorEven(outerHeight - parseFloat($goban.css('padding-top'))
        - parseFloat($goban.css('padding-bottom'))
        - parseFloat($goban.css('border-top-width'))
        - parseFloat($goban.css('border-bottom-width')))

    if (getShowCoordinates()) {
        boardWidth += 2
        boardHeight += 2
    }

    var fieldsize = helper.floorEven(Math.min(width / boardWidth, height / boardHeight, 150))
    var minX = fieldsize * boardWidth
    var minY = fieldsize * boardHeight

    $goban.css('width', minX + outerWidth - width)
        .css('height', minY + outerHeight - height)
        .css('margin-left', -(minX + outerWidth - width) / 2 + 'px')
        .css('margin-top', -(minY + outerHeight - height) / 2 + 'px')
    $goban.children('div').css('width', minX).css('height', minY)
        .css('margin-left', -minX / 2 + 'px').css('margin-top', -minY / 2 + 'px')

    $goban.find('.row, .coordx')
    .css('height', fieldsize).css('line-height', fieldsize + 'px')
    .css('margin-left', getShowCoordinates() ? fieldsize : 0)

    $goban.find('.coordy')
    .css('width', fieldsize).css('top', fieldsize).css('line-height', fieldsize + 'px')
    .last()
    .css('left', fieldsize * (board.width + 1))

    $goban.find('li').css('width', fieldsize).css('height', fieldsize)
    $goban.css('font-size', fieldsize)

    setSliderValue.apply(null, getSliderValue())
    if (getIndicatorVertex()) showIndicator(getIndicatorVertex())

    updateBoardLines()
}

function showIndicator(vertex) {
    var x = vertex[0], y = vertex[1]
    var $li = $('#goban .pos_' + x + '-' + y)

    if ($li.length == 0) return

    $('#indicator').css('top', Math.round($li.offset().top))
    .css('left', Math.round($li.offset().left))
    .css('height', Math.round($li.height()))
    .css('width', Math.round($li.width()))
    .data('vertex', vertex)
}

function hideIndicator() {
    $('#indicator')
    .css('top', '')
    .css('left', '')
    .data('vertex', null)
}

function clearConsole() {
    $('#console .inner pre, #console .inner form:not(:last-child)').remove()
    $('#console .inner form:last-child input').eq(0).val('').get(0).focus()
    $('#console').data('scrollbar').update()
}

function wireLinks($container) {
    $container.find('a').on('click', function(e) {
        if ($(this).hasClass('external'))  {
            if (!shell) {
                this.target = '_blank'
                return true
            }

            e.preventDefault()
            shell.openExternal(this.href)
        } else if ($(this).hasClass('movenumber')) {
            e.preventDefault()

            var movenumber = +$(this).text().slice(1)
            setUndoable(true, 'Go Back')
            goToMainVariation()

            var tp = gametree.navigate(getRootTree(), 0, movenumber)
            if (tp) setCurrentTreePosition.apply(null, tp.concat([true, true]))
        }
    })

    $container.find('.coord').on('mouseenter', function() {
        var v = getBoard().coord2vertex($(this).text())
        showIndicator(v)
    }).on('mouseleave', function() {
        if (!getFindMode()) hideIndicator()
    })
}

/**
 * Menus
 */

function openHeaderMenu() {
    var template = [
        {
            label: 'About Sabaki…',
            click: function() {
                var $link = $('<a/>')
                .attr('href', 'http://sabaki.yichuanshen.de')
                .attr('target', '_blank')
                .css('display', 'none')

                $('body').append($link)
                $link.get(0).click()
                $link.remove()
            }
        },
        {
            label: 'Report Issue…',
            click: function() {
                var $link = $('<a/>')
                .attr('href', 'https://github.com/yishn/Sabaki/issues')
                .attr('target', '_blank')
                .css('display', 'none')

                $('body').append($link)
                $link.get(0).click()
                $link.remove()
            }
        },
        { type: 'separator' },
        {
            label: 'New File',
            click: function() { newFile(true) }
        },
        {
            label: 'Open File…',
            click: function() { loadFile() }
        },
        {
            label: 'Download SGF',
            click: function() { saveFile() }
        },
        { type: 'separator' },
        {
            label: 'Show Coordinates',
            checked: getShowCoordinates(),
            click: function() { setShowCoordinates(!getShowCoordinates()) }
        },
        {
            label: 'Show Next Moves',
            checked: getShowNextMoves(),
            click: function() { setShowNextMoves(!getShowNextMoves()) }
        },
        {
            label: 'Show Sibling Variations',
            checked: getShowSiblings(),
            click: function() { setShowSiblings(!getShowSiblings()) }
        },
        {
            label: 'Manage Games…',
            click: function() { showGameChooser() }
        },
        { type: 'separator' },
        {
            label: '&Pass',
            click: function() { makeMove([-1, -1]) }
        },
        {
            label: '&Resign',
            click: function() { makeResign() }
        },
        { type: 'separator' },
        {
            label: '&Score',
            click: function() { setScoringMode(true) }
        },
        {
            label: 'Es&timate',
            click: function() { setEstimatorMode(true) }
        },
        {
            label: '&Edit',
            click: function() { setEditMode(true) }
        },
        {
            label: '&Find',
            click: function() { setFindMode(true) }
        },
        { type: 'separator' },
        {
            label: '&Info',
            click: function() { showGameInfo() }
        }
    ]

    menu = Menu.buildFromTemplate(template)
    menu.popup(
        remote.getCurrentWindow(),
        Math.round($('#headermenu').offset().left),
        Math.round($('header').offset().top)
    )
}

function openCommentMenu() {
    var tp = getCurrentTreePosition()
    var node = tp[0].nodes[tp[1]]

    var clearProperties = function(properties) {
        properties.forEach(function(p) { delete node[p] })
    }
    var clearPosAnnotations = clearProperties.bind(null, ['UC', 'GW', 'DM', 'GB'])
    var clearMoveAnnotations = clearProperties.bind(null, ['BM', 'TE', 'DO', 'IT'])
    var clearHotspot = clearProperties.bind(null, ['HO'])

    var template = [
        {
            label: '&Clear Annotations',
            click: function() {
                clearPosAnnotations()
                clearMoveAnnotations()
                updateSidebar(true, true)
            }
        },
        { type: 'separator' },
        {
            label: 'Good for &Black',
            type: 'checkbox',
            data: ['GB', clearPosAnnotations, 1]
        },
        {
            label: '&Unclear Position',
            type: 'checkbox',
            data: ['UC', clearPosAnnotations, 1]
        },
        {
            label: '&Even Position',
            type: 'checkbox',
            data: ['DM', clearPosAnnotations, 1]
        },
        {
            label: 'Good for &White',
            type: 'checkbox',
            data: ['GW', clearPosAnnotations, 1]
        }
    ]

    if ('B' in node || 'W' in node) {
        template.push.apply(template, [
            { type: 'separator' },
            {
                label: '&Good Move',
                type: 'checkbox',
                data: ['TE', clearMoveAnnotations, 1]
            },
            {
                label: '&Interesting Move',
                type: 'checkbox',
                data: ['IT', clearMoveAnnotations, '']
            },
            {
                label: '&Doubtful Move',
                type: 'checkbox',
                data: ['DO', clearMoveAnnotations, '']
            },
            {
                label: 'B&ad Move',
                type: 'checkbox',
                data: ['BM', clearMoveAnnotations, 1]
            }
        ])
    }

    template.push.apply(template, [
        { type: 'separator' },
        {
            label: '&Hotspot',
            type: 'checkbox',
            data: ['HO', clearHotspot, 1]
        }
    ])

    template.forEach(function(item) {
        if (!('data' in item)) return

        var p = item.data[0], clear = item.data[1], value = item.data[2]

        delete item.data
        item.checked = p in node
        item.click = function() {
            if (p in node) {
                clear()
            } else {
                clear()
                node[p] = [value]
            }

            setCurrentTreePosition.apply(null, getCurrentTreePosition().concat([true, true]))
        }
    })

    menu = Menu.buildFromTemplate(template)
    var $el = $('#properties .edit .header img')

    menu.popup(
        remote.getCurrentWindow(),
        Math.round($el.offset().left),
        Math.round($el.offset().top + $el.height())
    )
}

function openEnginesMenu($element, callback) {
    if (!callback) callback = function() {}

    var currentIndex = $element.data('engineindex')
    if (currentIndex == null) currentIndex = -1

    var template = [{
        label: '&Manual',
        type: 'checkbox',
        checked: currentIndex < 0,
        click: function() { callback(null, -1) }
    }]

    var engineItems = setting.getEngines().map(function(engine, i) {
        return {
            label: engine.name,
            type: 'checkbox',
            checked: currentIndex == i,
            click: function() { callback(engine, i) }
        }
    })

    if (engineItems.length > 0) {
        template.push({ type: 'separator' })
        template.push.apply(template, engineItems)
    }

    template.push({ type: 'separator'})
    template.push({
        label: 'Manage &Engines…',
        click: function() {
            showPreferences()
            setPreferencesTab('engines')
        }
    })

    menu = Menu.buildFromTemplate(template)
    menu.popup(
        remote.getCurrentWindow(),
        Math.round($element.offset().left),
        Math.round($element.offset().top + $element.height())
    )
}

function openNodeMenu(tree, index, event) {
    if (getScoringMode()) return

    var template = [
        {
            label: 'Make &Main Variation',
            click: function() { makeMainVariation(tree, index) }
        },
        {
            label: '&Remove',
            click: function() { removeNode(tree, index) }
        }
    ]

    menu = Menu.buildFromTemplate(template)
    menu.popup(remote.getCurrentWindow(), Math.round(event.clientX), Math.round(event.clientY))
}

function openGameMenu($element, event) {
    var template = [
        {
            label: '&Remove Game',
            click: function() {
                var trees = getGameTrees()

                if (showMessageBox(
                    'Do you really want to remove this game permanently?',
                    'warning',
                    ['Remove Game', 'Cancel'], 1
                ) == 1) return

                var index = $element.parents('ol').eq(0)
                .find('li div').get()
                .indexOf($element.get(0))

                trees.splice(index, 1)
                setGameTrees(trees)

                if (trees.length == 0) {
                    trees.push(getEmptyGameTree())
                    setGameIndex(0)
                    closeGameChooser()
                } else {
                    setGameIndex(0)
                    showGameChooser(true)
                }
            }
        },
        {
            label: 'Remove &Other Games',
            click: function() {
                if (showMessageBox(
                    'Do you really want to remove all other games permanently?',
                    'warning',
                    ['Remove Games', 'Cancel'], 1
                ) == 1) return

                setGameTrees([$element.parents('li').eq(0).data('gametree')])
                setGameIndex(0)
                showGameChooser(true)
            }
        }
    ]

    var menu = Menu.buildFromTemplate(template)
    menu.popup(remote.getCurrentWindow(), Math.round(event.clientX), Math.round(event.clientY))
}

function openAddGameMenu() {
    var template = [
        {
            label: 'Add &New Game',
            click: function() {
                var tree = getEmptyGameTree()

                setGameTrees(getGameTrees().concat([tree]))
                setGameIndex(getGameTrees().length - 1)
                showGameChooser(true)
            }
        }
    ]

    var menu = Menu.buildFromTemplate(template)
    var $button = $('#gamechooser').find('button[name="add"]')
    menu.popup(
        remote.getCurrentWindow(),
        Math.round($button.offset().left),
        Math.round($button.offset().top + $button.height())
    )
}

/**
 * Drawers
 */

function showGameInfo() {
    closeDrawers()

    var tree = getRootTree()
    var rootNode = tree.nodes[0]
    var $info = $('#info')
    var data = {
        'rank_1': 'BR',
        'rank_-1': 'WR',
        'name': 'GN',
        'event': 'EV',
        'date': 'DT',
        'result': 'RE'
    }

    $info.addClass('show').find('input[name="name_1"]').get(0).focus()

    for (var key in data) {
        var value = data[key]
        $info.find('input[name="' + key + '"]').val(value in rootNode ? rootNode[value][0] : '')
    }

    $info.find('input[name="name_1"]').val(gametree.getPlayerName(1, tree, ''))
    $info.find('input[name="name_-1"]').val(gametree.getPlayerName(-1, tree, ''))
    $info.find('input[name="komi"]').val('KM' in rootNode ? +rootNode.KM[0] : '')
    $info.find('input[name="size-width"]').val(getBoard().width)
    $info.find('input[name="size-height"]').val(getBoard().height)
    $info.find('section .menu').removeClass('active').data('engineindex', -1)

    var handicap = $info.find('select[name="handicap"]').get(0)
    if ('HA' in rootNode) handicap.selectedIndex = Math.max(0, +rootNode.HA[0] - 1)
    else handicap.selectedIndex = 0

    var disabled = tree.nodes.length > 1
        || tree.subtrees.length > 0
        || ['AB', 'AW', 'W', 'B'].some(function(x) { return x in rootNode })

    $info.find('input[name^="size-"]').add(handicap).prop('disabled', disabled)
    $info.toggleClass('disabled', disabled)
}

function closeGameInfo() {
    $('#info').removeClass('show')
    document.activeElement.blur()
}

function showScore() {
    var board = $('#goban').data('finalboard')
    var score = board.getScore($('#goban').data('areamap'))
    var rootNode = getRootTree().nodes[0]

    for (var sign = -1; sign <= 1; sign += 2) {
        var $tr = $('#score tbody tr' + (sign < 0 ? ':last-child' : ''))
        var $tds = $tr.find('td')

        $tds.eq(0).text(score['area_' + sign])
        $tds.eq(1).text(score['territory_' + sign])
        $tds.eq(2).text(score['captures_' + sign])
        if (sign < 0) $tds.eq(3).text(getKomi())
        $tds.eq(4).text(0)

        setScoringMethod(setting.get('scoring.method'))
    }

    $('#score').addClass('show')
}

function closeScore() {
    $('#score').removeClass('show')
}

function showPreferences() {
    // Load preferences

    $('#preferences input[type="checkbox"]').get().forEach(function(el) {
        el.checked = !!setting.get(el.name)
    })

    loadEngines()

    // Show preferences

    setPreferencesTab('general')
    closeDrawers()
    $('#preferences').addClass('show')
}

function closePreferences() {
    $('#preferences').removeClass('show')
    document.activeElement.blur()
}

function showGameChooser(restoreScrollbarPos) {
    if (restoreScrollbarPos == null)
        restoreScrollbarPos = true

    var scrollbarPos = restoreScrollbarPos ? $('#gamechooser .gm-scroll-view').scrollTop() : 0

    closeDrawers()

    $('#gamechooser > input').eq(0).val('').get(0).focus()
    $('#gamechooser ol').eq(0).empty()

    var trees = getGameTrees()
    var currentTree = getRootTree()

    for (var i = 0; i < trees.length; i++) {
        var tree = trees[i]
        var $li = $('<li/>')
        var tp = gametree.navigate(tree, 0, 30)
        if (!tp) tp = gametree.navigate(tree, 0, gametree.getCurrentHeight(tree) - 1)

        var board = gametree.addBoard.apply(null, tp).nodes[tp[1]].board
        var svg = board.getSvg(setting.get('gamechooser.thumbnail_size'))
        var node = tree.nodes[0]

        $('#gamechooser ol').eq(0).append($li.append(
            $('<div/>')
            .attr('draggable', 'true')
            .append($('<span/>'))
            .append(svg)
            .append($('<span class="black"/>').text('Black'))
            .append($('<span class="white"/>').text('White'))
        ))

        var $gamename = $li.find('span').eq(0)
        var $black = $li.find('.black').text(gametree.getPlayerName(1, tree, 'Black'))
        var $white = $li.find('.white').text(gametree.getPlayerName(-1, tree, 'White'))

        if ('BR' in node) $black.attr('title', node.BR[0])
        if ('WR' in node) $white.attr('title', node.WR[0])
        if ('GN' in node) $gamename.text(node.GN[0]).attr('title', node.GN[0])
        else if ('EV' in node) $gamename.text(node.EV[0]).attr('title', node.EV[0])

        $li.data('gametree', tree).find('div').on('click', function() {
            var link = this
            closeGameChooser()
            setTimeout(function() {
                setGameIndex($('#gamechooser ol li div').get().indexOf(link))
            }, 500)
        }).on('mouseup', function(e) {
            if (e.button != 2) return
            openGameMenu($(this), e)
        }).on('dragstart', function(e) {
            $('#gamechooser').data('dragging', $(this).parents('li').eq(0))
        })
    }

    $('#gamechooser ol li').off('dragover').on('dragover', function(e) {
        e.preventDefault()
        if (!$('#gamechooser').data('dragging')) return

        var x = e.clientX
        var middle = $(this).offset().left + $(this).width() / 2

        if (x <= middle - 10 && !$(this).hasClass('insertleft')) {
            $('#gamechooser ol li').removeClass('insertleft').removeClass('insertright')
            $(this).addClass('insertleft')
        } else if (x > middle + 10 && !$(this).hasClass('insertright')) {
            $('#gamechooser ol li').removeClass('insertleft').removeClass('insertright')
            $(this).addClass('insertright')
        }
    })

    $('#gamechooser').off('drop').on('drop', function() {
        var dragged = $(this).data('dragging')
        $(this).data('dragging', null)

        var $lis = $('#gamechooser ol li')
        var afterli = $lis.get().filter(function(x) { return $(x).hasClass('insertleft') })[0]
        var beforeli = $lis.get().filter(function(x) { return $(x).hasClass('insertright') })[0]
        $lis.removeClass('insertleft').removeClass('insertright')

        if (!dragged || !afterli && !beforeli) return

        if (afterli) $(afterli).before(dragged)
        if (beforeli) $(beforeli).after(dragged)

        setGameTrees($('#gamechooser ol > li').get().map(function(x) {
            return $(x).data('gametree')
        }))

        var newindex = getGameTrees().indexOf(currentTree)
        setGameIndex(newindex)
    })

    $('#gamechooser').addClass('show')
    $(window).trigger('resize')
    $('#gamechooser .gm-scroll-view').scrollTop(scrollbarPos)
}

function closeGameChooser() {
    $('#gamechooser').removeClass('show')
    document.activeElement.blur()
}

function closeDrawers() {
    closeGameInfo()
    closeScore()
    closePreferences()
    closeGameChooser()
    setEditMode(false)
    setScoringMode(false)
    setEstimatorMode(false)
    setFindMode(false)
    setGuessMode(false)
}

/**
 * Main
 */

$(document).ready(function() {
    document.title = app.getName()

    $('body').on('mouseup', function() {
        $('#goban').data('mousedown', false)
    })

    prepareScrollbars()
    prepareResizers()
    prepareGameChooser()
})
