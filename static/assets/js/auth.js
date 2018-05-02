var login = $('.auth .content .login')
var signup = $('.auth .content .signup')
var radioVal = $('[name=auth-nav]')

radioVal.on('change', function () {
    $(login).toggleClass('hidden')
    $(signup).toggleClass('hidden')
})
