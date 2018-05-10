$(document).ready(function() {
    var url = window.location.href.split('/')
    var id = url[ url.length - 1 ].replace(/#$/g, '')
    var isReminded = window.localStorage.getItem(id)

    function openAuth() { authPanel.css('display','flex').hide().fadeIn(500) }
    // console.log(url, id, isReminded)
    $('#save-button').on('click', function(e) {
      e.preventDefault()
      let user = JSON.parse(window.sessionStorage.getItem('user'))
      if (user == null) {
        openAuth()
      }
      let userId = user._id
      console.log(` the user id is: ${user}`)
      console.log(`this is ${id}`)
      var url = `/car/${id}/like/${userId}`
      console.log(url)
      $.ajax({
        url: url,
        type: 'PUT',
        success: function(response) {
          if (response.ok) {
            $('#save-button i').toggleClass('fa-heart-o fa-heart')
          }
        }
      });
    })

    $('#compare-button').on('click', function(e) {
      let user = JSON.parse(window.sessionStorage.getItem('user'))
      if (user == null) {
        return openAuth()
      }
      window.location.href = `/dashboard?user-id=${user._id}&car-id=${id}`


    })

    if(isReminded !== 'true') {
        setTimeout(function() {
            var overlay = $('.popup-overlay')
            var closeHandler = $('.close-form')
            var stayInTouchForm = $('#stay-in-touch-form')

            if(overlay) $(overlay).css('display','flex').hide().fadeIn(500)
            if(closeHandler) $(closeHandler).on('click', function() {
                $(overlay).fadeOut(500)
            })

            if(stayInTouchForm) $(stayInTouchForm).submit(function(e) {
                e.preventDefault()

                var arr = $(this).serializeArray()
                var data = arr.reduce(function(p,n) {
                    var x = $.extend({}, p)

                    x[n.name] = n.value

                    return x
                }, {})

                $.post('/subscription/deal/new', data, function(data) {
                    if(data.ok) window.localStorage.setItem(id, 'true')
                })

                $(overlay).fadeOut(500)
            })
        }, 500)
    }
})
