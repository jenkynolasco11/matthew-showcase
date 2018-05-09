var selectors = $('.user-nav li')
var sections = $('.selected-item-content')

function removeClassTo(cls, items) {
    $(items).each(function() {
        $(this).removeClass(cls)
    })
}

function buildTemplate(year, make, model) {
    return `
    <div class="build-car col-md-4 col-sm-6 col-xs-12">
        <figure class="col-md-4 col-sm-12">
            <img src="" alt="car" />
        </figure>
        <div class="car-information col-md-8 col-sm-12">
            <h5>${ year } ${ make } ${ model }</h5>

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

function getInterestFromUser() {
  $.get(`/car/build/user/`, (data) => {
    if(data.ok) {
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

function getBuildsFromUser() {
  $.get(`/car/build/user/`, function(data) {

    if(data.ok) {
      console.log(data.likedCars[0].imgs[0].src)
      var container = $('#user-builds')
      var content = data.builds.map(function(build) {
        return $(buildTemplate(
          build.options.year,
          build.options.make,
          build.options.model
        ))
      })
      container.append(content)
    }
  })
}

selectors.each(function(){
    $(this).on('click', function() {

        removeClassTo('selected', selectors)
        removeClassTo('selected', sections)

        var id = $(this).data('for')

        $(`#${id}`).addClass('selected')
        $(this).addClass('selected')
    })
})

getBuildsFromUser()
getInterestFromUser()
