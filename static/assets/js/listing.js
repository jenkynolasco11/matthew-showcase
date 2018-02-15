var carListingTemplate = function(i, src, price, msrp, make, model, overview, mileage, year, trans, hp, engine, features, id) {
    return (
        `
        <section class="b-goods-1">
            <div class="row">
                <div class="b-goods-1__img">
                    <a class="js-zoom-images" href="${src}">
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
                            <a href="details/${id}">${make} ${model}</a>
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
                        <h3 class="b-goods-1__title collapsed" data-toggle="collapse" data-target="#list-${ i }" aria-expanded="falses">specifications</h3>
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

var retrieveAllCars = function() {
    $.get(`/car/all`, function(data) {
        if(data.ok) {
            var listingSection = $('#listing-section')

            data.cars.forEach(function(car, i) {
                var mainImg = car.imgs.filter(function(img) { return img.main })[ 0 ]
                if(!mainImg && !car.imgs[ 0 ]) mainImg = { src : 'assets/images/item_img-1.jpg' }
                else if(!mainImg && car.imgs[ 0 ]) mainImg = car.imgs[ 0 ]

                listingSection.append($(carListingTemplate(
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
                )))
            })
        }
    })
}

retrieveAllCars()
