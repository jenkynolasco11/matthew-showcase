/* Global variables */
"use strict";
// var somethingIsOpen = false
var $document = $(document),
	$window = $(window),
	plugins = {
		/* Main page */
		carouselServices: $('.swiper-container-services'),
		carouselModels: $('.swiper-container-models'),
		carouselBlockquote: $('.swiper-container-blockquote'),
		carouselPostList: $('.swiper-container-slider-format'),
		carouselRelated: $('.swiper-container-related'),
		backToTop: $('.scrollup'),
	};
var descwidth = window.innerWidth;

$document.ready(function () {
	if (plugins.backToTop.length) {
		$(window).scroll(function () {
			if ($(this).scrollTop() > 500) {
				$('.scrollup').fadeIn();
			} else {
				$('.scrollup').fadeOut();
			}
		});
		$('.scrollup').on("click", function () {
			$("html, body").animate({
				scrollTop: 0
			}, 600);
			return false;
		});

	}
	if (plugins.carouselModels.length) {
		var swiper_cars = new Swiper('.swiper-container-models', {
			pagination: '.swiper-pagination-models',
			slidesPerView: 2,
			initialSlide: 1,
			centeredSlides: true,
			paginationClickable: true,
			spaceBetween: 200,
			autoplay: 5000,
			grabCursor: true,
			speed: 1000,
			loop: true,
			nextButton: '.swiper-button-next',
			prevButton: '.swiper-button-prev',
			breakpoints: {
				767: {
					slidesPerView: 1,
					spaceBetween: 0
				}
			}
		});
	}

	if (plugins.carouselBlockquote.length) {
		var swiper_blockquote = new Swiper('.swiper-container-blockquote', {
			pagination: '.swiper-pagination-blockquote',
			slidesPerView: 2,
			paginationClickable: true,
			spaceBetween: 30,
			autoplay: 5000,
			speed: 1000,
			nextButton: '.swiper-button-next1',
			prevButton: '.swiper-button-prev1',
			breakpoints: {
				767: {
					slidesPerView: 1,
					spaceBetween: 10
				}
			}
		});
	}
	if (plugins.carouselRelated.length) {
		var swiper_blockquote = new Swiper('.swiper-container-related', {
			pagination: '.swiper-pagination-related',
			slidesPerView: 2,
			paginationClickable: true,
			spaceBetween: 30,
			autoplay: 5000,
			speed: 1000,
			nextButton: '.swiper-button-next1',
			prevButton: '.swiper-button-prev1',
			breakpoints: {
				768: {
					slidesPerView: 1,
					spaceBetween: 10
				}
			}
		});
	}
	if (plugins.carouselPostList.length) {
		var swiper_blockquote = new Swiper('.swiper-container-slider-format', {
			pagination: '.swiper-pagination-slider-format',
			slidesPerView: 1,
			paginationClickable: true,
			spaceBetween: 0,
			speed: 1000,
			nextButton: '.swiper-button-next-blog',
			prevButton: '.swiper-button-prev-blog',
		});
	}

	function initializeMap(_this) {

		var stylesArray = {
			//style 1
			'style-1': [{
				"featureType": "landscape",
				"stylers": [{
					"hue": "#FFBB00"
				}, {
					"saturation": 43.400000000000006
				}, {
					"lightness": 37.599999999999994
				}, {
					"gamma": 1
				}]
			}, {
				"featureType": "road.highway",
				"stylers": [{
					"hue": "#FFC200"
				}, {
					"saturation": -61.8
				}, {
					"lightness": 45.599999999999994
				}, {
					"gamma": 1
				}]
			}, {
				"featureType": "road.arterial",
				"stylers": [{
					"hue": "#FF0300"
				}, {
					"saturation": -100
				}, {
					"lightness": 51.19999999999999
				}, {
					"gamma": 1
				}]
			}, {
				"featureType": "road.local",
				"stylers": [{
					"hue": "#FF0300"
				}, {
					"saturation": -100
				}, {
					"lightness": 52
				}, {
					"gamma": 1
				}]
			}, {
				"featureType": "water",
				"stylers": [{
					"hue": "#0078FF"
				}, {
					"saturation": -13.200000000000003
				}, {
					"lightness": 2.4000000000000057
				}, {
					"gamma": 1
				}]
			}, {
				"featureType": "poi",
				"stylers": [{
					"hue": "#00FF6A"
				}, {
					"saturation": -1.0989010989011234
				}, {
					"lightness": 11.200000000000017
				}, {
					"gamma": 1
				}]
			}]
		};

		var styles, map, marker, infowindow,
			lat = $(_this).attr("data-lat"),
			lng = $(_this).attr("data-lng"),
			contentString = $(_this).attr("data-string"),
			image = $(_this).attr("data-marker"),
			styles_attr = $(_this).attr("data-style"),
			zoomLevel = parseInt($(_this).attr("data-zoom"), 10),
			myLatlng = new google.maps.LatLng(lat, lng);


		// style_1
		if (styles_attr == 'style-1') {
			styles = stylesArray[styles_attr];
		}
		// custom
		if (typeof hawa_style_map != 'undefined' && styles_attr == 'custom') {
			styles = hawa_style_map;
		}
		// or default style

		var styledMap = new google.maps.StyledMapType(styles, {
			name: "Styled Map"
		});

		var mapOptions = {
			zoom: zoomLevel,
			disableDefaultUI: true,
			center: myLatlng,
			scrollwheel: false,
			mapTypeControlOptions: {
				mapTypeIds: [google.maps.MapTypeId.ROADMAP, 'map_style']
			}
		};

		map = new google.maps.Map(_this, mapOptions);

		map.mapTypes.set('map_style', styledMap);
		map.setMapTypeId('map_style');

		infowindow = new google.maps.InfoWindow({
			content: contentString
		});

		marker = new google.maps.Marker({
			position: myLatlng,
			map: map,
			icon: image
		});

		google.maps.event.addListener(marker, 'click', function () {
			infowindow.open(map, marker);
		});

	}

	if ($('.wheel-map').length) {
		$('.wheel-map').each(function () {
			initializeMap(this);
		});
	}

	var button = $('.toggle-menu-button')

	button.on('click', function(el){
		// console.log(el)
		button.toggleClass('open')
		$('.mobile-menu-custom').toggleClass('open')
	})

	var collapseSubMenu = $('.has-submenu')

	// console.log(collapseSubMenu)

	if(collapseSubMenu) {
		$(collapseSubMenu).each(function() {
			var self = this
			$(this).on('click', function() {
				var collapsible = $(self).find('.wrap-inside-nav')
				collapsible.toggleClass('collapse')

				// somethingIsOpen = collapsible.hasClass('collapse')
			})
		})
	}

	var selectYear = $('#select-year')
	var selectMake = $('#select-make')
	var selectModel = $('#select-model')
	var submitCarBuild = $('#submit-car-build')
	var buildCarAppFor = $('#build-car-app')

	selectYear.val('none')
	selectMake.val('none')
	selectModel.val('none')

	selectYear.on('change', function() {
		if($(this).val() === 'none') {
			selectMake.attr('disabled', true)
			selectModel.attr('disabled', true)
			submitCarBuild.attr('disabled', true)
		} else {
			selectMake.removeAttr('disabled')
		}

		$.get('/car/build?year=' + $(this).val(), function(data) {
			selectMake.html('')
			selectMake.append($('<option value="none">Select Make</option>'))

			data.makes.forEach(function(make) {
				selectMake.append($('<option value="' + make + '">' + make + '</option>'))
			})
		})
	})

	selectMake.on('change', function() {
		if($(this).val() === 'none') selectModel.attr('disabled', true)
		else selectModel.removeAttr('disabled')

		$.get('/car/build?year=' + $(selectYear).val() + '&make=' + $(this).val(), function(data) {
			selectModel.html('')
			selectModel.append($('<option value="none">Select Model</option>'))

			data.models.forEach(function(model) {
				selectModel.append($('<option value="' + model + '">'+ model +'</option>'))
			})
		})
	})

	selectModel.on('change', function() {
		if($(this).val() === 'none') return submitCarBuild.attr('disabled', true)
		else return submitCarBuild.removeAttr('disabled')
	})

	buildCarAppFor.on('submit', function(e) {
		e.preventDefault()

		var year = $(selectYear).val()
		var make = $(selectMake).val()
		var model = $(selectModel).val()

		// window.location.href = '/build-car/trim?year=' + year + '&make=' + make + '&model=' + model + '&build=' + (100000000000000 * Math.random()).toString(16)
		var link = '/car/build/trim?options=' + year + '|' + make + '|' + model + '&build=' + (100000000000000 * Math.random()).toString(16)

		// window.history.pushState(null, null, link)
		window.location.href = link
		// $.get('/build-car?year=' + year + '&make=' + make + '&model=' + model, function(data) {})
		// $.get('/trim', { year : year, make : make, model : model })
	})

	var closeNewsletter = $('#subscribe-newsletter .close-newsletter')[ 0 ]

	function fadeNewsletter() {
		$('.newsletter-overlay').fadeOut(500, function() {
			setTimeout(function(self) {
				$(self).remove()
			}, 1000, this)
		})
	}

	if(closeNewsletter) $(closeNewsletter).on('click', fadeNewsletter)

	var subscribeForm = $('#subscribe-form')

	if(subscribeForm) {
		subscribeForm.submit(function(e) {
			e.preventDefault()

			var data = $(this).serializeArray().reduce(function(p, n) {
				var x = $.extend({}, p)

				x[ n.name ] = n.value

				return x
			}, {})

			$.post('/subscription/newsletter/new', data, function(res) {
				if(res.ok) window.localStorage.setItem('subscribed', 'yes')

				$('#subscribe-form').fadeOut(500, function() {
					$('.thanks-section').css('display', 'flex').hide().fadeIn(500, function() {
						setTimeout(fadeNewsletter, 3000)
					})
				})
				// if(res.ok) {

				// }
			})

			// console.log(data)
		})
	}

	var itAppeared = false

	$(window).on('scroll', function(e) {
		if(window.pageYOffset > $(document).height() * 0.4) {
			if(!itAppeared) {
				itAppeared = true

				var isSubscribed = window.localStorage.getItem('subscribed')

				if(isSubscribed !== 'yes') $('.newsletter-overlay').delay(2000).css('display', 'flex').hide().fadeIn(500)
			}
		}
	})

	$.get('/instagram/photos', function(response) {
		var feedPics = response.data.reduce(function(prev, next) {
			var tag = ' \
			<div class="car col-xm-3"> \
				<a href="' + next.link + '" target="_blank">\
					<img class="img-responsive" src="'+ next.images.standard_resolution.url +'" alt="car-prop"> \
				</a> \
			</div>'

			return prev + tag
		}, '')

		$('#instagram-feed').html($(feedPics))
	})

	$.get('/car/build/trending', function(data) {
		var trending = $('#trending-builds')

		if(trending && data.ok) {
			var items = ''

			data.builts.forEach(function(car) {
				items += `
					<li>
						<a href="${ car.url || '#' }">${ car.year } ${ car.make } ${ car.model }</a>
					</li>
				`
			})

			trending.html(items)
		}
	})
});


