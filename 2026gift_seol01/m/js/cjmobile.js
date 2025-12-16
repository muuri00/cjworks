function mobile(dataObj) {
  var base = this;
  base.module = {
    model: {
      forwarding: {
        cover: '',
        intro: '',
        specialset: 'contents/page1.html',
        beksulpremium: 'contents/page2.html',
        beksulsesameoil: 'contents/page3.html',
        spam: 'contents/page4.html',
        cjalaskasalmon: 'contents/page5.html',
        hanppuri: 'contents/page6.html',
        freshianlaver: 'contents/page7.html',
        prices: 'contents/page8.html',
        ending: '',
      },
    },

    control: {
      loader: function (target, url, callback) {
        if (!target || !url) return;
        $.ajax({
          url: url,
          dataType: 'html',
          success: function (data) {
            base.module.view.html(target, data, callback);
          },
          error: function () {},
        });
      },
      appendNumber: function () {
        $('.owl-page span').each(function (c) {
          $(this).text(c + 1);
        });
      },
      expaned: function () {
        $(".head .exp").bind('click', function (e) {
          $(".gnb").css('display', 'block');
        });
        $('.gnb .close').bind('click', function (e) {
          $('.gnb').css('display', 'none');
        });
      },
      forwarding: function () {
        var locurl = location.href;
        if (locurl.indexOf('#') != -1) {
          var pageName = locurl.substr(locurl.indexOf('#') + 1);
          pageName = pageName.replace(' ', '');
          pageName = pageName.replace(';', '');

          try {
            var url = base.module.model.forwarding[pageName];
            if (url) location.href = url;
          } catch (e) {}
        }
      },
    },

    view: {
      html: function (target, data, callback) {
        $(target).html(data);
        if (typeof callback == 'function') callback();
      },
      init: function (a) {
        base.module.control.loader('.head', dataObj.header, function () {
          base.module.control.loader(
            '.gnb',
            dataObj.gnb,
            base.module.control.expaned
          );
        });
        if ($('body').attr('main'))
          base.module.control.loader(
            '#mainslide',
            dataObj.product,
            base.module.view.response
          );
        else base.module.view.response();
        base.module.view.footer();
      },
      footer: function () {
        var footer = '/m/inc/footer.html';
        try {
          footer = dataObj.footer;
        } catch (e) {}
        base.module.control.loader('.footer', footer);
      },
      response: function () {
        try {
          var currentUrl = window.location.href;
          var autoParam = currentUrl.indexOf('main');

          if (autoParam > 1) {
            autovar = 1800;
          } else {
            autovar = 20000;
          }
          $('#mainslide').owlCarousel({
            autoPlay: autovar,
            stopOnHover: true,
            navigation: true,
            paginationSpeed: 800,
            goToFirstSpeed: 800,
            singleItem: true,
            autoHeight: 0,
            transitionStyle: 'fade',
            lazyLoad: true,
            //																		paginationNumbers : true,
          });

          $('#mainslide .owl-buttons').remove();
          if (!$('body').attr('main')) {
            base.module.control.appendNumber();
          } else {
            $(document).on('click', '.arrow.prev', function () {
              button.prev();
            });
            $(document).on('click', '.arrow.next', function () {
              button.next();
            });
          }
        } catch (e) {
          // main is no.
        }
      },
    },
  };
}