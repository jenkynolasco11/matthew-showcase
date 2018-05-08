var selectors = $('.user-nav li')
var sections = $('.selected-item-content')

function removeClassTo(cls, items) {
    $(items).each(function() {
        $(this).removeClass(cls)
    })
}

selectors.each(function(){
    $(this).on('click', function() {

        removeClassTo('selected', selectors)
        removeClassTo('selected', sections)

        var id = $(this).data('for')

        console.log(id)

        $(`#${id}`).addClass('selected')
        $(this).addClass('selected')
    })
})
