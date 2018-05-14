var selectors = $('.user-nav li')
var sections = $('.selected-item-content')
var authPanel = $('.auth-overlay')

var settingsForm = $('#settings-form')
var socialButton = $('#social-button')
var socialMessage = $('#message-social')
var socialMessageText = $('#message-social-text')

var handlers = {
  chat : {
    total : 0,
    skip : 0,
    limit : 5,
  }, msg : {
    total : 0,
    skip : 0,
    limit : 5,
  }
}

var emailMessages = []
var chatMessages = []

function removeClassTo(cls, items) {
  $(items).each(function () {
    $(this).removeClass(cls)
  })
}

function openAuth() {
  authPanel.css('display', 'flex').hide().fadeIn(500)
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

function buildTemplate(year, make, model, price, trim, options, img) {
  var opts = options.map(function (opt) {
    var key = opt.match(/\{.*\}/)[0]
    //   // console.log(opt.match())
    return (`
          <div className="option-text">
              <span className="field-name">${ key.replace(/[\{\}]/g,'').replace(/_/g,' ') }: </span>
              <span className="field-text">${ opt.match(/\}(.*)/)[0].slice(1) }</span>
          </div>
          <br/>
    `)
  }).join(' ')

  return `
    <div class="build-parent-div col-col-xs-12 no-padding">
      <div class='builds-list'>
        <div class='car-information col-sm-12 no-padding'>
          <div class='builds-container'>
            <a href='#'>
              <div class='build-image'>
                <div class='build-price'>${price}</div>
                <img src="${ img || '/assets/images/no-car-selected.png' }" alt='' />
              </div>
              <div class='builds-specs'>
                <div class='builds-child-flex row'>
                  <div class='builds-child-item'>${year}</div>
                  <div class='builds-child-item'>${make}</div>
                  <div class='builds-child-item'>${model}</div>
                  <div class='builds-child-item'>${trim}</div>
                </div>
                <div class='builds-child-flex'>
                  <div class='builds-child-item add-info'>Additional Options: 
                  ${ opts }
                  </div>
                </div>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
    `
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

var paginationTemplate = function(items) {
  return `
  <li class="paginate-item paginate-nav" data-increase="-1">
      <a href=#>
          <i class="icon fa fa-angle-double-left"></i>
      </a>
  </li>
  ${ items }
  <li class="paginate-item paginate-nav" data-increase="1">
      <a href=#>
          <i class="icon fa fa-angle-double-right"></i>
      </a>
  </li>
  `
}

function renderPaginationOn(element, hndl, getFunction) {
  var pages = Math.ceil(handlers[ hndl ].total/handlers[ hndl ].limit)
  var itms = ''

  for(var i = 1; i <= pages; i++) {
    itms += `
    <li class="page-item paginate-page ${ i-1 === handlers[ hndl ].skip ? 'active' : '' }" data-skip=${ i - 1 }>
        <a class="page-link" href=#>
            ${ i }
        </a>
    </li>
    `
  }
  $(element).children('.pagination').html('')
  $(element).children('.pagination').append(paginationTemplate(itms))

  $(element).children('.pagination').children('.paginate-nav').each(function() {
    $(this).on('click', function(e) {
        e.preventDefault()

        var i = $(this).data('increase')

        if(handlers[ hndl ].skip + i >= 0 && handlers[ hndl ].skip + i < pages) {
          handlers[ hndl ].skip += i

          return getFunction()
        }
    })
  })

  $(element).children('.pagination').children('.paginate-page').on('click', function(e) {
    e.preventDefault()

    handlers[ hndl ].skip = $(this).data('skip')

    return getFunction()
  })

  // console.log(handlers)
}

function getEmailMessages() {
  var url = `/user/email-messages?skip=${ handlers[ 'msg' ].skip * handlers[ 'msg' ].limit }&limit=${ handlers[ 'msg' ].limit }`

  $.get(url, function(data) {
    if(data.ok) {
      var table = $('.messages-section .email-messages')
      var tbody = table.children('table').children('tbody')
      var rows = ''

      data.messages.forEach(function(msg) {
        rows += `
          <tr>
            <td>${ msg.type }</td>
            <td>${ new Date(msg.createdBy).toLocaleDateString() + ' ' + new Date(msg.createdBy).toLocaleTimeString() }</td>
          </tr>
        `
      })

      tbody.html('')
      tbody.append($(rows))
      renderPaginationOn(table, 'msg', getEmailMessages)
    }
  })
}

function getChatMessages() {
  var url = `/user/chat-messages?skip=${ handlers[ 'chat' ].skip * handlers[ 'chat' ].limit }&limit=${ handlers[ 'chat' ].limit }`

  $.get(url, function(data) {
    if(data.ok) {
      var table = $('.messages-section .chat-messages')
      var tbody = table.children('table').children('tbody')
      var rows = ''

      data.chatMessages.forEach(function(msg) {
        rows += `
          <tr>
            <td>${ msg.from }</td>
            <td>${ msg.msg.length > 50 ? msg.msg.slice(0, 50) + '...' : msg.msg }</td>
            <td>${ new Date(msg.timestamp).toLocaleDateString() + ' ' + new Date(msg.timestamp).toLocaleTimeString() }</td>
          </tr>
        `
      })

      tbody.html('')
      tbody.append($(rows))
      renderPaginationOn(table, 'chat', getChatMessages)
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

  $.get('/user/messages/count', function(data) {
    if(data.ok) {
      handlers[ 'chat' ].total = data.chatCount
      handlers[ 'msg' ].total = data.msgCount

      getChatMessages()
      getEmailMessages()
    }
  })

  $('.completion-message a').on('click', function(e) {
    e.preventDefault()

    $(`.selected-item-content.selected`).hide().removeClass('selected')
    $('li[data-for*=user].selected').removeClass('selected')

    $(`#user-settings`).addClass('selected').css('display', 'block')
    $('li[data-for=user-settings]').addClass('selected')
  })
})

getBuildsFromUser()
getInterestFromUser()
