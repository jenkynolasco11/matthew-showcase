var selectors = $('.user-nav li')
var sections = $('.selected-item-content')
var socialButton = $('#social-button')
var socialMessage = $('#message-social')
var socialMessageText = $('#message-social-text')
var authPanel = $('.auth-overlay')

function removeClassTo(cls, items) {
    $(items).each(function() {
        $(this).removeClass(cls)
    })
}

function openAuth() { authPanel.css('display','flex').hide().fadeIn(500) }

$(socialButton).click(function(e){
  e.preventDefault();
  console.log('clicked')
  $(socialButton)[0].disabled = true;
  setTimeout(function() {
    $(socialButton)[0].disabled = false;
    $('#message-social p').remove();
  }, 5000)
  $.post('/user/social', ({ fbHandle: facebook.value, igHandle: Instagram.value, twHandle: Twitter.value }), function(data) {
    console.log(data)
    if (data.ok) {
      $(socialMessage).append(`<p id="message-social-text">${data.message}</p>`)
    }
    if (!data.ok) {
      $(socialMessage).append(`<p id="message-social-text">${data.message}</p>`)
      openAuth()
    }
  })
})


function buildTemplate(year, make, model, price, trim, options) {
  function mapOptions(option) {
    return option;
  }
    return `
    <div class="build-parent-div col-col-xs-12 no-padding">
      <div class='builds-list'>
        <div class='car-information col-sm-12 no-padding'>
          <div class='builds-container'>
            <a href='#'>
              <div class='build-image'>
                <div class='build-price'>${price}</div>
                <img src="http://media.carbook.com/autoBuilderData/stockPhotos/28167.jpg" alt='' />
              </div>
              <div class='builds-specs'>
                <div class='builds-child-flex'>
                  <div class='builds-child-item'>${year}</div>
                  <div class='builds-child-item'>${make}</div>
                  <div class='builds-child-item'>${model}</div>
                  <div class='builds-child-item'>${trim}</div>
                </div>
                <div class='builds-child-flex'>
                  <div class='builds-child-item add-info'>Additional Options: ${options.map(mapOptions).join(' ')}</div>
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
  $.get(`/car/build/user/`, function(data) {
    console.log(data.builds[0].options.selectedOptions)
    if(data.ok) {
      console.log(data.likedCars[0].imgs[0].src)
      var container = $('#user-builds')
      var content = data.builds.map(function(build) {
        return $(buildTemplate(
          build.options.year,
          build.options.make,
          build.options.model,
          build.options.optionsPrice,
          build.options.trim,
          build.options.selectedOptions
        ))
      })
      container.append(content)
    }
  })
}

function getInterestFromUser() {
  $.get(`/car/build/user/`, (data) => {
    console.log(data)
    if(data.ok) {
      console.log(data)
      let container = $('#user-interests')
      let content = data.likedCars.map(function(interest) {
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

selectors.each(function(){
    $(this).on('click', function() {
      var id = $(this).data('for')

      $(`.selected-item-content.selected`).fadeOut(500).hide().removeClass('selected')
      $('li[data-for*=user].selected').removeClass('selected')

      $(`#${id}`).addClass('selected').css('display','block')
      $(this).addClass('selected')
        // removeClassTo('selected', selectors)
        // removeClassTo('selected', sections)


        // $(`#${id}`).addClass('selected')
        // $(this).addClass('selected')
    })
})

getBuildsFromUser()
getInterestFromUser()