// $(document).on('click', function() {
// 	var collapseSubMenu = $('.has-submenu')

// 	if(somethingIsOpen) {
// 		if(collapseSubMenu) {
// 			$(collapseSubMenu).each(function() {
// 				var collapsible = $(this).find('.wrap-inside-nav')
// 				if(collapsible.hasClass('collapse')) collapsible.removeClass('collapse')
// 			})
// 		}
// 	}
// })

function undateMenu() {
	var scrollTop = window.pageYOffset;
	// var bg =
	var menu = $('.custom-header-menu');

	if (scrollTop => 150 || $(window).width() < 993) {
		if (scrollTop > 150) {
			menu.addClass('active-scroll');
			$('.bg-grey').addClass('stay-top')
		} else if(scrollTop < 100) {
			menu.removeClass('active-scroll');
			$('.bg-grey').removeClass('stay-top')
		}

	} else if (scrollTop < 120 || $(window).width() > 993) {
		menu.removeClass('active-scroll');
	}

	if(window.innerWidth >= 768) {
		$('.toggle-menu-button').removeClass('open')
		$('.mobile-menu-custom').removeClass('open')
	}
}

undateMenu()

$(window).on('scroll', undateMenu)
$(window).on('load resize', undateMenu)

var contactForm = $('#contact-form')
var sellingForm = $('#selling-form')
var creditAppForm = $('#credit-app-form')
var contactForm2 = $('#contact-form-2')

