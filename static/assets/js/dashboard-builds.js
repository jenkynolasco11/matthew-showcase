function buildTemplate(year, make, model, price, trim, options, img) {
    var opts = options.map(function (opt) {
        var key = opt.match(/\{.*\}/)[0]

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

$(document).ready(getBuildsFromUser)
