var selectors = $('.user-nav li')
var sections = $('.selected-item-content')
var authPanel = $('.auth-overlay')

var referralForm = $('#referral-form')
var settingsForm = $('#settings-form')
var socialButton = $('#social-button')
var socialMessage = $('#message-social')
var socialMessageText = $('#message-social-text')

function onSubmitReferral(e) {
  e.preventDefault()

  var self = this
  var data = $(this).serializeArray()

  $.post('/user/referral-program', data, function (res) {
    if(res.ok) {
      $(self).find('.referral-info:last-child').css('opacity', '1')
      $(self)[0].reset()

      setTimeout(function() {
        $(self).find('.referral-info:last-child').css('opacity', '0')
      }, 5000)
    }

    else console.log('not success...')
  })
}

function removeClassTo(cls, items) {
  $(items).each(function () {
    $(this).removeClass(cls)
  })
}

function onSubmitSettings(e) {
  e.preventDefault()

  socialButton.attr('disabled', true)

  var data = $(this).serializeArray()

  // console.log(data)

  $.post('/user/social', data, function (res) {
    // console.log(res)
    if (res.ok) {
      var completion = res.completion

      if(completion === 9) $('.completion-bar').hide()
      else {
        $('.completion-bar').css('display', 'block')
        var percentage = Math.ceil((completion / 9) * 100)
        var percentageText = `${ percentage }%`
        $('.completion-progress').css('width', percentageText )
        $('.completion-message .percentage').html(percentageText)
      }

      $(socialMessage).append(`<p id="message-social-text">${res.message}</p>`)

      setTimeout(function() {
        socialButton.removeAttr('disabled')
        $('#message-social p').remove()
      }, 5000)
    } else {
      // TODO: if server is restarted, it should redirect you to home page
      // $(socialMessage).append(`<p id="message-social-text">${data.message}</p>`)
      // openAuth()

      window.location.href = '/'
    }
  })
}

function interestTemplate(year, make, model, source, id) {
  return `
    <div class="build-car col-xs-12">
      <a class='interest-list' href='/details/${id}'>
        <div class="car-information col-sm-12">
          <div class='flex-container'>
            <div class='flex-item'><img src='${source}' alt="car" /></div>
            <div class='flex-item'>${year}</div>
            <div class='flex-item'>${make}</div>
            <div class='flex-item'>${model}</div>
          </div>
        </div>
      </a>
    </div>
  `
}

function getBuildsFromUser() {
  $.get(`/car/build/user/`, function (data) {
    // console.log(data.builds[0].options.selectedOptions)
    if (data.ok) {
      // console.log(data.likedCars[0].imgs[0].src)
      var container = $('#user-builds')
      var content = data.builds.map(function (build) {
        return $(buildTemplate(
          build.options.year,
          build.options.make,
          build.options.model,
          build.options.optionsPrice,
          build.options.trim,
          build.options.selectedOptions,
          build.imgurl
        ))
      })
      container.append(content)
    }
  })
}

function getInterestFromUser() {
  $.get(`/car/build/user/`, (data) => {
    // console.log(data)
    if (data.ok) {
      // console.log(data)
      let container = $('#user-interests')
      let content = data.likedCars.map(function (interest) {
        return $(interestTemplate(
          interest.year,
          interest.make,
          interest.model,
          interest.imgs[0].src,
          interest.id
        ))
      })
      container.append(content)
    }
  })
}

selectors.each(function () {
  $(this).on('click', function () {
    var id = $(this).data('for')

    $(`.selected-item-content.selected`).hide().removeClass('selected')
    $('li[data-for*=user].selected').removeClass('selected')

    $(`#${id}`).addClass('selected').css('display', 'block')
    $(this).addClass('selected')
    // removeClassTo('selected', selectors)
    // removeClassTo('selected', sections)


    // $(`#${id}`).addClass('selected')
    // $(this).addClass('selected')
  })
})

$(document).ready(function () {
  $(settingsForm).submit(onSubmitSettings)
  $(referralForm).submit(onSubmitReferral)

  $('.completion-message a').on('click', function(e) {
    e.preventDefault()

    $(`.selected-item-content.selected`).hide().removeClass('selected')
    $('li[data-for*=user].selected').removeClass('selected')

    $(`#user-settings`).addClass('selected').css('display', 'block')
    $('li[data-for=user-settings]').addClass('selected')
  })
})

getInterestFromUser()
