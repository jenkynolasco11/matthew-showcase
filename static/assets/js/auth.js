var authPanel = $('.auth-overlay')

var login = $('.auth .content .login')
var signup = $('.auth .content .signup')
var radioVal = $('[name=auth-nav]')

var cancel = $('.auth .cancel span')

radioVal.on('change', function () {
    $(login).toggleClass('hidden')
    $(signup).toggleClass('hidden')
})

function openAuth() {
    authPanel.css('display','flex').hide().fadeIn(500)
}

function closeAuth() {
    authPanel.fadeOut(500).css('display', 'none')
}

setTimeout(openAuth, 1000)

cancel.on('click', closeAuth)
