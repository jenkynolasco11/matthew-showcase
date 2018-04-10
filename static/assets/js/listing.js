var skipHandler = 0
var limit = 10

var carListingTemplate = function(i, src, price, msrp, make, model, overview, mileage, year, trans, hp, engine, features, id) {
    return (
        `
        <section class="b-goods-1">
            <div class="row">
                <div class="b-goods-1__img">
                    <a class="js-zoom-images" href="/details/${id}">
                        <img class="img-responsive" src="${src}" alt="foto" />
                    </a>
                </div>
                <div class="b-goods-1__inner">
                    <div class="b-goods-1__header">
                        <span class="b-goods-1__price hidden-th">$${price}
                            <span class="b-goods-1__price-msrp">MSRP $${msrp}</span>
                        </span>
                        <a class="b-goods-1__choose hidden-th" href="#">
                            <i class="icon fa fa-heart-o"></i>
                        </a>
                        <h2 class="b-goods-1__name">
                            <a href="details/${id}">${year} ${make} ${model}</a>
                        </h2>
                    </div>
                    <div class="b-goods-1__info">${overview /*.slice(0,50)*/}</span>
                        <!-- <span class="b-goods-1__info-link" data-toggle="collapse" data-target="#info-${ i }"></span> -->
                    </div>
                    <span class="b-goods-1__price_th text-primary visible-th">$45,000
                        <span class="b-goods-1__price-msrp">MSRP $27,000</span>
                        <a class="b-goods-1__choose" href="#">
                            <i class="icon fa fa-heart-o"></i>
                        </a>
                    </span>
                    <div class="b-goods-1__section">
                        <h3 class="b-goods-1__title" data-toggle="collapse" data-target="#desc-${ i }">Highlights</h3>
                        <div class="collapse in" id="desc-${ i }">
                            <ul class="b-goods-1__desc list-unstyled">
                                <li class="b-goods-1__desc-item">${mileage} mi</li>
                                <li class="b-goods-1__desc-item">
                                    <span class="hidden-th">Model:</span> ${year}</li>
                                <li class="b-goods-1__desc-item">${trans.slice(0,4) === 'auto' ? 'Auto' : 'Manual'}</li>
                                <li class="b-goods-1__desc-item hidden-th">${hp} hp</li>
                            </ul>
                        </div>
                    </div>
                    <div class="b-goods-1__section hidden-th">
                        <h3 class="b-goods-1__title collapsed" data-toggle="collapse" data-target="#list-${ i }" aria-expanded="false">specifications</h3>
                        <div class="collapse" id="list-${ i }">
                            <ul class="b-goods-1__list list list-mark-5 list_mark-prim">
                                ${
                                    features.reduce(function(p, feat){
                                        return `${p}<li class="b-goods-1__list-item">${ feat }</li>`
                                    },'')
                                }
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        `
    )
}
/* Pagination */

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

var createPagination = function(total) {
    var pageArea = $('#pagination-section')
    var pages = Math.ceil(total/limit)
    var itms = ''

    for(var i = 1; i <= pages; i++) {
        itms += `
        <li class="paginate-item paginate-page ${ i-1 === skipHandler ? 'active' : '' }" data-skip=${ i - 1 }>
            <a href=#>
                ${ i }
            </a>
        </li>
        `
    }

    pageArea.html(paginationTemplate(itms))

    $('.paginate-nav').each(function() {
        $(this).on('click', function(e) {
            e.preventDefault()

            var i = $(this).data('increase')

            if(skipHandler + i >= 0 && skipHandler + i < pages) {
                skipHandler += i

                return getSelectedOptions()
            }
        })
    })

    $('.paginate-page').on('click', function(e) {
        e.preventDefault()

        skipHandler = $(this).data('skip')

        return getSelectedOptions()
    })

}
/* ************ */

