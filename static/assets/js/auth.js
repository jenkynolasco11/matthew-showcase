var authPanel = $('.auth-overlay')

var login = $('.auth .content .login')
var signup = $('.auth .content .signup')
var radioVal = $('[name=auth-nav]')
var openLogin = $('li.login-button')

var formLogin = $('form.login')
var formSignup = $('form.signup')

var cancel = $('.auth .cancel span')

radioVal.on('change', function () {
    $(login).toggleClass('hidden')
    $(signup).toggleClass('hidden')
})

function openAuth() {
    authPanel.css('display','flex').hide().fadeIn(500)
}

function closeAuth() {
    authPanel.fadeOut(500)
}

function onSubmitAuthInfo(e) {
    console.log('hey, bob!')

    e.preventDefault()

    var data = $(this).serializeArray().reduce(function(p,n){
        p[ n.name ] = n.value

        return p
    }, {})

    var url = data.type === 'login' ? '/auth/login' : '/auth/signup'

    $.post(url, data, function(err, data) {
        console.log(err)
        console.log(data)
    })
}

console.log(formSignup)

$(document).ready(function(){
    cancel.on('click', closeAuth)

    openLogin.each(function(){
        $(this).on('click', openAuth)
    })

    formLogin.submit(onSubmitAuthInfo)
    formSignup.submit(onSubmitAuthInfo)
})
