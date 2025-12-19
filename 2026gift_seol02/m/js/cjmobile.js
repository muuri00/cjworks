function mobile(dataObj) {
  var base = this;

  base.module = {
    model: {
      forwarding: {
        cover: '',
        intro: '',
        cjrecommend: 'contents/page1.html',
        specialchoice: 'contents/page2.html',
        spam: 'contents/page3.html',
        beksul: 'contents/page4.html',
        bibigo: 'contents/page5.html',
        hanppuri: 'contents/page6.html',
        cheilmyungin: 'contents/page7.html',
        leGouter: 'contents/page8.html',
        ending: ''
      }
    },

    control: {
      loader: function (target, url, callback) {
        if (!target || !url) return;
        $.ajax({
          cache: false,
          url: url,
          dataType: 'html',
          success: function (data) { base.module.view.html(target, data, callback); },
          error: function (xhr, status, err) {
            console.error('[LOADER ERROR]', url, status, err, xhr && xhr.status);
          }
        });
      },
      appendNumber: function () {
        $('.owl-page span').each(function (i) { $(this).text(i + 1); });
      },
      expaned: function () {
        $('.head .exp').on('click', function () { $('.gnb').css('display', 'block'); });
        $('.gnb .close').on('click', function () { $('.gnb').css('display', 'none'); });
      },
      forwarding: function () {
        var locurl = location.href;
        if (locurl.indexOf('#') !== -1) {
          var pageName = locurl.substr(locurl.indexOf('#') + 1).replace(' ', '').replace(';', '');
          try { var url = base.module.model.forwarding[pageName]; if (url) location.href = url; } catch (e) {}
        }
      }
    },

    view: {
      html: function (target, data, callback) {
        $(target).html(data);
        if (typeof callback === 'function') callback();
      },

      init: function () {
        base.module.control.loader('.head', dataObj.header, function () {
          base.module.control.loader('.gnb', dataObj.gnb, base.module.control.expaned);
        });

        if ($('body').attr('main')) {
          base.module.control.loader('#mainslide', dataObj.product, base.module.view.response);
        } else {
          base.module.view.response();
        }

        base.module.view.footer();
      },

      footer: function () {
        var footer = '/m/inc/footer.html';
        try { footer = dataObj.footer; } catch (e) {}
        base.module.control.loader('.footer', footer);
      },

      _guessHrefBase: function ($slide) {
        var href = $slide.find('a[href*="page"]').attr('href') || '';
        var m = href.match(/^(.*\/)?page\d+(\.html?)?/i);
        return {
          prefix: (m && (m[1] || '')) || '../contents/',
          ext: (m && (m[2] || '.html')) || '.html'
        };
      },
      _guessImgBase: function ($slide) {
        var img = $slide.find('img').attr('src') || $slide.find('img').attr('data-src') || '';
        var m = img.match(/^(.*\/)\d+(\.[a-z0-9]+)(?:[?#].*)?$/i);
        return {
          dir: (m && m[1]) || '../img/goods/main/',
          ext: (m && m[2]) || '.png'
        };
      },

      rebuildSlidesStrict: function ($slide) {
        var hrefBase = base.module.view._guessHrefBase($slide);
        var imgBase  = base.module.view._guessImgBase($slide);

        // 현재 DOM에서 pageN 앵커를 수집(있으면 재사용, 없으면 새로 만듦)
        var foundMap = {}; // N -> <a>
        $slide.find('a[href]').each(function () {
          var h = this.getAttribute('href') || '';
          var m = h.match(/page([1-8])\.html?/i);
          if (m) {
            var n = parseInt(m[1], 10);
            if (!foundMap[n]) foundMap[n] = this; // 최초만 채택
          }
        });

        // 정확히 1~8로 재구성
        var frag = document.createDocumentFragment();
        for (var n = 1; n <= 8; n++) {
          var a;
          if (foundMap[n]) {
            // 앵커 재사용하되, 내부 이미지를 강제로 n번으로 보정
            a = $(foundMap[n]).clone(false, false)[0];
          } else {
            // 없으면 새로 생성
            a = document.createElement('a');
            a.setAttribute('href', hrefBase.prefix + 'page' + n + hrefBase.ext);
          }

          var img = (a.querySelector && a.querySelector('img')) || null;
          if (!img) {
            img = document.createElement('img');
            a.appendChild(img);
          }
          img.removeAttribute('data-src');
          img.classList.remove('lazyOwl');
          img.setAttribute('src', imgBase.dir + n + imgBase.ext);
          img.setAttribute('alt', '');

          var item = document.createElement('div');
          item.className = 'item';
          item.appendChild(a);
          frag.appendChild(item);
        }

        $slide.empty()[0].appendChild(frag);
      },

      // ========== 캐러셀 초기화 ==========
      response: function () {
        try {
          var isMain = $('body').is('[main]');
          var autovar = (window.location.href.indexOf('main') > -1) ? 1800 : 20000;
          var $slide = $('#mainslide');
          if ($slide.length === 0) return;
          if ($slide.data('owlInitDone')) return;

          // 메인이라면 정확히 page1~8로 재구성(복제 pad 금지)
          if (isMain) {
            base.module.view.rebuildSlidesStrict($slide);
          } else {
            // 서브: 직계 엘리먼트 .item 보정만
            $slide.children().each(function () {
              if (this.nodeType === 1 && !/\bitem\b/.test(this.className || '')) {
                this.className = (this.className ? this.className + ' ' : '') + 'item';
              }
            });
          }

          // lazy 해제 + 가시성 강제
          $slide.find('img[data-src]').each(function () {
            var s = this.getAttribute('data-src');
            if (s) { this.src = s; this.removeAttribute('data-src'); }
            this.classList.remove('lazyOwl');
          });
          $slide.find('img').css({ opacity: 1, visibility: 'visible', display: 'block', width: '100%', height: 'auto' });

          if (!$slide.hasClass('owl-carousel')) $slide.addClass('owl-carousel');

          $slide.owlCarousel({
            autoPlay: autovar,
            stopOnHover: true,
            navigation: false,
            pagination: true,
            paginationNumbers: !isMain,
            paginationSpeed: 800,
            goToFirstSpeed: 800,
            singleItem: true,
            autoHeight: true,
            lazyLoad: false,
            afterInit: function () {
              var dots = $slide.find('.owl-page').length;
              console.log('[owl afterInit] dots=', dots);
            }
          });

          // 기본 버튼 제거
          $slide.find('.owl-buttons, .owl-prev, .owl-next').remove();

          if (!isMain) {
            try { base.module.control.appendNumber(); } catch (e) {}
          }

          $slide.data('owlInitDone', true);
        } catch (e) {
          console.error('response() error:', e);
        }
      }
    }
  };
}