var retrieveAllCars = function(url) {
    $.get(url, function(data) {
        if(data.ok) {
            var listingSection = $('#listing-section')

            var carItems = data.cars.map(function(car, i) {
                var mainImg = car.imgs.filter(function(img) { return img.main })[ 0 ]
                if(!mainImg && !car.imgs[ 0 ]) mainImg = { src : 'assets/images/item_img-1.jpg' }
                else if(!mainImg && car.imgs[ 0 ]) mainImg = car.imgs[ 0 ]

                return $(carListingTemplate(
                    i + 1,
                    mainImg.src,
                    car.price,
                    car.msrp,
                    car.make,
                    car.model,
                    car.overview,
                    car.mileage,
                    car.year,
                    car.transmission,
                    car.hp,
                    car.engine,
                    car.extraFeatures,
                    car.id
                ))
            })

            listingSection.html(carItems)

            createPagination(data.count)
        }
    })
}

var generateOptions = function(items) {
    var options = ''

    items.forEach(function(item){
        options += `<option>${ item }</option>`
    })

    return options
}

var timeoutPromise = null
var getSelectedOptions = function() {
    clearTimeout(timeoutPromise)

    timeoutPromise = setTimeout(function() {
        var sortOption = $('[data-id=sort-item]').attr('title') === 'A-Z' ? 1 : -1
        var make = $('[data-id=filter-make]').attr('title')
        var model = $('[data-id=filter-model]').attr('title')
        var years = $('#slider-year .noUi-origin .noUi-handle').map(function() {
            return $(this).attr('aria-valuetext').replace(/\s/g, '')
        }).toArray()
        var prices = $('#slider-price .noUi-origin .noUi-handle').map(function() {
            return $(this).attr('aria-valuetext').replace(/\$/g, '')
        }).toArray()

        var fuel = $('[data-id=filter-fuel]').attr('title')
        var carOption = $('[name=car-type]:checked').val()

        var transOptions = $('#transmission-opts [type=checkbox]:checked').map(function() {
            return $(this).val()
        }).toArray()

        // $.get(`/filter/request?make=${ make }&model=${ model }&years=${ years.join(',') }&prices=${ prices.join(',') }&fuel=${ fuel }&transmission=${ transOptions.join(',') }&bodyType=${ carOption }&limit=10&skip=${ 0 }`, function(data) {
        //     console.log('request ended.')
        //     console.log(data)
        // })

        // console.log(make, model, years[0], years[1], prices[0], prices[1], fuel, transOptions)

        // console.log('Something changed...')
        retrieveAllCars(`/filter/request?make=${ make }&model=${ model }&years=${ years.join(',') }&prices=${ prices.join(',') }&fuel=${ fuel }&transmission=${ transOptions.join(',') }&bodyType=${ carOption }&limit=${ limit }&skip=${ skipHandler }&sortBy=${ sortOption }`)
    }, 50)
}

var rerender = function() { $('.selectpicker').selectpicker('refresh') }

var handleMakeChange = function() {
    setTimeout(function() {
        var make = $('[data-id=filter-make]').attr('title')
        skipHandler = 0

        $.get('/filter/desc?make=' + make, function(data) {
            // var minYear = $('#filter-year-min')
            // var maxYear = $('#filter-year-max')
            var models = $('#filter-model')

            var options = generateOptions(data)

            models.html('<option>All Models</option>' + options)
            // models.append(options)

            rerender()
        })
    }, 50)
}

var formOnChange = function(e) {
    var element = $(e.target)
    var id = element.attr('id')

    if(id.match(/^filter-/)) {
        var elType = id.slice(7)
        var options = []
        var promise = null

        if(elType === 'make') handleMakeChange()
        // if(/^year-/.test(elType)) {
        //     // console.log('year moved')
        // }
    }

    // console.log(element)
    return getSelectedOptions()
}

$('.b-filter-2.bg-grey :input').on('change', formOnChange)
$('#sort-item').on('change', formOnChange)
$('#slider-year, #slider-price').each(function() {
    $(this).on('click', getSelectedOptions)
})

getSelectedOptions()
