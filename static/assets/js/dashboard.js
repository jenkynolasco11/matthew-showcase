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

function getBuildsFromUser() {
    var usr = JSON.parse(window.sessionStorage.getItem('user'))

    if(usr) {
        var userId = usr._id
        $.get(`/car/build/user/${ usr.email }`, function(data) {
            if(data.ok) {
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
