var authPanel = $('.auth-overlay')

var login = $('.auth .content .login')
var signup = $('.auth .content .signup')
var radioVal = $('[name=auth-nav]')
var loginLogout = $('li.login-button:not(.has-submenu)')
// var likeButton = $('.list-goods .b-goods-1__choose')

var formLogin = $('form.login')
var formSignup = $('form.signup')

var cancel = $('.auth .cancel span')

radioVal.on('change', function () {
    $(login).toggleClass('hidden')
    $(signup).toggleClass('hidden')
})

function openAuth() { authPanel.css('display', 'flex').hide().fadeIn(500) }
function closeAuth() { authPanel.fadeOut(500) }

var loggedInButtonTemplate = function (name) {
    return `
    <li class="login-button has-submenu">
        <a href="#">
            Welcome, ${ name.split(' ')[ 0 ] }
            <span class="caret"></span>
        </a>
        <div class="wrap-inside-nav">
            <div class="inside-col">
                <ul class="inside-nav">
                    <li class="user-settings">
                        <a href="/dashboard">Dashboard</a>
                    </li>
                    <li class="logout-button">
                        <a href="#">Logout</a>
                    </li>
                </ul>
            </div>
        </div>
    </li>
    `
}

var logInButtonTemplate = function () {
    return '<li class="login-button"><a href="#"> Login </a></li>'
}

function onLogOut() {
    // console.log('sup...')
    $.get('/auth/logout', function (data) {
        // console.log(data)
        if (data.ok) {
            $('.main-menu li.login-button').remove()
            $('.nav.navbar-nav li.login-button').remove()

            var logIn = $(logInButtonTemplate())

            $('.main-menu').append(logIn)
            $('.nav.navbar-nav').append(logIn)

            $('li.login-button').each(function () {
                $(this).on('click', openAuth)
            })

            window.sessionStorage.removeItem('chat:name')
            window.sessionStorage.removeItem('chat:email')

            window.location.href = '/'
        }
    })
}

function addEventToLogout() {
    $('.login-button .wrap-inside-nav .inside-nav .logout-button').on('click', function () {
        onLogOut()
    })
}

function checkAuthentication() {
    window.sessionStorage.removeItem('user')

    $.get('/auth/is-auth', function (data) {
        if (data.ok) {
            window.sessionStorage.setItem('user', JSON.stringify(data.user))
        }
    })
}

function openErrorMsg(errorMsg) {
    var msg = errorMsg || 'Username and Password doesn\'t match'
    var error = $('.auth .cancel .error-message')

    error.html(msg)

    error.fadeIn(500).delay(6000).fadeOut(500)
}

function onSubmitAuthInfo(e) {
    e.preventDefault()

    var data = $(this).serializeArray().reduce(function (p, n) {
        p[n.name] = n.value

        return p
    }, {})

    if(data.type === 'signup' && data.pass !== data.passConfirm) return openErrorMsg('Passwords doesn\'t match')

    var url = data.type === 'login' ? '/auth/login' : '/auth/signup'

    $.post(url, data, function (res) {
        // console.log(res)
        if (res.ok) {
            if(res.redirectTo) return window.location.href = res.redirectTo

            closeAuth()

            $('.main-menu li.login-button').remove()
            $('.nav.navbar-nav li.login-button').remove()

            window.sessionStorage.setItem('user', JSON.stringify(res.user))

            var loggedIn = $(loggedInButtonTemplate(res.user.name))

            $(loggedIn).on('click', function () {
                $('li.login-button .wrap-inside-nav').toggleClass('collapse')
            })

            $('.main-menu').append(loggedIn)
            $('.nav.navbar-nav').append(loggedIn)

            addEventToLogout()

            window.location.href = '/dashboard'
        } else openErrorMsg(res.msg)
    })
}

$(document).ready(function () {
    cancel.on('click', closeAuth)

    loginLogout.each(function () {
        $(this).on('click', openAuth)
    })

    $('.auth-overlay').on('click', closeAuth)
    $('.auth-overlay *').on('click', function(e) {
        e.stopPropagation()
    })

    formLogin.submit(onSubmitAuthInfo)
    formSignup.submit(onSubmitAuthInfo)

    addEventToLogout()
    checkAuthentication()
})

// TODO: Create submenu, change login text to Welcome. xxxx (plus submenu for logout)