// console.log(contactForm, contactForm2)

$.each([ contactForm2, contactForm ], function() {
	// console.log(this)
	if(this) {
		$(this).submit(function(e) {
			return submitInformation(e, 'Contact Us', $(this))
		})
	}
})

sellingForm.submit(function(e){
	return submitInformation(e, 'Cash For Cars', sellingForm)
})
creditAppForm.submit(function(e){
	return submitInformation(e, 'Credit App', creditAppForm)
})

function submitInformation(e, type, form) {
	e.preventDefault()

	var formData = {}
	formData.type = type

	submitForm(form, formData)
}

function submitForm(form, formData) {
	var arr = form.serializeArray()
	var data = arr.reduce(function(p,n) {
		var x = $.extend({}, p)

		x[n.name] = n.value

		return x
	}, formData);

	// console.log(data)

	// console.log('Before sending...')

	$.post('/data', data)

	form.each(function(){ this.reset(); });

	openModal();
}

// if($('#modal-close')) {
// 	// $('#modal-close').click(function(){
// 	// 	var modal = $('#myModal')
// 	// 	modal.fadeOut()
// 	// });
// }

function openModal(fn) {
	var modal = $('#myModal')
	modal.fadeIn()

	$('#modal-close').click(function(){
		var modal = $('#myModal')
		modal.fadeOut()

		if(fn) return fn()
	});

	setTimeout(function(){
		modal.fadeOut();
		if(fn) return fn()
	}, 2400)
}

