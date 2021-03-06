var form = $('#credit-app-form')
var check = $('#agree')

function submitIfAgree() {
    if (!check.is(':checked')) return false

    submitInformation()
    clearInputs()
    return false
}

function clearInputs() {
    check.prop('checked', false)
    $('.form-button input[type=submit]').addClass('disabled')
    $('.form-button input[type=submit]').prop('disabled', true)
}

check.on('change', function (e) {
    if (e.target.checked) {
        $('.form-button input[type=submit]').removeClass('disabled')
        $('.form-button input[type=submit]').prop('disabled', false)
    }
    else {
        $('.form-button input[type=submit]').addClass('disabled')
        $('.form-button input[type=submit]').prop('disabled', true)
    }
})