///////////////
var descwidth = window.innerWidth;

function getInternetExplorerVersion() {
	var rv = -1;
	if (navigator.appName == 'Microsoft Internet Explorer') {
		var ua = navigator.userAgent;
		var re = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
		if (re.exec(ua) != null)
			rv = parseFloat(RegExp.$1);
	} else if (navigator.appName == 'Netscape') {
		var ua = navigator.userAgent;
		var re = new RegExp("Trident/.*rv:([0-9]{1,}[\.0-9]{0,})");
		if (re.exec(ua) != null)
			rv = parseFloat(RegExp.$1);
	}
	return rv;
}
if (getInternetExplorerVersion() !== -1) {
	$("html").addClass("ie");
}

var cssFix = function () {
	var u = navigator.userAgent.toLowerCase(),
		is = function (t) {
			return (u.indexOf(t) != -1)
		};
	$("html").addClass([
		(!(/opera|webtv/i.test(u)) && /msie (\d)/.test(u)) ? ('ie ie' + RegExp.$1) :
		is('firefox/2') ? 'gecko ff2' :
		is('firefox/3') ? 'gecko ff3' :
		is('gecko/') ? 'gecko' :
		is('opera/9') ? 'opera opera9' : /opera (\d)/.test(u) ? 'opera opera' + RegExp.$1 :
		is('konqueror') ? 'konqueror' :
		is('applewebkit/') ? 'webkit safari' :
		is('mozilla/') ? 'gecko' : '',
		(is('x11') || is('linux')) ? ' linux' :
		is('mac') ? ' mac' :
		is('win') ? ' win' : ''
	].join(''));
}();
